const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const BREACH_LOG_PATH = path.join(__dirname, '../../data/breachLog.json');

async function notifyBreach(details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    details
  };
  let breachLog = [];
  try {
    if (fs.existsSync(BREACH_LOG_PATH)) {
      const data = await fsp.readFile(BREACH_LOG_PATH, 'utf8');
      breachLog = JSON.parse(data);
    }
  } catch (e) {
    // ignore, start fresh
  }
  breachLog.push(entry);
  await fsp.writeFile(BREACH_LOG_PATH, JSON.stringify(breachLog, null, 2), 'utf8');
  // Simulate admin notification (could be email, webhook, etc.)
  console.log('Data breach detected! Admin notified.', entry);
}

module.exports = { notifyBreach }; 