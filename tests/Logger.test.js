const Logger = require('../lib/logging/Logger');
const fs = require('fs');
const path = require('path');

describe('Logger Module', () => {
  let logger;
  beforeEach(async () => {
    logger = new Logger();
    await logger.clearLogs();
    // Only remove the log file used by Logger
    const LOGS_PATH = path.join(__dirname, '../data/logs.json');
    if (fs.existsSync(LOGS_PATH)) {
      fs.unlinkSync(LOGS_PATH);
    }
  });

  test('logDataProcessing should be a function', () => {
    expect(typeof logger.logDataProcessing).toBe('function');
  });

  test('getLogsForAudit should be a function', () => {
    expect(typeof logger.getLogsForAudit).toBe('function');
  });

  test('secureLogStorage should be a function', () => {
    expect(typeof logger.secureLogStorage).toBe('function');
  });

  test('should log and retrieve data processing activities', async () => {
    await logger.logDataProcessing('User login', { userId: 'user1' });
    await logger.flush();
    const logs = await logger.getLogsForAudit();
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].activity).toBe('User login');
  });

  test('getLogByIndex should return a log entry or null', async () => {
    await logger.logDataProcessing('Test Activity', { foo: 'bar' });
    await logger.flush();
    const logs = await logger.getLogsForAudit();
    expect(await logger.getLogByIndex(0)).toEqual(logs[0]);
    expect(await logger.getLogByIndex(9999)).toBeNull();
  });

  test('deleteLogByIndex should remove a log entry', async () => {
    await logger.logDataProcessing('Delete Test', { a: 1 });
    await logger.flush();
    const logsBefore = await logger.getLogsForAudit();
    expect(await logger.deleteLogByIndex(0)).toBe(true);
    await logger.flush();
    const logsAfter = await logger.getLogsForAudit();
    expect(logsAfter.length).toBeLessThan(logsBefore.length);
  });

  test('deleteLogByIndex should return false for out-of-bounds index', async () => {
    expect(await logger.deleteLogByIndex(9999)).toBe(false);
  });

  test('clearLogs should remove all logs', async () => {
    await logger.logDataProcessing('Clear Test', { b: 2 });
    await logger.flush();
    await logger.clearLogs();
    await logger.flush();
    expect((await logger.getLogsForAudit()).length).toBe(0);
  });
}); 