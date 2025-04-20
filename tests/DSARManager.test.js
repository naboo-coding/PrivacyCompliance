const DSARManager = require('../lib/dsar/DSARManager');
const fs = require('fs');
const path = require('path');
const USERS_PATH = path.join(__dirname, '../../data/dsar_users.json');
const { encrypt } = require('../lib/dsar/DSARManager');

describe('DSARManager Module', () => {
  let dsar;
  beforeEach(async () => {
    dsar = new DSARManager();
    await dsar.clearLogs();
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    fs.writeFileSync(USERS_PATH, encrypt('{}'), 'utf8');
  });

  test('requestDataAccess should be a function', () => {
    expect(typeof dsar.requestDataAccess).toBe('function');
  });

  test('requestDataCorrection should be a function', () => {
    expect(typeof dsar.requestDataCorrection).toBe('function');
  });

  test('requestDataDeletion should be a function', () => {
    expect(typeof dsar.requestDataDeletion).toBe('function');
  });

  test('logDSARAction should be a function', () => {
    expect(typeof dsar.logDSARAction).toBe('function');
  });

  test('should handle data correction, access, and deletion', async () => {
    await dsar.requestDataCorrection('user1', { email: 'test@email.com' });
    expect(await dsar.requestDataAccess('user1')).toEqual({ email: 'test@email.com' });
    await dsar.requestDataDeletion('user1');
    expect(await dsar.requestDataAccess('user1')).toBeNull();
  });

  test('upsertUser should create or update a user', async () => {
    await dsar.upsertUser('user2', { name: 'Alice' });
    expect(await dsar.getUser('user2')).toEqual({ name: 'Alice' });
    await dsar.upsertUser('user2', { email: 'alice@email.com' });
    expect(await dsar.getUser('user2')).toEqual({ name: 'Alice', email: 'alice@email.com' });
  });

  test('getAllUsers should return all users', async () => {
    await dsar.upsertUser('user3', { name: 'Bob' });
    const allUsers = await dsar.getAllUsers();
    expect(allUsers).toHaveProperty('user3');
    expect(allUsers['user3'].name).toBe('Bob');
  });

  test('getUser should return null for non-existent user', async () => {
    expect(await dsar.getUser('ghost')).toBeNull();
  });

  test('deleteUser should remove a user', async () => {
    await dsar.upsertUser('user4', { name: 'Charlie' });
    expect(await dsar.deleteUser('user4')).toBe(true);
    expect(await dsar.getUser('user4')).toBeNull();
  });

  test('deleteUser should return false for non-existent user', async () => {
    expect(await dsar.deleteUser('nonexistent')).toBe(false);
  });

  test('getLogs should return an array', async () => {
    expect(Array.isArray(await dsar.getLogs())).toBe(true);
  });

  test('logDSARAction and getLogByIndex should work', async () => {
    await dsar.logDSARAction('user5', 'access');
    const logs = await dsar.getLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(await dsar.getLogByIndex(0)).toEqual(logs[0]);
  });

  test('getLogByIndex should return null for out-of-bounds index', async () => {
    expect(await dsar.getLogByIndex(9999)).toBeNull();
  });

  test('deleteLogByIndex should remove a log entry', async () => {
    await dsar.logDSARAction('user6', 'deletion');
    const logsBefore = await dsar.getLogs();
    expect(await dsar.deleteLogByIndex(0)).toBe(true);
    const logsAfter = await dsar.getLogs();
    expect(logsAfter.length).toBeLessThan(logsBefore.length);
  });

  test('deleteLogByIndex should return false for out-of-bounds index', async () => {
    expect(await dsar.deleteLogByIndex(9999)).toBe(false);
  });

  test('clearLogs should remove all logs', async () => {
    await dsar.logDSARAction('user7', 'access');
    await dsar.clearLogs();
    expect((await dsar.getLogs()).length).toBe(0);
  });

  // Add more specific tests as implementation details are available
}); 