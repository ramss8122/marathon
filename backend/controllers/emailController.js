import nodemailer from 'nodemailer';
import Email from '../models/Email.js';
import ContactMessage from '../models/ContactMessage.js';
import Registration from '../models/Registration.js';
import Campaign from '../models/Campaign.js';
import { isDbReady } from '../config/db.js';
import { processMailQueue } from '../services/mailQueue.js';

// Check if SMTP is configured in environment
export const isSmtpConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

// Generate HTML email template with red RunTrust header and dark footer
export const generateEmailTemplate = (subject, bodyContent) => {
  const safeBody = (bodyContent || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject || 'India RunTrust'}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF8F5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
    }
    .wrapper {
      width: 100%;
      background-color: #FAF8F5;
      padding: 24px 0;
    }
    .email-container {
      max-width: 620px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
    }
    .email-header {
      background: #A51C1F;
      padding: 28px 32px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 1.2px;
      font-family: Georgia, serif;
    }
    .email-header p {
      margin: 4px 0 0;
      color: #FEE2E2;
      font-size: 12px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .email-body {
      padding: 32px 32px 28px;
      font-size: 15px;
      line-height: 1.7;
      color: #334155;
    }
    .email-footer {
      background: #0F172A;
      padding: 22px 32px;
      text-align: center;
      color: #94A3B8;
      font-size: 12px;
      line-height: 1.6;
      border-top: 1px solid #E2E8F0;
    }
    .email-footer p {
      margin: 0 0 4px;
    }
    .email-footer a {
      color: #F87171;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>INDIA RUNTRUST</h1>
        <p>Official Marathon Communications</p>
      </div>
      <div class="email-body">
        ${safeBody}
      </div>
      <div class="email-footer">
        <p><strong>INDIA RUNTRUST</strong> &bull; Promoting Health, Athletics &amp; Community</p>
        <p>Besant Nagar Promenade, Chennai, Tamil Nadu, India</p>
        <p style="margin-top: 8px; color: #64748B; font-size: 11px;">
          This email was sent to you regarding your registration or inquiry with India RunTrust.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

// ── Race ticket HTML generator ────────────────────────────────────────────────
// Builds the full inline-HTML race ticket matching the existing visual design.
// The "Kit collection" line uses "Saturday & Sunday" per B requirement.
export const generateTicketHtml = (t) => {
  // t = { runnerName, eventName, eventDate, eventVenue, flagOffTime, gatesOpenTime,
  //        distance, raceCategory, tshirtSize, bloodGroup, amount,
  //        registrationRef, bibNumber, ticketCode, discountCode }
  const amountFormatted = '\u20B9' + Number(t.amount).toLocaleString('en-IN');
  const distLabel = (t.distance || t.raceCategory || '5K').split(',')[0].trim();

  return `
<!-- RUNTRUST RACE TICKET -->
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:24px auto;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.13);border:1px solid #D1D5DB;">

  <!-- MAIN TICKET BODY -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#7B1113;">
    <tr>
      <!-- LEFT: Runner / Event Info -->
      <td style="padding:28px 24px;vertical-align:top;width:66%;">
        <!-- Header bar -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          <tr>
            <td>
              <span style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#FCA5A5;text-transform:uppercase;">&#9680; INDIA RUNTRUST</span>
            </td>
            <td style="text-align:right;">
              <span style="background:rgba(255,255,255,0.15);color:#FFFFFF;font-size:9px;font-weight:700;letter-spacing:1px;padding:3px 8px;border-radius:20px;text-transform:uppercase;">OFFICIAL RACE TICKET</span>
            </td>
          </tr>
        </table>

        <!-- Runner label -->
        <div style="font-size:10px;font-weight:600;letter-spacing:1.2px;color:#FCA5A5;text-transform:uppercase;margin-bottom:4px;">RUNNER</div>
        <!-- Runner name + distance badge -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
          <tr>
            <td style="vertical-align:middle;">
              <div style="font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;line-height:1.1;">${t.runnerName || 'Runner'}</div>
            </td>
            <td style="vertical-align:middle;text-align:right;">
              <span style="background:#FFFFFF;color:#7B1113;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;white-space:nowrap;">${distLabel} &bull; ${t.raceCategory || distLabel}</span>
            </td>
          </tr>
        </table>

        <!-- Event + Date + Flag-off row -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
          <tr>
            <td style="width:33%;padding-right:8px;vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:1px;color:#FCA5A5;text-transform:uppercase;margin-bottom:3px;">EVENT</div>
              <div style="font-size:13px;font-weight:700;color:#FFFFFF;">${t.eventName || 'Chennai Marathon'}</div>
            </td>
            <td style="width:33%;padding-right:8px;vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:1px;color:#FCA5A5;text-transform:uppercase;margin-bottom:3px;">DATE</div>
              <div style="font-size:13px;font-weight:700;color:#FFFFFF;">${t.eventDate || ''}</div>
            </td>
            <td style="width:34%;vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:1px;color:#FCA5A5;text-transform:uppercase;margin-bottom:3px;">FLAG-OFF</div>
              <div style="font-size:13px;font-weight:700;color:#FFFFFF;">${t.flagOffTime || ''}</div>
            </td>
          </tr>
        </table>

        <!-- Venue + Gates open row -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
          <tr>
            <td style="width:60%;padding-right:8px;vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:1px;color:#FCA5A5;text-transform:uppercase;margin-bottom:3px;">VENUE</div>
              <div style="font-size:13px;font-weight:700;color:#FFFFFF;">${t.eventVenue || ''}</div>
            </td>
            <td style="width:40%;vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:1px;color:#FCA5A5;text-transform:uppercase;margin-bottom:3px;">GATES OPEN</div>
              <div style="font-size:13px;font-weight:700;color:#FFFFFF;">${t.gatesOpenTime || ''}</div>
            </td>
          </tr>
        </table>

        <!-- T-shirt / Blood group / Amount row -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
          <tr>
            <td style="width:33%;padding-right:8px;vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:1px;color:#FCA5A5;text-transform:uppercase;margin-bottom:3px;">T-SHIRT SIZE</div>
              <div style="font-size:13px;font-weight:700;color:#FFFFFF;">${t.tshirtSize || '\u2014'}</div>
            </td>
            <td style="width:33%;padding-right:8px;vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:1px;color:#FCA5A5;text-transform:uppercase;margin-bottom:3px;">BLOOD GROUP</div>
              <div style="font-size:13px;font-weight:700;color:#FFFFFF;">${t.bloodGroup || '\u2014'}</div>
            </td>
            <td style="width:34%;vertical-align:top;">
              <div style="font-size:9px;font-weight:700;letter-spacing:1px;color:#FCA5A5;text-transform:uppercase;margin-bottom:3px;">AMOUNT PAID</div>
              <div style="font-size:13px;font-weight:700;color:#FFFFFF;">${amountFormatted}</div>
            </td>
          </tr>
        </table>

        <!-- Registration ID + legal note -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="font-size:10px;color:#FCA5A5;">Registration ID: <strong style="color:#FFFFFF;">${t.registrationRef || ''}</strong></span>
            </td>
            <td style="text-align:right;">
              <span style="font-size:9px;color:#FCA5A5;">Not transferable &bull; Carry a Govt. Photo ID</span>
            </td>
          </tr>
        </table>
      </td>

      <!-- RIGHT: Bib + QR -->
      <td style="background:#5C0B0D;padding:28px 18px;vertical-align:top;text-align:center;border-left:2px dashed rgba(255,255,255,0.25);">
        <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:#FCA5A5;text-transform:uppercase;margin-bottom:6px;">BIB NUMBER</div>
        <div style="font-size:54px;font-weight:900;color:#FFFFFF;line-height:1;margin-bottom:14px;">${t.bibNumber || '0000'}</div>

        <!-- QR code placeholder (base64 encoded inline or simple box) -->
        <div style="width:90px;height:90px;margin:0 auto 10px;background:#FFFFFF;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(t.ticketCode || t.registrationRef)}&bgcolor=FFFFFF&color=7B1113&margin=2"
            alt="QR Code"
            width="90" height="90"
            style="display:block;border-radius:4px;"
          />
        </div>
        <div style="font-size:9px;font-weight:700;color:#FCA5A5;letter-spacing:0.5px;margin-bottom:3px;">Scan at Expo &amp; Check-In</div>
        <div style="font-size:10px;font-weight:800;color:#FFFFFF;letter-spacing:0.5px;">${t.ticketCode || ''}</div>
      </td>
    </tr>
  </table>

  <!-- IMPORTANT INFO + THANK YOU BAND -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EE;">
    <tr>
      <!-- Important Info -->
      <td style="padding:20px 24px;vertical-align:top;width:62%;border-right:1px solid #E5E7EB;">
        <div style="font-size:11px;font-weight:800;color:#1E293B;letter-spacing:0.5px;margin-bottom:10px;">&#128712; Important Information</div>
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;padding-right:6px;color:#A51C1F;font-size:12px;">&#9888;</td>
            <td style="font-size:11px;color:#374151;line-height:1.5;padding-bottom:6px;">Kit collection: Official Expo, Saturday &amp; Sunday, 10:00 AM &ndash; 6:00 PM. Venue details are emailed 1 week before the event.</td>
          </tr>
          <tr>
            <td style="vertical-align:top;padding-right:6px;color:#A51C1F;font-size:12px;">&#9888;</td>
            <td style="font-size:11px;color:#374151;line-height:1.5;padding-bottom:6px;">Carry this ticket (printed or on phone) and a Govt. Photo ID to collect your bib and T-shirt.</td>
          </tr>
          <tr>
            <td style="vertical-align:top;padding-right:6px;color:#A51C1F;font-size:12px;">&#9888;</td>
            <td style="font-size:11px;color:#374151;line-height:1.5;padding-bottom:6px;">Someone else can collect for you with a signed authorization letter and a copy of your photo ID.</td>
          </tr>
          <tr>
            <td style="vertical-align:top;padding-right:6px;color:#A51C1F;font-size:12px;">&#9888;</td>
            <td style="font-size:11px;color:#374151;line-height:1.5;">Reach the venue by the gate opening time. Parking is limited; carpooling is recommended.</td>
          </tr>
        </table>
      </td>

      <!-- Thank-you gift -->
      <td style="padding:20px 18px;vertical-align:top;background:#7B1113;text-align:center;">
        <div style="font-size:9px;font-weight:700;letter-spacing:1.2px;color:#FCA5A5;text-transform:uppercase;margin-bottom:6px;">A THANK-YOU GIFT</div>
        <div style="font-size:28px;font-weight:900;color:#FFFFFF;margin-bottom:4px;">10% OFF</div>
        <div style="background:rgba(255,255,255,0.18);border-radius:6px;padding:6px 10px;margin-bottom:8px;">
          <span style="font-size:13px;font-weight:800;color:#FFFFFF;letter-spacing:1px;">${t.discountCode || 'RUN-GIFT'}</span>
        </div>
        <div style="font-size:9px;color:#FCA5A5;line-height:1.4;">Use this code on your next INDIA RUNTRUST registration. Valid till 13 Feb 2027. One-time use.</div>
      </td>
    </tr>
  </table>

  <!-- Footer strip -->
  <div style="background:#1E293B;padding:10px 24px;text-align:center;">
    <span style="font-size:10px;color:#94A3B8;">INDIA RUNTRUST &bull; Questions? Reply to the ticket email or visit the FAQ page.</span>
  </div>
</div>
<!-- END RUNTRUST RACE TICKET -->
`;
};

// GET /api/admin/emails/config
export const getEmailConfig = async (req, res) => {
  try {
    const configured = isSmtpConfigured();
    const mailFromName = process.env.MAIL_FROM_NAME || 'India RunTrust';
    const mailFromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@runtrust.org';

    res.json({
      success: true,
      configured,
      mailFromName,
      mailFromAddress,
      fromFormatted: `"${mailFromName}" <${mailFromAddress}>`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/emails
export const getEmails = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({ success: false, message: 'Database is not connected.' });
    }

    const { tab } = req.query;
    let query = {};
    if (tab === 'sent') query = { status: 'sent' };
    else if (tab === 'drafts') query = { status: 'draft' };
    else if (tab === 'pending') query = { status: 'pending' };
    else if (tab === 'campaigns') query = { type: 'campaign' };

    const emails = await Email.find(query).sort({ createdAt: -1 }).limit(100);

    const counts = {
      sent: await Email.countDocuments({ status: 'sent' }),
      pending: await Email.countDocuments({ status: 'pending' }),
      drafts: await Email.countDocuments({ status: 'draft' }),
      campaigns: await Email.countDocuments({ type: 'campaign' })
    };

    res.json({
      success: true,
      data: emails,
      counts,
      isSmtpConfigured: isSmtpConfigured()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/emails/send
export const sendEmail = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({ success: false, message: 'Database is not connected.' });
    }

    const {
      to,
      subject,
      body,
      type = 'direct',
      campaignName = '',
      registrationId = '',
      messageId = ''
    } = req.body;

    let recipients = [];
    if (Array.isArray(to)) {
      recipients = to.map(e => String(e).trim()).filter(Boolean);
    } else if (typeof to === 'string') {
      recipients = to.split(/[,;]+/).map(e => e.trim()).filter(Boolean);
    }

    if (recipients.length === 0) {
      return res.status(400).json({ success: false, message: 'Recipient email address (To) is required.' });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Email subject is required.' });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, message: 'Email body content is required.' });
    }

    const mailFromName = process.env.MAIL_FROM_NAME || 'India RunTrust';
    const mailFromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@runtrust.org';
    const from = `"${mailFromName}" <${mailFromAddress}>`;
    const configured = isSmtpConfigured();

    // ── Ensure bib is generated even in pending/SMTP-off path ─────────────────
    if (registrationId) {
      try {
        const regCheck = await Registration.findById(registrationId).lean();
        if (regCheck && !regCheck.bibNumber) {
          let candidate;
          for (let i = 0; i < 20; i++) {
            candidate = String(Math.floor(1000 + Math.random() * 9000));
            const conflict = await Registration.findOne({ bibNumber: candidate });
            if (!conflict) break;
          }
          await Registration.findByIdAndUpdate(registrationId, { bibNumber: candidate || String(Date.now()).slice(-6) });
        }
      } catch (_e) { /* non-fatal */ }
    }

    if (!configured) {
      // SMTP not configured -> save as 'pending' without crashing
      const pendingEmail = new Email({
        to: recipients,
        from,
        subject: subject.trim(),
        body: body.trim(),
        status: 'pending',
        type,
        campaignName: campaignName || '',
        registrationId: registrationId || '',
        messageId: messageId || '',
        sentAt: null
      });

      const saved = await pendingEmail.save();

      // If associated with a contact message, mark replied
      if (messageId) {
        await ContactMessage.findByIdAndUpdate(messageId, {
          isReplied: true,
          isRead: true,
          repliedAt: new Date()
        });
      }

      return res.status(200).json({
        success: true,
        pending: true,
        message: 'Email is not configured yet. Add SMTP details in .env to start sending.',
        data: saved
      });
    }

    // SMTP is configured -> send using nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // ── Auto-embed ticket when this email is a registration reply ──────────────
    let ticketHtmlBlock = '';
    if (registrationId) {
      try {
        const reg = await Registration.findById(registrationId).lean();
        if (reg) {
          // Generate / reuse bib (inline — avoids circular import)
          let bibNumber = reg.bibNumber || '';
          if (!bibNumber) {
            let candidate;
            for (let i = 0; i < 20; i++) {
              candidate = String(Math.floor(1000 + Math.random() * 9000));
              const conflict = await Registration.findOne({ bibNumber: candidate, _id: { $ne: reg._id } });
              if (!conflict) break;
            }
            bibNumber = candidate || String(Date.now()).slice(-6);
            await Registration.findByIdAndUpdate(registrationId, { bibNumber });
          }

          const dist = (reg.distance || reg.raceCategory || '5K').split(',')[0].trim().toUpperCase().replace(/\s+/g, '');
          const ticketCode = `RUN-${dist}-${bibNumber}`;
          const firstWord = (reg.fullName || 'RUNNER').split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
          const discountCode = `RUN-${firstWord}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

          const CITY_DEFAULTS = {
            chennai:    { eventDate: 'Sunday, 15 Nov 2026', eventVenue: 'Besant Nagar Promenade, Chennai', flagOffTime: '6:30 AM IST', gatesOpenTime: '4:30 AM IST' },
            coimbatore: { eventDate: 'Sunday, 29 Nov 2026', eventVenue: 'Race Course Road & VOC Park, Coimbatore', flagOffTime: '6:00 AM IST', gatesOpenTime: '4:30 AM IST' },
            bengaluru:  { eventDate: 'Sunday, 13 Dec 2026', eventVenue: 'Cubbon Park, Bengaluru', flagOffTime: '6:30 AM IST', gatesOpenTime: '5:00 AM IST' },
            kochi:      { eventDate: 'Sunday, 20 Dec 2026', eventVenue: 'Marine Drive, Kochi', flagOffTime: '6:00 AM IST', gatesOpenTime: '4:30 AM IST' }
          };
          const eKey = (reg.selectedEvent || reg.city || 'chennai').toLowerCase();
          const cKey = Object.keys(CITY_DEFAULTS).find(k => eKey.includes(k)) || 'chennai';
          const cDef = CITY_DEFAULTS[cKey];

          const tData = {
            runnerName:      reg.fullName     || 'Runner',
            eventName:       reg.eventName    || (cKey.charAt(0).toUpperCase() + cKey.slice(1) + ' Marathon'),
            eventDate:       reg.eventDate    || cDef.eventDate,
            eventVenue:      reg.eventVenue   || cDef.eventVenue,
            flagOffTime:     reg.flagOffTime  || cDef.flagOffTime,
            gatesOpenTime:   reg.gatesOpenTime || cDef.gatesOpenTime,
            distance:        reg.distance     || reg.raceCategory || '5K',
            raceCategory:    reg.raceCategory || reg.distance     || '5K',
            tshirtSize:      reg.tshirtSize   || '—',
            bloodGroup:      reg.bloodGroup   || '—',
            amount:          reg.amount       || 0,
            registrationRef: reg.registrationRef,
            bibNumber,
            ticketCode,
            discountCode
          };
          ticketHtmlBlock = generateTicketHtml(tData);
        }
      } catch (ticketErr) {
        console.warn('[sendEmail] Could not embed ticket:', ticketErr.message);
      }
    }

    // Build final HTML: email wrapper + optional ticket block
    const baseHtml = generateEmailTemplate(subject.trim(), body.trim());
    const finalHtml = ticketHtmlBlock
      ? baseHtml.replace('</body>', ticketHtmlBlock + '</body>')
      : baseHtml;

    await transporter.sendMail({
      from,
      to: recipients.join(', '),
      subject: subject.trim(),
      text: body.trim(),
      html: finalHtml
    });

    const sentEmail = new Email({
      to: recipients,
      from,
      subject: subject.trim(),
      body: body.trim(),
      status: 'sent',
      type,
      campaignName: campaignName || '',
      registrationId: registrationId || '',
      messageId: messageId || '',
      sentAt: new Date()
    });

    const saved = await sentEmail.save();

    // If associated with a contact message, mark replied
    if (messageId) {
      await ContactMessage.findByIdAndUpdate(messageId, {
        isReplied: true,
        isRead: true,
        repliedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      pending: false,
      message: 'Email sent successfully.',
      data: saved
    });
  } catch (error) {
    // If nodemailer send fails, save as pending rather than crashing
    try {
      const { to, subject, body, type = 'direct', campaignName = '', registrationId = '', messageId = '' } = req.body;
      let recipients = Array.isArray(to) ? to : (to ? [to] : []);
      const fallbackEmail = new Email({
        to: recipients,
        from: `"${process.env.MAIL_FROM_NAME || 'India RunTrust'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@runtrust.org'}>`,
        subject: (subject || '').trim(),
        body: (body || '').trim(),
        status: 'pending',
        type,
        campaignName,
        registrationId,
        messageId,
        sentAt: null
      });
      await fallbackEmail.save();
      return res.status(200).json({
        success: true,
        pending: true,
        message: `Failed to transmit email via SMTP server (${error.message}). Saved message as pending.`,
        data: fallbackEmail
      });
    } catch (saveErr) {
      return res.status(500).json({
        success: false,
        message: `Error sending email: ${error.message}`
      });
    }
  }
};

// POST /api/admin/emails/draft
export const saveDraftEmail = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({ success: false, message: 'Database is not connected.' });
    }

    const { id, to, subject, body, campaignName, registrationId, messageId } = req.body;

    let recipients = [];
    if (Array.isArray(to)) {
      recipients = to.map(e => String(e).trim()).filter(Boolean);
    } else if (typeof to === 'string' && to.trim()) {
      recipients = to.split(/[,;]+/).map(e => e.trim()).filter(Boolean);
    }

    const mailFromName = process.env.MAIL_FROM_NAME || 'India RunTrust';
    const mailFromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@runtrust.org';
    const from = `"${mailFromName}" <${mailFromAddress}>`;

    if (id) {
      const updated = await Email.findByIdAndUpdate(
        id,
        {
          to: recipients,
          from,
          subject: (subject || '').trim(),
          body: (body || '').trim(),
          status: 'draft',
          campaignName: campaignName || '',
          registrationId: registrationId || '',
          messageId: messageId || ''
        },
        { new: true }
      );
      return res.json({ success: true, message: 'Draft updated successfully.', data: updated });
    }

    const draft = new Email({
      to: recipients,
      from,
      subject: (subject || 'Draft Message').trim(),
      body: (body || '').trim(),
      status: 'draft',
      campaignName: campaignName || '',
      registrationId: registrationId || '',
      messageId: messageId || ''
    });

    const saved = await draft.save();
    res.status(201).json({ success: true, message: 'Draft saved successfully.', data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/emails/:id
export const deleteEmail = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({ success: false, message: 'Database is not connected.' });
    }

    const { id } = req.params;
    await Email.findByIdAndDelete(id);
    res.json({ success: true, message: 'Email entry deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CAMPAIGN BULK EMAIL ENDPOINTS ─────────────────────────────────────────────

// GET /api/admin/emails/recipients?city=Chennai&status=confirmed
// Returns matching recipients from registrations filtered by city and registration status.
export const getCampaignRecipients = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({ success: false, message: 'Database is not connected.' });
    }

    const { city, status } = req.query;

    // Build filter
    const filter = {};

    // City filter: "All Cities" or blank = no city filter
    if (city && city !== 'All Cities' && city !== 'all') {
      filter.city = { $regex: new RegExp(city, 'i') };
    }

    // Status filter: 'Confirmed', 'Pending', or 'All'
    if (status && status !== 'All' && status !== 'all') {
      filter.registrationStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    const registrations = await Registration.find(filter).select('email fullName city registrationStatus').lean();

    // Deduplicate by email
    const seen = new Set();
    const recipients = [];
    for (const r of registrations) {
      if (r.email && !seen.has(r.email.toLowerCase())) {
        seen.add(r.email.toLowerCase());
        recipients.push({
          email: r.email,
          fullName: r.fullName,
          city: r.city,
          registrationStatus: r.registrationStatus
        });
      }
    }

    // Also compute distinct cities for the dropdown
    const allCities = await Registration.distinct('city');
    const cityList = allCities
      .filter(Boolean)
      .map(c => c.trim())
      .filter(c => c.length > 0)
      .sort();

    res.json({
      success: true,
      recipients,
      count: recipients.length,
      cities: cityList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/emails/campaign/send
// Sends bulk email to recipients based on city + status filter, using mailQueue batches.
// Body: { city, status, subject, body, template }
export const sendCampaignBulk = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({ success: false, message: 'Database is not connected.' });
    }

    const { city, status, subject, body, template } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Email subject is required.' });
    }
    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, message: 'Email body content is required.' });
    }

    // Build filter for recipients
    const filter = {};
    if (city && city !== 'All Cities' && city !== 'all') {
      filter.city = { $regex: new RegExp(city, 'i') };
    }
    if (status && status !== 'All' && status !== 'all') {
      filter.registrationStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    const registrations = await Registration.find(filter).select('email').lean();

    // Deduplicate
    let recipientEmails = [...new Set(
      registrations
        .map(r => r.email)
        .filter(Boolean)
        .map(e => e.toLowerCase().trim())
    )];

    if (Array.isArray(req.body.recipients) && req.body.recipients.length > 0) {
      recipientEmails = [...new Set(
        req.body.recipients
          .filter(Boolean)
          .map(e => e.toLowerCase().trim())
      )];
    }

    if (recipientEmails.length === 0) {
      return res.status(400).json({ success: false, message: 'No recipients found for the selected filters.' });
    }

    // Create campaign record with 'sending' status
    const campaign = new Campaign({
      city: city || 'All Cities',
      statusFilter: status || 'All',
      subject: subject.trim(),
      body: body.trim(),
      template: template || '',
      totalRecipients: recipientEmails.length,
      recipients: recipientEmails,
      status: 'sending'
    });
    const savedCampaign = await campaign.save();

    // Process mail queue in batches of 50
    const queueResult = await processMailQueue(recipientEmails, subject.trim(), body.trim(), {
      batchSize: 50,
      delayMs: 2000
    });

    // Update campaign with results
    savedCampaign.sentCount = queueResult.sentCount;
    savedCampaign.failedCount = queueResult.failedCount;
    savedCampaign.status = queueResult.failedCount === recipientEmails.length ? 'failed' : 'completed';
    savedCampaign.completedAt = new Date();
    await savedCampaign.save();

    // Also save an Email record for the Sent Messages tab
    const emailRecord = new Email({
      to: recipientEmails,
      from: `"${process.env.MAIL_FROM_NAME || 'India RunTrust'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@runtrust.org'}>`,
      subject: subject.trim(),
      body: body.trim(),
      status: queueResult.sentCount > 0 ? 'sent' : 'pending',
      type: 'campaign',
      campaignName: `${city || 'All Cities'} - ${status || 'All'} (${recipientEmails.length} recipients)`,
      sentAt: new Date()
    });
    await emailRecord.save();

    res.json({
      success: true,
      message: `Campaign sent to ${queueResult.sentCount} of ${recipientEmails.length} recipients.`,
      campaign: savedCampaign,
      sentCount: queueResult.sentCount,
      failedCount: queueResult.failedCount,
      pending: !isSmtpConfigured()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/emails/campaigns
// Returns all sent campaign records for the Sent Messages / Campaigns tab.
export const getCampaigns = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({ success: false, message: 'Database is not connected.' });
    }

    const campaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

