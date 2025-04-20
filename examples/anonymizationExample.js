// Example: Anonymization of User Data

const Anonymizer = require('../lib/anonymization/Anonymizer');

const anonymizer = new Anonymizer();

(async () => {
  try {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main St',
      phone: '555-1234'
    };
    const anonymized = anonymizer.anonymizeField(userData, 'email', { method: 'mask' });
    console.log('Original:', userData);
    console.log('Anonymized:', anonymized);
  } catch (err) {
    console.error('Error anonymizing data:', err);
  }
})(); 