// Anonymizer.js
// Data Anonymization Module

const crypto = require('crypto');
const ValidationError = require('../errors/ValidationError');

/**
 * Class for data anonymization and pseudonymization.
 * Supports masking, hashing, and custom strategies.
 */
class Anonymizer {
  static strategies = {};
  /**
   * Create an Anonymizer instance.
   * @param {Object} [config={}] - Configuration options for anonymization.
   */
  constructor(config = {}) {
    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
      throw new ValidationError('[Anonymizer.constructor] config must be a non-null object');
    }
    this.config = config;
  }

  /**
   * Configure anonymization options.
   * @param {Object} options - Anonymization options to merge with current config.
   */
  configureAnonymization(options) {
    if (typeof options !== 'object' || options === null || Array.isArray(options)) {
      throw new ValidationError('[Anonymizer.configureAnonymization] options must be a non-null object');
    }
    this.config = { ...this.config, ...options };
  }

  /**
   * Anonymize a field (e.g., mask or hash).
   * @param {Object} data - The data object containing the field.
   * @param {string} fieldName - The name of the field to anonymize.
   * @param {Object} [options={}] - Options for anonymization (e.g., method).
   * @returns {Object} The data object with the anonymized field.
   */
  anonymizeField(data, fieldName, options = {}) {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new ValidationError('[Anonymizer.anonymizeField] data must be a non-null object');
    }
    if (typeof fieldName !== 'string') {
      throw new ValidationError('[Anonymizer.anonymizeField] fieldName must be a string');
    }
    if (typeof options !== 'object' || options === null || Array.isArray(options)) {
      throw new ValidationError('[Anonymizer.anonymizeField] options must be a non-null object');
    }
    const method = options.method || this.config[fieldName]?.method || 'mask';
    if (!data[fieldName]) return data;
    let anonymized;
    if (Anonymizer.strategies[method]) {
      anonymized = Anonymizer.strategies[method](data[fieldName], options);
    } else if (method === 'hash') {
      anonymized = crypto.createHash('sha256').update(data[fieldName]).digest('hex');
    } else if (method === 'mask') {
      anonymized = data[fieldName].replace(/./g, '*');
    } else {
      anonymized = data[fieldName];
    }
    return { ...data, [fieldName]: anonymized };
  }

  /**
   * Pseudonymize a field (e.g., reversible tokenization).
   * @param {Object} data - The data object containing the field.
   * @param {string} fieldName - The name of the field to pseudonymize.
   * @param {Object} [options={}] - Options for pseudonymization.
   * @returns {Object} The data object with the pseudonymized field.
   */
  pseudonymizeField(data, fieldName, options = {}) {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new ValidationError('[Anonymizer.pseudonymizeField] data must be a non-null object');
    }
    if (typeof fieldName !== 'string') {
      throw new ValidationError('[Anonymizer.pseudonymizeField] fieldName must be a string');
    }
    if (typeof options !== 'object' || options === null || Array.isArray(options)) {
      throw new ValidationError('[Anonymizer.pseudonymizeField] options must be a non-null object');
    }
    // For demo: simple base64 encoding (not secure for real use)
    if (!data[fieldName]) return data;
    const pseudonymized = Buffer.from(data[fieldName]).toString('base64');
    return { ...data, [fieldName]: pseudonymized };
  }

  /**
   * Register a custom anonymization strategy.
   * @param {string} name - The name of the strategy.
   * @param {Function} fn - The strategy function.
   */
  static registerStrategy(name, fn) {
    if (typeof name !== 'string') {
      throw new ValidationError('[Anonymizer.registerStrategy] name must be a string');
    }
    if (typeof fn !== 'function') {
      throw new ValidationError('[Anonymizer.registerStrategy] fn must be a function');
    }
    Anonymizer.strategies[name] = fn;
  }
}

module.exports = Anonymizer; 