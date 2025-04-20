const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fsp = fs.promises;
const config = require(path.resolve(__dirname, '../../config/config.js'));

const LOGS_PATH = path.join(__dirname, '../../data/logs.json');
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

class Logger {
  constructor() {
    this.logBuffer = [];
    this.bufferLimit = 10; // Flush after 10 logs (can be adjusted)
    this.flushInterval = 5000; // Flush every 5 seconds (can be adjusted)
    this._flushTimer = setInterval(() => this.flush(), this.flushInterval);
    // Ensure flush on process exit
    process.on('exit', () => this.flushSync());
    process.on('SIGINT', () => { this.flushSync(); process.exit(); });
  }

  // Log a data processing activity (Create)
  async logDataProcessing(activity, details) {
    const logEntry = {
      activity,
      details,
      timestamp: new Date().toISOString(),
    };
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length >= this.bufferLimit) {
      await this.flush();
    }
    console.log('Data Processing Log (secure):', logEntry);
  }

  // Retrieve all logs for audit (Read)
  async getLogsForAudit(filterFn = null) {
    const logs = await readJson(LOGS_PATH, []);
    if (typeof filterFn === 'function') {
      return logs.filter(filterFn);
    }
    return logs;
  }

  // Retrieve a single log entry by index (Read)
  async getLogByIndex(index) {
    const logs = await readJson(LOGS_PATH, []);
    return logs[index] || null;
  }

  // Delete a log entry by index (Delete)
  async deleteLogByIndex(index) {
    const logs = await readJson(LOGS_PATH, []);
    if (index >= 0 && index < logs.length) {
      logs.splice(index, 1);
      await writeJson(LOGS_PATH, logs);
      return true;
    }
    return false;
  }

  // Delete all logs (Delete)
  async clearLogs() {
    await writeJson(LOGS_PATH, []);
    return true;
  }

  // Simulate secure log storage configuration
  secureLogStorage(options) {
    this._secureOptions = options;
    console.log('Secure log storage configured:', options);
  }

  async flush() {
    if (this.logBuffer.length === 0) return;
    const logs = await readJson(LOGS_PATH, []);
    logs.push(...this.logBuffer);
    await writeJson(LOGS_PATH, logs);
    this.logBuffer = [];
  }

  flushSync() {
    if (this.logBuffer.length === 0) return;
    let logs = [];
    try {
      if (fs.existsSync(LOGS_PATH)) {
        const data = fs.readFileSync(LOGS_PATH, 'utf8');
        const decrypted = decrypt(data);
        logs = JSON.parse(decrypted);
      }
    } catch (e) {
      logs = [];
    }
    logs.push(...this.logBuffer);
    const json = JSON.stringify(logs, null, 2);
    const encrypted = encrypt(json);
    fs.writeFileSync(LOGS_PATH, encrypted, 'utf8');
    this.logBuffer = [];
  }
}

module.exports = Logger; 