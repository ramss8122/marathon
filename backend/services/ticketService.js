/**
 * ticketService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates automatic PDF ticket generation + email delivery after a
 * runner completes registration.
 *
 * Pipeline:
 *   1. Generate QR code as a base64 data URL (qrcode)
 *   2. Render the ticket HTML → PDF buffer (Puppeteer)
 *   3. Send confirmation email with PDF attachment (Nodemailer)
 *
 * This module is intentionally async-fire-and-forget safe:
 *   call sendTicketEmail(regDoc) and the caller does NOT need to await.
 *   Errors are caught and logged without crashing the request.
 */

import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { buildTicketHtml, buildConfirmationEmailHtml, resolveEventDefaults } from './ticketEmailTemplate.js';

// ── Bib number helpers (same logic as registrationController) ─────────────────
import Registration from '../models/Registration.js';

async function generateUniqueBib() {
  const MAX_ATTEMPTS = 20;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate = String(Math.floor(1000 + Math.random() * 9000));
    const existing = await Registration.findOne({ bibNumber: candidate });
    if (!existing) return candidate;
  }
  return String(Date.now()).slice(-6);
}

// ── SMTP transport factory ────────────────────────────────────────────────────
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

// ── Main exported function ────────────────────────────────────────────────────
/**
 * sendTicketEmail(regDoc)
 *
 * Generates a PDF ticket and emails it to the registrant.
 * Designed to be called fire-and-forget (no need to await at call site).
 *
 * @param {Object} regDoc - Mongoose Registration document (plain object or doc)
 */
export async function sendTicketEmail(regDoc) {
  try {
    const reg = regDoc.toObject ? regDoc.toObject() : regDoc;

    // ── 1. Assign bib number if missing ────────────────────────────────────
    let bibNumber = reg.bibNumber || '';
    if (!bibNumber) {
      bibNumber = await generateUniqueBib();
      await Registration.findByIdAndUpdate(reg._id, { bibNumber });
      reg.bibNumber = bibNumber;
    }

    // ── 2. Resolve event metadata ───────────────────────────────────────────
    const defaults = resolveEventDefaults(reg.selectedEvent, reg.city);
    const eventName     = reg.eventName     || defaults.eventName;
    const eventDate     = reg.eventDate     || defaults.eventDate;
    const eventVenue    = reg.eventVenue    || defaults.eventVenue;
    const flagOffTime   = reg.flagOffTime   || defaults.flagOffTime;
    const gatesOpenTime = reg.gatesOpenTime || defaults.gatesOpenTime;

    const dist        = (reg.distance || reg.raceCategory || '5K').split(',')[0].trim().toUpperCase().replace(/\s+/g, '');
    const ticketCode  = `RUN-${dist}-${bibNumber}`;

    // ── 3. Generate QR code (data URL) ─────────────────────────────────────
    const qrPayload = JSON.stringify({
      ref: reg.registrationRef,
      bib: bibNumber,
      name: reg.fullName,
      event: eventName
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 200,
      margin: 2,
      color: { dark: '#1E293B', light: '#FFFFFF' }
    });

    // ── 4. Build ticket HTML ────────────────────────────────────────────────
    const ticketHtml = buildTicketHtml({
      runnerName:      reg.fullName,
      email:           reg.email,
      eventName,
      eventDate,
      eventVenue,
      flagOffTime,
      gatesOpenTime,
      distance:        reg.distance     || reg.raceCategory || '5K',
      raceCategory:    reg.raceCategory || reg.distance     || '5K',
      tshirtSize:      reg.tshirtSize   || '—',
      bloodGroup:      reg.bloodGroup   || '—',
      amount:          reg.amount       || 0,
      registrationRef: reg.registrationRef,
      bibNumber,
      ticketCode,
      qrDataUrl
    });

    // ── 5. Render PDF via Puppeteer ─────────────────────────────────────────
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setContent(ticketHtml, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      width:  '800px',
      height: '380px',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });
    await browser.close();

    // ── 6. Build email HTML body ────────────────────────────────────────────
    const emailHtml = buildConfirmationEmailHtml({
      runnerName:      reg.fullName,
      eventName,
      eventDate,
      eventVenue,
      distance:        reg.distance     || reg.raceCategory || '5K',
      bibNumber,
      registrationRef: reg.registrationRef,
      flagOffTime,
      tshirtSize:      reg.tshirtSize   || '—',
      amount:          reg.amount       || 0
    });

    // ── 7. Send email ───────────────────────────────────────────────────────
    const transporter = createTransporter();
    if (!transporter) {
      console.warn('[TicketService] SMTP not configured – PDF generated but email not sent.');
      return { success: false, reason: 'SMTP not configured' };
    }

    const mailFromName    = process.env.MAIL_FROM_NAME    || 'RUNTRUST Marathon';
    const mailFromAddress = process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER;
    const from = `"${mailFromName}" <${mailFromAddress}>`;

    const safeFirstName = (reg.fullName || 'Runner').split(' ')[0];

    const info = await transporter.sendMail({
      from,
      to:      reg.email,
      subject: `🏃 Your RUNTRUST Race Ticket – ${eventName} (Bib #${bibNumber})`,
      text:    `Hi ${safeFirstName}, your RUNTRUST race ticket is attached. Ref: ${reg.registrationRef}. See you on race day!`,
      html:    emailHtml,
      attachments: [
        {
          filename:    `RUNTRUST-Ticket-${reg.registrationRef}.pdf`,
          content:     pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log(`[TicketService] ✅ Ticket sent to ${reg.email} | MsgId: ${info.messageId} | Ref: ${reg.registrationRef}`);
    return { success: true, messageId: info.messageId };

  } catch (err) {
    console.error('[TicketService] ❌ Failed to send ticket:', err.message);
    return { success: false, error: err.message };
  }
}
