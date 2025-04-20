const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const AUDIT_PATH = path.join(__dirname, '../../data/auditTrail.json');

async function logAudit(action, userId, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details
  };
  let auditTrail = [];
  try {
    if (fs.existsSync(AUDIT_PATH)) {
      const data = await fsp.readFile(AUDIT_PATH, 'utf8');
      auditTrail = JSON.parse(data);
    }
  } catch (e) {
    // ignore, start fresh
  }
  auditTrail.push(entry);
  await fsp.writeFile(AUDIT_PATH, JSON.stringify(auditTrail, null, 2), 'utf8');
}

module.exports = { logAudit }; 