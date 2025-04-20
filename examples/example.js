// Consent Management Example
const ConsentForm = require('../src/consent/ConsentForm');
const DSARManager = require('../src/dsar/DSARManager');
// Uncomment and implement these as needed:
// const Anonymizer = require('../src/anonymization/Anonymizer');
// const Logger = require('../src/logging/Logger');

// Consent Management
const consent = new ConsentForm();
consent.showConsentForm(
  () => {
    console.log('Consent accepted');
    consent.storeConsent('user123', { marketing: true });
    console.log('Consent status:', consent.getConsentStatus('user123', 'marketing'));
  },
  () => {
    console.log('Consent rejected');
  }
);

// DSARs
const dsar = new DSARManager();
dsar.requestDataCorrection('user123', { email: 'new@email.com' });
console.log('Data after correction:', dsar.requestDataAccess('user123'));
dsar.requestDataDeletion('user123');
console.log('Data after deletion:', dsar.requestDataAccess('user123'));
dsar.logDSARAction('user123', 'access');
console.log('DSAR logs:', dsar.getLogs()); 