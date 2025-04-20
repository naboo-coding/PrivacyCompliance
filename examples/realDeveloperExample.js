// Example: How a real developer would use the Privacy Compliance Library

(async () => {
  try {
    // Import main modules
    const ConsentForm = require('../lib/consent/ConsentForm');
    const DSARManager = require('../lib/dsar/DSARManager');
    const Anonymizer = require('../lib/anonymization/Anonymizer');

    // Initialize ConsentForm
    const consent = new ConsentForm();

    // --- Consent Management ---
    // Test the default consent UI (CLI prompt or web modal)
    console.log('Testing ConsentForm.showDefaultConsentForm()...');
    const accepted = await ConsentForm.showDefaultConsentForm();
    if (accepted) {
      console.log('User accepted consent (via default UI)');
      await consent.storeConsent('user456', { marketing: true });
    } else {
      console.log('User rejected consent (via default UI)');
      await consent.storeConsent('user456', { marketing: false });
    }
    const status = await consent.getConsentStatus('user456', 'marketing');
    console.log('Consent status:', status);
    console.log('Consent management section complete.');

    // --- Custom UI Handler Test ---
    console.log('Testing custom UI handler for consent...');
    await new Promise((resolve) => {
      consent.showConsentForm(
        () => {
          console.log('Custom UI: User accepted consent');
          resolve();
        },
        () => {
          console.log('Custom UI: User rejected consent');
          resolve();
        }
      );
    });
    console.log('Custom UI handler test complete.');

    // If you want to simulate rejection, you could do:
    // console.log('Consent rejected');

    // --- DSAR (Data Subject Access Request) Management ---
    const dsar = new DSARManager();
    await dsar.requestDataCorrection('user456', { email: 'user456@email.com' });
    const userData = await dsar.requestDataAccess('user456');
    console.log('User data:', userData);
    await dsar.requestDataDeletion('user456');
    const userDataAfterDeletion = await dsar.requestDataAccess('user456');
    console.log('User data after deletion:', userDataAfterDeletion);
    console.log('DSAR management section complete.');

    // --- Anonymization Example ---
    const anonymizer = new Anonymizer();
    const originalData = { name: 'Alice', email: 'alice@email.com' };
    const anonymized = anonymizer.anonymize(originalData);
    console.log('Anonymized data:', anonymized);
    console.log('Anonymization section complete.');

    // See README.md for more advanced usage and integration tips.
    console.log('Example completed successfully.');
  } catch (err) {
    console.error('An error occurred during the example execution:', err);
  }
})(); 