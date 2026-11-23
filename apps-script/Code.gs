// Google Apps Script web app: visit-request form -> pipeline sheet row + instant email alert.
// Deploy: Extensions > Apps Script (bound to the pipeline sheet) > Deploy > Web app (execute as me, anyone can access).
// Script properties (Project settings): ALERT_EMAIL (comma-separated), optional SHEET_NAME (default "Leads").
// Paste the /exec URL into site/config.js as formEndpoint. Never commit the URL or the sheet id.
const HEAD = ['Received', 'Name', 'Designation', 'City', 'Mobile', 'Preferred time', 'Page'];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.website) return out({ ok: true }); // honeypot: pretend success
    const mobile = String(d.mobile || '').replace(/\D/g, '').slice(-10);
    if (!d.name || !d.designation || !d.city || !/^[6-9]\d{9}$/.test(mobile) || !d.consent) return out({ ok: false });
    const clip = v => String(v || '').trim().slice(0, 200).replace(/^[=+\-@]/, "'"); // stop formula injection
    const row = [new Date(), clip(d.name), clip(d.designation), clip(d.city), mobile, clip(d.preferred_time), clip(d.page)];

    const p = PropertiesService.getScriptProperties();
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName(p.getProperty('SHEET_NAME') || 'Leads') || ss.insertSheet('Leads');
    if (!sh.getLastRow()) sh.appendRow(HEAD);
    sh.appendRow(row); // row first: a failed alert must never lose the lead

    try {
      MailApp.sendEmail(p.getProperty('ALERT_EMAIL'), 'New visit request: ' + row[3],
        HEAD.slice(1, 6).map((h, i) => h + ': ' + row[i + 1]).join('\n'));
    } catch (_) { /* row is saved; alert failure is visible in Apps Script executions */ }
    return out({ ok: true });
  } catch (_) {
    return out({ ok: false });
  }
}

const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
