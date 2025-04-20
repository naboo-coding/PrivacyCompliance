const Logger = require('./Logger');

describe('Logger Module', () => {
  let logger;
  beforeEach(() => {
    logger = new Logger();
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

  test('should log and retrieve data processing activities', () => {
    logger.logDataProcessing('User login', { userId: 'user1' });
    const logs = logger.getLogsForAudit();
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].activity).toBe('User login');
  });
}); 