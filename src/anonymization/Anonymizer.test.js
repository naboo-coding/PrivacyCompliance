const Anonymizer = require('./Anonymizer');

describe('Anonymizer Module', () => {
  let anonymizer;
  beforeEach(() => {
    anonymizer = new Anonymizer();
  });

  test('anonymizeField should be a function', () => {
    expect(typeof anonymizer.anonymizeField).toBe('function');
  });

  test('pseudonymizeField should be a function', () => {
    expect(typeof anonymizer.pseudonymizeField).toBe('function');
  });

  test('configureAnonymization should be a function', () => {
    expect(typeof anonymizer.configureAnonymization).toBe('function');
  });

  test('should anonymize and pseudonymize fields', () => {
    const data = { email: 'user@email.com', name: 'John Doe' };
    const anon = anonymizer.anonymizeField(data, 'email', { method: 'mask' });
    expect(anon.email).toMatch(/^\*+$/);
    const pseudo = anonymizer.pseudonymizeField(data, 'name');
    expect(pseudo.name).not.toBe(data.name);
  });
}); 