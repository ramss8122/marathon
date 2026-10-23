import nodemailer from 'nodemailer';
import { isSmtpConfigured, generateEmailTemplate } from '../controllers/emailController.js';

/**
 * mailQueue.js
 * Processes an array of recipient emails in batches, with configurable
 * batch size and inter-batch delay. Returns { sentCount, failedCount }.
 *
 * Usage:
 *   import { processMailQueue } from '../services/mailQueue.js';
 *   const result = await processMailQueue(recipients, subject, body, { batchSize: 50, delayMs: 2000 });
 */

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 2000; // 2-second pause between batches

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send emails in batches through SMTP.
 * @param {string[]} recipients - Array of email addresses
 * @param {string} subject - Email subject
 * @param {string} body - Plain text body (will be wrapped in RunTrust HTML template)
 * @param {Object} opts - Optional overrides: { batchSize, delayMs }
 * @returns {Promise<{ sentCount: number, failedCount: number, errors: string[] }>}
 */
export async function processMailQueue(recipients, subject, body, opts = {}) {
  const batchSize = opts.batchSize || BATCH_SIZE;
  const delayMs = opts.delayMs || BATCH_DELAY_MS;

  const result = { sentCount: 0, failedCount: 0, errors: [] };

  if (!isSmtpConfigured()) {
    // When SMTP is not configured, mark all as failed
    result.failedCount = recipients.length;
    result.errors.push('SMTP not configured. Add SMTP details in .env to send emails.');
    return result;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailFromName = process.env.MAIL_FROM_NAME || 'India RunTrust';
  const mailFromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@runtrust.org';
  const from = `"${mailFromName}" <${mailFromAddress}>`;

  const htmlBody = generateEmailTemplate(subject, body);

  // Process in batches of batchSize
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    // Send each email in the batch concurrently
    const batchResults = await Promise.allSettled(
      batch.map(email =>
        transporter.sendMail({
          from,
          to: email,
          subject,
          text: body,
          html: htmlBody
        })
      )
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled') {
        result.sentCount++;
      } else {
        result.failedCount++;
        result.errors.push(r.reason?.message || 'Unknown send error');
      }
    }

    // Delay between batches (skip delay after the last batch)
    if (i + batchSize < recipients.length) {
      await sleep(delayMs);
    }
  }

  return result;
}

export default processMailQueue;
