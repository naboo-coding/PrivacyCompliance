// Example: Batch Operations for Multiple Users

const ConsentForm = require('../lib/consent/ConsentForm');
const DSARManager = require('../lib/dsar/DSARManager');

const consent = new ConsentForm();
const dsar = new DSARManager();

(async () => {
  const users = ['user1', 'user2', 'user3'];
  try {
    // Batch store consent
    await Promise.all(users.map(u => consent.storeConsent(u, { marketing: true })));
    // Batch request data access
    const data = await Promise.all(users.map(u => dsar.requestDataAccess(u)));
    console.log('Batch data access:', data);
  } catch (err) {
    console.error('Batch operation error:', err);
  }
})(); 