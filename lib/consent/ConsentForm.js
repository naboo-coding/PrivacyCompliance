// ConsentForm.js
// Consent Management: Display Consent Form
// Now supports consent withdrawal and revocation (see withdrawConsent)

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const ValidationError = require('../errors/ValidationError');
const { logAudit } = require('./auditTrail');
const { notifyBreach } = require('./breachNotifier');
const config = require(path.resolve(__dirname, '../../config/config.js'));

const CONSENTS_PATH = path.join(__dirname, '../../data/consents.json');

const ENCRYPTION_KEY_RAW = config.ENCRYPTION_KEY || process.env.PRIVACY_KEY || 'default_secret_key_12345678901234'; // 32 chars for aes-256
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_RAW.padEnd(32, '0').slice(0, 32)); // Ensure 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

async function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const data = await fsp.readFile(filePath, 'utf8');
    const decrypted = decrypt(data);
    return JSON.parse(decrypted);
  } catch (e) {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  const encrypted = encrypt(json);
  await fsp.writeFile(filePath, encrypted, 'utf8');
}

class ConsentForm {
  static strategies = {};
  constructor(options = {}) {
    if (typeof options !== 'object' || options === null || Array.isArray(options)) {
      throw new ValidationError('[ConsentForm.constructor] options must be a non-null object');
    }
    this.options = options;
  }

  showConsentForm(onAccept, onReject) {
    if (onAccept && typeof onAccept !== 'function') {
      throw new ValidationError('[ConsentForm.showConsentForm] onAccept must be a function if provided');
    }
    if (onReject && typeof onReject !== 'function') {
      throw new ValidationError('[ConsentForm.showConsentForm] onReject must be a function if provided');
    }
    // Detect environment: browser or Node.js
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    if (isBrowser) {
      // Web implementation: show a modal/popup
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.5)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '9999';
      modal.innerHTML = `
        <div style="background: white; padding: 2em; border-radius: 8px; box-shadow: 0 2px 16px rgba(0,0,0,0.2); text-align: center;">
          <h2>Consent Required</h2>
          <p>Do you accept?</p>
          <button id="consent-accept" style="margin: 0 1em;">Accept</button>
          <button id="consent-reject" style="margin: 0 1em;">Reject</button>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('consent-accept').onclick = () => {
        document.body.removeChild(modal);
        onAccept();
      };
      document.getElementById('consent-reject').onclick = () => {
        document.body.removeChild(modal);
        onReject();
      };
    } else {
      // CLI implementation: prompt the user in the terminal
      const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
      readline.question('Do you accept? (y/n): ', answer => {
        if (answer.toLowerCase() === 'y') onAccept();
        else onReject();
        readline.close();
      });
    }
  }

  // Store user consent preferences (persistent storage)
  async storeConsent(userId, preferences, options = {}) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[ConsentForm.storeConsent] userId must be a string');
    }
    if (typeof preferences !== 'object' || preferences === null || Array.isArray(preferences)) {
      throw new ValidationError('[ConsentForm.storeConsent] preferences must be a non-null object');
    }
    if (typeof options !== 'object' || options === null || Array.isArray(options)) {
      throw new ValidationError('[ConsentForm.storeConsent] options must be a non-null object');
    }
    const strategy = options.strategy || this.options.strategy;
    if (strategy && ConsentForm.strategies[strategy]) {
      return ConsentForm.strategies[strategy](userId, preferences, options);
    }
    const consents = await readJson(CONSENTS_PATH, {});
    consents[userId] = preferences;
    await writeJson(CONSENTS_PATH, consents);
    await logAudit('storeConsent', userId, { preferences });
  }

  // Retrieve user consent preferences
  async getConsentStatus(userId, purpose) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[ConsentForm.getConsentStatus] userId must be a string');
    }
    if (typeof purpose !== 'string') {
      throw new ValidationError('[ConsentForm.getConsentStatus] purpose must be a string');
    }
    const consents = await readJson(CONSENTS_PATH, {});
    if (!consents[userId]) return false;
    return !!consents[userId][purpose];
  }

  // Create or update user consent preferences
  async upsertConsent(userId, preferences, options = {}) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[ConsentForm.upsertConsent] userId must be a string');
    }
    if (typeof preferences !== 'object' || preferences === null || Array.isArray(preferences)) {
      throw new ValidationError('[ConsentForm.upsertConsent] preferences must be a non-null object');
    }
    if (typeof options !== 'object' || options === null || Array.isArray(options)) {
      throw new ValidationError('[ConsentForm.upsertConsent] options must be a non-null object');
    }
    await this.storeConsent(userId, preferences, options);
    await logAudit('upsertConsent', userId, { preferences });
  }

  // Read user consent preferences (all or by userId)
  async getAllConsents() {
    return await readJson(CONSENTS_PATH, {});
  }

  // Delete user consent preferences
  async deleteConsent(userId) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[ConsentForm.deleteConsent] userId must be a string');
    }
    const consents = await readJson(CONSENTS_PATH, {});
    if (consents[userId]) {
      delete consents[userId];
      await writeJson(CONSENTS_PATH, consents);
      await logAudit('deleteConsent', userId, {});
      return true;
    }
    return false;
  }

  /**
   * Withdraw or revoke consent for specific purposes or all purposes.
   * @param {string} userId - The user identifier.
   * @param {string|string[]|null} purposes - Purposes to withdraw (string or array), or null for all.
   * @returns {Promise<boolean>} True if consent was withdrawn, false if not found.
   */
  async withdrawConsent(userId, purposes = null) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[ConsentForm.withdrawConsent] userId must be a string');
    }
    const consents = await readJson(CONSENTS_PATH, {});
    if (!consents[userId]) {
      return false;
    }
    if (!purposes) {
      // Remove all consents for the user
      delete consents[userId];
    } else {
      if (!Array.isArray(purposes)) {
        purposes = [purposes];
      }
      for (const purpose of purposes) {
        delete consents[userId][purpose];
      }
      // If no purposes left, remove the user entry
      if (Object.keys(consents[userId]).length === 0) {
        delete consents[userId];
      }
    }
    await writeJson(CONSENTS_PATH, consents);
    await logAudit('withdrawConsent', userId, { purposes });
    return true;
  }

  static registerStrategy(name, fn) {
    if (typeof name !== 'string') {
      throw new ValidationError('[ConsentForm.registerStrategy] name must be a string');
    }
    if (typeof fn !== 'function') {
      throw new ValidationError('[ConsentForm.registerStrategy] fn must be a function');
    }
    ConsentForm.strategies[name] = fn;
  }

  static showDefaultConsentForm(options = {}) {
    return new Promise((resolve) => {
      const form = new ConsentForm(options);
      form.showConsentForm(
        () => resolve(true),
        () => resolve(false)
      );
    });
  }
}

module.exports = ConsentForm; 