// Anonymizer.js
// Data Anonymization Module

const crypto = require('crypto');

class Anonymizer {
  constructor(config = {}) {
    this.config = config;
  }

  // Configure anonymization options
  configureAnonymization(options) {
    this.config = { ...this.config, ...options };
  }

  // Anonymize a field (e.g., mask or hash)
  anonymizeField(data, fieldName, options = {}) {
    const method = options.method || this.config[fieldName]?.method || 'mask';
    if (!data[fieldName]) return data;
    let anonymized;
    if (method === 'hash') {
      anonymized = crypto.createHash('sha256').update(data[fieldName]).digest('hex');
    } else if (method === 'mask') {
      anonymized = data[fieldName].replace(/./g, '*');
    } else {
      anonymized = data[fieldName];
    }
    return { ...data, [fieldName]: anonymized };
  }

  // Pseudonymize a field (e.g., reversible tokenization)
  pseudonymizeField(data, fieldName, options = {}) {
    // For demo: simple base64 encoding (not secure for real use)
    if (!data[fieldName]) return data;
    const pseudonymized = Buffer.from(data[fieldName]).toString('base64');
    return { ...data, [fieldName]: pseudonymized };
  }
}

module.exports = Anonymizer; 