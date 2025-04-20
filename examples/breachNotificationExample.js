// Example: Breach Notification Workflow

const { notifyBreach } = require('../lib/consent/breachNotifier');

(async () => {
  try {
    // Simulate a data breach event
    const breachDetails = {
      userId: 'user123',
      type: 'data_leak',
      description: 'Sensitive data exposed',
      timestamp: new Date().toISOString()
    };
    await notifyBreach(breachDetails);
    console.log('Breach notification sent:', breachDetails);
  } catch (err) {
    console.error('Error sending breach notification:', err);
  }
})(); 