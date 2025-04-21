const ConsentForm = require('../lib/consent/ConsentForm');
const DSARManager = require('../lib/dsar/DSARManager');
const Anonymizer = require('../lib/anonymization/Anonymizer');
const Logger = require('../lib/logging/Logger');
const fs = require('fs');
const path = require('path');
const CONSENTS_PATH = path.join(__dirname, '../data/consents.json');
const USERS_PATH = path.join(__dirname, '../data/dsar_users.json');
const DSAR_LOGS_PATH = path.join(__dirname, '../data/dsar_logs.json');
const LOGS_PATH = path.join(__dirname, '../data/logs.json');

describe('Integration Test: Privacy Compliance Modules', () => {
  beforeEach(() => {
    // Clear all relevant data files before each test
    [CONSENTS_PATH, USERS_PATH, DSAR_LOGS_PATH, LOGS_PATH].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  test('Consent, DSAR, Anonymization, and Logging work together', async () => {
    // Simulate storing consent
    const consent = new ConsentForm();
    const userId = 'user123';
    const preferences = { marketing: true };
    await consent.storeConsent(userId, preferences);
    expect(await consent.getConsentStatus(userId, 'marketing')).toBe(true);

    // Simulate DSAR request
    const dsar = new DSARManager();
    await dsar.requestDataCorrection(userId, { email: 'user@example.com' });
    const accessData = await dsar.requestDataAccess(userId);
    expect(accessData).toBeDefined();
    await dsar.logDSARAction(userId, 'access');

    // Simulate anonymization
    const anonymizer = new Anonymizer();
    const data = { email: 'user@example.com', name: 'John Doe' };
    const anonData = anonymizer.anonymizeField(data, 'email', {});
    expect(anonData.email).not.toBe(data.email);

    // Simulate logging
    const logger = new Logger();
    await logger.logDataProcessing('anonymization', { userId, field: 'email' });
    await logger.flush();
    const logs = await logger.getLogsForAudit();
    expect(Array.isArray(logs)).toBe(true);
  });

  test('DSAR actions for user without consent should handle gracefully', async () => {
    const dsar = new DSARManager();
    expect(await dsar.requestDataAccess('noConsentUser')).toBeNull();
    expect(await dsar.requestDataDeletion('noConsentUser')).toBe(true); // Should not throw
  });

  test('Logger should handle logging for non-existent users', async () => {
    const logger = new Logger();
    await logger.logDataProcessing('test', { userId: 'ghost' });
    await logger.flush();
    const logs = await logger.getLogsForAudit(log => log.details.userId === 'ghost');
    expect(logs.length).toBeGreaterThanOrEqual(1);
  });

  test('Workflow should handle missing/empty data gracefully', async () => {
    const consent = new ConsentForm();
    const dsar = new DSARManager();
    const logger = new Logger();
    await expect(async () => { await consent.storeConsent('', {}); }).not.toThrow();
    expect(await dsar.requestDataCorrection('', {})).toBeDefined();
    await logger.logDataProcessing('empty', {});
    expect(Array.isArray(await logger.getLogsForAudit())).toBe(true);
  });
}); 