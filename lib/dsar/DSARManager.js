// DSARManager.js
// Data Subject Access Requests (DSARs) Module

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const ValidationError = require('../errors/ValidationError');
const config = require(path.resolve(__dirname, '../../config/config.js'));

const LOGS_PATH = path.join(__dirname, '../../data/dsar_logs.json');
const USERS_PATH = path.join(__dirname, '../../data/dsar_users.json');

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

/**
 * Class to manage Data Subject Access Requests (DSARs).
 * Handles access, correction, deletion, and logging of user data requests.
 */
class DSARManager {
  /**
   * Create a DSARManager instance.
   */
  constructor() {}

  /**
   * Handle data access request for a user.
   * @param {string} userId - The user ID.
   * @returns {Object|null} The user data or null if not found.
   */
  async requestDataAccess(userId) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[DSARManager.requestDataAccess] userId must be a string');
    }
    await this.logDSARAction(userId, 'access');
    const users = await readJson(USERS_PATH, {});
    return users[userId] || null;
  }

  /**
   * Handle data correction request for a user.
   * @param {string} userId - The user ID.
   * @param {Object} fields - The fields to update.
   * @returns {Object} The updated user data.
   */
  async requestDataCorrection(userId, fields) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[DSARManager.requestDataCorrection] userId must be a string');
    }
    if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) {
      throw new ValidationError('[DSARManager.requestDataCorrection] fields must be a non-null object');
    }
    const users = await readJson(USERS_PATH, {});
    if (!users[userId]) users[userId] = {};
    Object.assign(users[userId], fields);
    await writeJson(USERS_PATH, users);
    await this.logDSARAction(userId, 'correction');
    return users[userId];
  }

  /**
   * Handle data deletion request for a user.
   * @param {string} userId - The user ID.
   * @returns {boolean} True if deletion was successful.
   */
  async requestDataDeletion(userId) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[DSARManager.requestDataDeletion] userId must be a string');
    }
    const users = await readJson(USERS_PATH, {});
    delete users[userId];
    await writeJson(USERS_PATH, users);
    await this.logDSARAction(userId, 'deletion');
    return true;
  }

  /**
   * Log DSAR actions for audit trails.
   * @param {string} userId - The user ID.
   * @param {string} actionType - The type of DSAR action.
   */
  async logDSARAction(userId, actionType) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[DSARManager.logDSARAction] userId must be a string');
    }
    if (typeof actionType !== 'string') {
      throw new ValidationError('[DSARManager.logDSARAction] actionType must be a string');
    }
    const logs = await readJson(LOGS_PATH, []);
    const logEntry = {
      userId,
      actionType,
      timestamp: new Date().toISOString()
    };
    logs.push(logEntry);
    await writeJson(LOGS_PATH, logs);
    console.log('DSAR Log:', logEntry);
  }

  /**
   * Retrieve all DSAR logs.
   * @returns {Array} Array of log entries.
   */
  async getLogs() {
    return await readJson(LOGS_PATH, []);
  }

  /**
   * Create or update a DSAR user record.
   * @param {string} userId - The user ID.
   * @param {Object} fields - The fields to update.
   * @returns {Object} The updated user data.
   */
  async upsertUser(userId, fields) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[DSARManager.upsertUser] userId must be a string');
    }
    if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) {
      throw new ValidationError('[DSARManager.upsertUser] fields must be a non-null object');
    }
    const users = await readJson(USERS_PATH, {});
    if (!users[userId]) users[userId] = {};
    Object.assign(users[userId], fields);
    await writeJson(USERS_PATH, users);
    return users[userId];
  }

  /**
   * Read all DSAR user records.
   * @returns {Object} All user records.
   */
  async getAllUsers() {
    return await readJson(USERS_PATH, {});
  }

  /**
   * Read a single DSAR user record.
   * @param {string} userId - The user ID.
   * @returns {Object|null} The user data or null if not found.
   */
  async getUser(userId) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[DSARManager.getUser] userId must be a string');
    }
    const users = await readJson(USERS_PATH, {});
    return users[userId] || null;
  }

  /**
   * Delete a DSAR user record.
   * @param {string} userId - The user ID.
   * @returns {boolean} True if deletion was successful.
   */
  async deleteUser(userId) {
    if (typeof userId !== 'string') {
      throw new ValidationError('[DSARManager.deleteUser] userId must be a string');
    }
    const users = await readJson(USERS_PATH, {});
    if (users[userId]) {
      delete users[userId];
      await writeJson(USERS_PATH, users);
      return true;
    }
    return false;
  }

  /**
   * Read a single DSAR log entry by index.
   * @param {number} index - The log entry index.
   * @returns {Object|null} The log entry or null if not found.
   */
  async getLogByIndex(index) {
    if (typeof index !== 'number' || !Number.isInteger(index)) {
      throw new ValidationError('[DSARManager.getLogByIndex] index must be an integer');
    }
    const logs = await readJson(LOGS_PATH, []);
    return logs[index] || null;
  }

  /**
   * Delete a DSAR log entry by index.
   * @param {number} index - The log entry index.
   * @returns {boolean} True if deletion was successful.
   */
  async deleteLogByIndex(index) {
    if (typeof index !== 'number' || !Number.isInteger(index)) {
      throw new ValidationError('[DSARManager.deleteLogByIndex] index must be an integer');
    }
    const logs = await readJson(LOGS_PATH, []);
    if (index >= 0 && index < logs.length) {
      logs.splice(index, 1);
      await writeJson(LOGS_PATH, logs);
      return true;
    }
    return false;
  }

  /**
   * Delete all DSAR logs.
   * @returns {boolean} True if logs were cleared.
   */
  async clearLogs() {
    await writeJson(LOGS_PATH, []);
    return true;
  }
}

module.exports = DSARManager;
module.exports.encrypt = encrypt;
module.exports.writeJson = writeJson; 