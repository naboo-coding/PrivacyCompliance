// Example: Audit Trail Usage

const { logAudit } = require('../lib/consent/auditTrail');

(async () => {
  try {
    // Log an action
    await logAudit('consent_given', 'user123', { details: 'User accepted marketing consent.' });
    // Retrieve audit logs (manual read for demonstration)
    const fs = require('fs');
    const path = require('path');
    const AUDIT_PATH = path.join(__dirname, '../data/auditTrail.json');
    const logs = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf8'));
    console.log('Audit logs for user123:', logs.filter(l => l.userId === 'user123'));
  } catch (err) {
    console.error('Error with audit trail:', err);
  }
})(); 