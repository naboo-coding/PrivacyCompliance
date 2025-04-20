const express = require('express');
const ConsentForm = require('./ConsentForm');
const { logAudit } = require('./auditTrail');
const fs = require('fs');
const path = require('path');
const { notifyBreach } = require('./breachNotifier');

const router = express.Router();
const consentForm = new ConsentForm();

const AUDIT_PATH = path.join(__dirname, '../../data/auditTrail.json');

// POST /api/consent
router.post('/', (req, res) => {
  const { userId, preferences } = req.body;
  if (!userId || !preferences) {
    return res.status(400).json({ error: 'userId and preferences are required' });
  }
  try {
    consentForm.upsertConsent(userId, preferences);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to store consent' });
  }
});

// GET /api/consent/:userId
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  try {
    const consents = consentForm.getAllConsents();
    res.json({ preferences: consents[userId] || {} });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve consent' });
  }
});

// DELETE /api/consent/:userId
/**
 * Withdraw or revoke consent for a user.
 * Request body can include 'purposes' (string or array) to revoke specific purposes, or omit for all.
 * Example: DELETE /api/consent/123 { purposes: ["analytics"] }
 */
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { purposes } = req.body; // optional: array or string
  try {
    const result = await consentForm.withdrawConsent(userId, purposes);
    if (result) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Consent not found for user' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to withdraw/revoke consent' });
  }
});

// GET /api/consent/audit
/**
 * Retrieve the consent audit trail.
 */
router.get('/audit', (req, res) => {
  try {
    let auditTrail = [];
    if (fs.existsSync(AUDIT_PATH)) {
      auditTrail = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf8'));
    }
    res.json({ auditTrail });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve audit trail' });
  }
});

// POST /api/consent/breach
/**
 * Manually trigger a data breach notification (for testing/demo).
 * Request body can include details about the breach.
 */
router.post('/breach', async (req, res) => {
  try {
    await notifyBreach(req.body || {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger breach notification' });
  }
});

module.exports = router; 