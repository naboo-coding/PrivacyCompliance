const ConsentForm = require('../src/consent/ConsentForm');
const DSARManager = require('../src/dsar/DSARManager');
const Anonymizer = require('../src/anonymization/Anonymizer');
const Logger = require('../src/logging/Logger');

describe('Integration Test: Privacy Compliance Modules', () => {
  test('Consent, DSAR, Anonymization, and Logging work together', () => {
    // Simulate storing consent
    const consent = new ConsentForm();
    const userId = 'user123';
    const preferences = { marketing: true };
    consent.storeConsent(userId, preferences);
    expect(consent.getConsentStatus(userId, 'marketing')).toBe(true);

    // Simulate DSAR request
    const dsar = new DSARManager();
    dsar.requestDataCorrection(userId, { email: 'user@example.com' });
    const accessData = dsar.requestDataAccess(userId);
    expect(accessData).toBeDefined();
    dsar.logDSARAction(userId, 'access');

    // Simulate anonymization
    const anonymizer = new Anonymizer();
    const data = { email: 'user@example.com', name: 'John Doe' };
    const anonData = anonymizer.anonymizeField(data, 'email', {});
    expect(anonData.email).not.toBe(data.email);

    // Simulate logging
    const logger = new Logger();
    logger.logDataProcessing('anonymization', { userId, field: 'email' });
    const logs = logger.getLogsForAudit();
    expect(Array.isArray(logs)).toBe(true);
  });
}); 