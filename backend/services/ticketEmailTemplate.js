/**
 * ticketEmailTemplate.js
 * Generates HTML for:
 *   1. The PDF race ticket (landscape card, Puppeteer-ready)
 *   2. The confirmation email body
 */

const CITY_DEFAULTS = {
  chennai: {
    eventName: 'Chennai Coastal Sunrise Run',
    eventDate: 'Sunday, 15 Nov 2026',
    eventVenue: 'Besant Nagar Promenade, Chennai',
    flagOffTime: '6:30 AM IST',
    gatesOpenTime: '4:30 AM IST'
  },
  coimbatore: {
    eventName: 'Coimbatore Green Foothills Marathon',
    eventDate: 'Sunday, 29 Nov 2026',
    eventVenue: 'Race Course Road & VOC Park, Coimbatore',
    flagOffTime: '6:00 AM IST',
    gatesOpenTime: '4:30 AM IST'
  },
  bengaluru: {
    eventName: 'Bengaluru Heritage & Lakes Stride',
    eventDate: 'Sunday, 13 Dec 2026',
    eventVenue: 'Cubbon Park, Bengaluru',
    flagOffTime: '6:30 AM IST',
    gatesOpenTime: '5:00 AM IST'
  },
  kochi: {
    eventName: 'Kochi Marine Drive Backwater Run',
    eventDate: 'Sunday, 20 Dec 2026',
    eventVenue: 'Marine Drive, Kochi',
    flagOffTime: '6:00 AM IST',
    gatesOpenTime: '4:30 AM IST'
  }
};

export function resolveEventDefaults(selectedEvent, city) {
  const key = (selectedEvent || city || 'chennai').toLowerCase();
  const cityKey = Object.keys(CITY_DEFAULTS).find(k => key.includes(k)) || 'chennai';
  return CITY_DEFAULTS[cityKey];
}

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Full HTML page for Puppeteer PDF generation */
export function buildTicketHtml({
  runnerName, email,
  eventName, eventDate, eventVenue,
  flagOffTime, gatesOpenTime,
  distance, raceCategory,
  tshirtSize, bloodGroup, amount,
  registrationRef, bibNumber, ticketCode,
  qrDataUrl
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>RUNTRUST – Race Ticket</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:780px; background:#FAF8F5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .ticket { width:760px; margin:16px auto; background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.10); border:1.5px solid #E2E8F0; }
  .hdr { background:linear-gradient(135deg,#A51C1F 0%,#7B1316 100%); padding:16px 28px; display:flex; align-items:center; justify-content:space-between; }
  .brand-name { font-size:22px; font-weight:900; color:#fff; letter-spacing:2px; }
  .brand-sub { font-size:10px; color:#FCA5A5; letter-spacing:1.5px; text-transform:uppercase; margin-top:2px; }
  .ticket-badge { background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.3); border-radius:6px; padding:6px 14px; color:#fff; font-size:11px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; }
  .body { display:flex; }
  .main { flex:1; padding:20px 26px; border-right:2px dashed #E2E8F0; }
  .ev-name { font-size:15px; font-weight:800; color:#1E293B; margin-bottom:4px; }
  .run-name { font-size:22px; font-weight:900; color:#A51C1F; margin-bottom:16px; }
  .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px 14px; }
  .cell label { display:block; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:#94A3B8; margin-bottom:3px; }
  .cell span { display:block; font-size:13px; font-weight:700; color:#1E293B; }
  .cell span.acc { color:#A51C1F; font-size:15px; }
  .div-row { display:flex; align-items:center; gap:8px; margin:14px 0 10px; }
  .div-line { flex:1; height:1px; background:#E2E8F0; }
  .div-lbl { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#CBD5E1; }
  .stub { width:220px; padding:20px 18px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; background:#FAFAFA; gap:14px; }
  .bib-box { background:linear-gradient(135deg,#A51C1F,#7B1316); border-radius:10px; padding:10px 18px; text-align:center; width:100%; }
  .bib-lbl { font-size:9px; font-weight:700; color:#FCA5A5; letter-spacing:1.5px; text-transform:uppercase; }
  .bib-num { font-size:38px; font-weight:900; color:#fff; line-height:1; margin-top:2px; }
  .bib-dist { font-size:11px; font-weight:700; color:#FEE2E2; margin-top:3px; }
  .qr-wrap { display:flex; flex-direction:column; align-items:center; gap:6px; }
  .qr-wrap img { width:90px; height:90px; border:3px solid #E2E8F0; border-radius:8px; background:#fff; padding:4px; }
  .qr-txt { font-size:9px; font-weight:700; color:#64748B; letter-spacing:1px; }
  .ref-box { text-align:center; padding:6px 10px; background:#F1F5F9; border-radius:6px; width:100%; }
  .ref-lbl { font-size:8px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.8px; }
  .ref-val { font-size:11px; font-weight:800; color:#1E293B; letter-spacing:1px; }
  .ftr { background:#0F172A; padding:10px 26px; display:flex; align-items:center; justify-content:space-between; }
  .ftr-l { font-size:9px; color:#64748B; }
  .ftr-r { font-size:9px; color:#64748B; }
  .ftr-r span { color:#F87171; }
</style>
</head>
<body>
<div class="ticket">
  <div class="hdr">
    <div>
      <div class="brand-name">&#127939; RUNTRUST</div>
      <div class="brand-sub">South India Marathon Series 2026</div>
    </div>
    <div class="ticket-badge">Official Race Ticket</div>
  </div>
  <div class="body">
    <div class="main">
      <div class="ev-name">${esc(eventName)}</div>
      <div class="run-name">${esc(runnerName)}</div>
      <div class="grid">
        <div class="cell"><label>&#128197; Event Date</label><span>${esc(eventDate)}</span></div>
        <div class="cell"><label>&#128205; Venue</label><span>${esc(eventVenue)}</span></div>
        <div class="cell"><label>&#127885; Distance</label><span class="acc">${esc(distance || raceCategory)}</span></div>
        <div class="cell"><label>&#128681; Flag-off Time</label><span>${esc(flagOffTime)}</span></div>
        <div class="cell"><label>&#128682; Gates Open</label><span>${esc(gatesOpenTime)}</span></div>
        <div class="cell"><label>&#128085; T-Shirt Size</label><span>${esc(tshirtSize || '—')}</span></div>
      </div>
      <div class="div-row"><div class="div-line"></div><div class="div-lbl">Registration Details</div><div class="div-line"></div></div>
      <div class="grid">
        <div class="cell"><label>&#129656; Blood Group</label><span>${esc(bloodGroup || '—')}</span></div>
        <div class="cell"><label>&#128179; Amount Paid</label><span>&#8377;${esc(String(amount))}</span></div>
        <div class="cell"><label>&#128231; Email</label><span style="font-size:11px;">${esc(email || '—')}</span></div>
      </div>
    </div>
    <div class="stub">
      <div class="bib-box">
        <div class="bib-lbl">Bib Number</div>
        <div class="bib-num">${esc(String(bibNumber))}</div>
        <div class="bib-dist">${esc(distance || raceCategory)}</div>
      </div>
      <div class="qr-wrap">
        ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR"/>` : '<div style="width:90px;height:90px;background:#F1F5F9;border-radius:8px;"></div>'}
        <div class="qr-txt">SCAN TO VERIFY</div>
      </div>
      <div class="ref-box">
        <div class="ref-lbl">Registration Ref</div>
        <div class="ref-val">${esc(registrationRef)}</div>
      </div>
    </div>
  </div>
  <div class="ftr">
    <div class="ftr-l">Ticket: ${esc(ticketCode)} &nbsp;|&nbsp; Carry a valid photo ID on race day</div>
    <div class="ftr-r">&#169; 2026 <span>RUNTRUST</span> &middot; www.runtrust.in</div>
  </div>
</div>
</body>
</html>`;
}

/** Styled HTML for the confirmation email */
export function buildConfirmationEmailHtml({
  runnerName, eventName, eventDate, eventVenue,
  distance, bibNumber, registrationRef,
  flagOffTime, tshirtSize, amount
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Registration Confirmed – RUNTRUST</title>
<style>
  body{margin:0;padding:0;background:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1E293B;}
  .w{width:100%;background:#FAF8F5;padding:24px 0;}
  .c{max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #E2E8F0;box-shadow:0 4px 16px rgba(0,0,0,.06);}
  .hdr{background:linear-gradient(135deg,#A51C1F,#7B1316);padding:28px 32px;text-align:center;}
  .hdr h1{margin:0;color:#fff;font-size:24px;font-weight:900;letter-spacing:2px;}
  .hdr p{margin:6px 0 0;color:#FCA5A5;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;}
  .hero{background:#FFF7F7;border-bottom:1px solid #FECACA;padding:18px 32px;text-align:center;}
  .hero .chk{font-size:36px;}
  .hero h2{margin:8px 0 4px;color:#A51C1F;font-size:18px;font-weight:800;}
  .hero p{margin:0;color:#64748B;font-size:13px;}
  .bd{padding:28px 32px;}
  .greet{font-size:16px;font-weight:700;color:#1E293B;margin-bottom:14px;}
  table.info{width:100%;border-collapse:collapse;margin-bottom:20px;}
  table.info td{padding:10px 12px;font-size:14px;border-bottom:1px solid #F1F5F9;}
  table.info td:first-child{font-weight:700;color:#64748B;width:42%;}
  table.info td:last-child{color:#1E293B;font-weight:600;}
  .bib-chip{display:inline-block;background:linear-gradient(135deg,#A51C1F,#7B1316);color:#fff;font-size:22px;font-weight:900;padding:8px 22px;border-radius:10px;letter-spacing:2px;}
  .pdf-note{background:#F8FAFC;border:1.5px dashed #CBD5E1;border-radius:10px;padding:14px 16px;font-size:13px;color:#475569;margin-bottom:20px;}
  .pdf-note strong{color:#A51C1F;}
  .tips{background:#FFF7F7;border-radius:10px;padding:16px 20px;margin-bottom:20px;}
  .tips h3{font-size:13px;font-weight:800;color:#A51C1F;margin:0 0 10px;text-transform:uppercase;letter-spacing:.8px;}
  .tips ul{margin:0;padding-left:18px;}
  .tips li{font-size:13px;color:#475569;margin-bottom:6px;}
  .ftr{background:#0F172A;padding:20px 32px;text-align:center;color:#64748B;font-size:12px;}
  .ftr a{color:#F87171;}
</style>
</head>
<body>
<div class="w"><div class="c">
  <div class="hdr"><h1>&#127939; RUNTRUST</h1><p>South India Marathon Series 2026</p></div>
  <div class="hero">
    <div class="chk">&#127881;</div>
    <h2>You're Registered!</h2>
    <p>Your race ticket is attached to this email as a PDF.</p>
  </div>
  <div class="bd">
    <div class="greet">Hi ${esc(runnerName)},</div>
    <p style="font-size:14px;color:#475569;margin-bottom:20px;line-height:1.7;">
      Congratulations! Your registration for <strong>${esc(eventName)}</strong> has been confirmed.
      Your official race ticket is attached below as a PDF. Please print it or save it on your phone — you'll need it on race day.
    </p>
    <table class="info">
      <tr><td>&#127885; Distance</td><td>${esc(distance)}</td></tr>
      <tr><td>&#128197; Event Date</td><td>${esc(eventDate)}</td></tr>
      <tr><td>&#128205; Venue</td><td>${esc(eventVenue)}</td></tr>
      <tr><td>&#128681; Flag-off Time</td><td>${esc(flagOffTime)}</td></tr>
      <tr><td>&#128085; T-Shirt Size</td><td>${esc(tshirtSize || '—')}</td></tr>
      <tr><td>&#128179; Amount Paid</td><td>&#8377;${esc(String(amount))}</td></tr>
      <tr><td>&#128273; Reference No.</td><td>${esc(registrationRef)}</td></tr>
      <tr><td>&#128204; Bib Number</td><td><span class="bib-chip">${esc(String(bibNumber))}</span></td></tr>
    </table>
    <div class="pdf-note">&#128206; <strong>Your race ticket PDF is attached</strong> to this email. Download it and keep it handy. You can also show the QR code on race day for quick verification.</div>
    <div class="tips">
      <h3>&#128203; Race Day Checklist</h3>
      <ul>
        <li>Carry your printed ticket <strong>or</strong> show this QR code</li>
        <li>Bring a valid government photo ID</li>
        <li>Arrive at gates by <strong>${esc(flagOffTime)}</strong></li>
        <li>Wear bib number <strong>${esc(String(bibNumber))}</strong> clearly visible on your front</li>
        <li>Stay hydrated the night before</li>
      </ul>
    </div>
    <p style="font-size:14px;color:#475569;line-height:1.7;">For queries, reply to this email or write to <a href="mailto:support@runtrust.in" style="color:#A51C1F;">support@runtrust.in</a></p>
  </div>
  <div class="ftr"><p>&#169; 2026 RUNTRUST &middot; South India Marathon Series</p><p><a href="https://runtrust.in">www.runtrust.in</a></p></div>
</div></div>
</body>
</html>`;
}
