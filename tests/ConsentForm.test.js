const ConsentForm = require('../lib/consent/ConsentForm');
const fs = require('fs');
const path = require('path');
const CONSENTS_PATH = path.join(__dirname, '../data/consents.json');

describe('ConsentForm Module', () => {
  let consent;
  beforeEach(() => {
    consent = new ConsentForm();
    // Clear the consents file before each test
    if (fs.existsSync(CONSENTS_PATH)) {
      fs.unlinkSync(CONSENTS_PATH);
    }
  });

  test('showConsentForm should be a function', () => {
    expect(typeof consent.showConsentForm).toBe('function');
  });

  test('storeConsent should be a function', () => {
    expect(typeof consent.storeConsent).toBe('function');
  });

  test('getConsentStatus should be a function', () => {
    expect(typeof consent.getConsentStatus).toBe('function');
  });

  test('should store and retrieve consent status', async () => {
    await consent.storeConsent('user1', { marketing: true });
    expect(await consent.getConsentStatus('user1', 'marketing')).toBe(true);
    expect(await consent.getConsentStatus('user1', 'analytics')).toBe(false);
  });

  test('upsertConsent should store consent like storeConsent', async () => {
    await consent.upsertConsent('user2', { analytics: true });
    expect(await consent.getConsentStatus('user2', 'analytics')).toBe(true);
  });

  test('getAllConsents should return all stored consents', async () => {
    await consent.storeConsent('user3', { marketing: false });
    const allConsents = await consent.getAllConsents();
    expect(allConsents).toHaveProperty('user3');
    expect(allConsents['user3'].marketing).toBe(false);
  });

  test('deleteConsent should remove a user consent', async () => {
    await consent.storeConsent('user4', { marketing: true });
    expect(await consent.deleteConsent('user4')).toBe(true);
    expect(await consent.getConsentStatus('user4', 'marketing')).toBe(false);
  });

  test('deleteConsent should return false for non-existent user', async () => {
    expect(await consent.deleteConsent('nonexistent')).toBe(false);
  });

  test('registerStrategy should allow custom consent storage', async () => {
    let called = false;
    ConsentForm.registerStrategy('custom', (userId, preferences) => {
      called = true;
      return { userId, preferences };
    });
    const customConsent = new ConsentForm({ strategy: 'custom' });
    await customConsent.storeConsent('user5', { test: true });
    expect(called).toBe(true);
  });

  test('getConsentStatus should return false for non-existent user or purpose', async () => {
    expect(await consent.getConsentStatus('ghost', 'none')).toBe(false);
  });

  test('setCustomUI should override the default UI and call the correct callback', done => {
    let called = '';
    ConsentForm.setCustomUI((onAccept, onReject) => {
      called = 'custom';
      onAccept();
    });
    const form = new ConsentForm();
    form.showConsentForm(
      () => {
        expect(called).toBe('custom');
        done();
      },
      () => {
        throw new Error('Should not call onReject');
      }
    );
  });

  // Add more specific tests as implementation details are available
}); 