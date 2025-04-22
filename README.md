# Privacy Compliance Library
<p align="left">
  <a href="https://www.npmjs.com/package/privacycompliancelibrary"><img src="https://img.shields.io/npm/v/privacy-lib.svg?style=flat-square" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License"></a>
</p>

A JavaScript library for managing privacy compliance, including user consent, DSAR handling, data anonymization, audit logging, breach notification, and extensible strategies, suitable for both Node.js and browser environments.


> **⚠️ DISCLAIMER:**
> This library is provided for educational and compliance support purposes only. It does not constitute legal advice. The authors are not responsible for any misuse or failure to comply with applicable privacy laws and regulations. Always consult with a qualified legal professional for compliance matters.

---

## Feature Overview

- **Consent Management:** Display, store, retrieve, and revoke user consent for various data processing purposes.
- **DSAR Handling:** Manage Data Subject Access Requests (DSARs), including access, correction, deletion, and action logging.
- **Data Anonymization:** Anonymize and pseudonymize user data fields with configurable strategies.
- **Comprehensive Logging & Audit Trail:** Log data processing activities, retrieve logs, and maintain an audit trail for compliance.
- **Breach Notification:** Log and simulate admin notification of data breaches.
- **REST API:** Expose endpoints for consent management, audit retrieval, and breach notification.
- **Extensible:** Register custom anonymization and consent strategies at runtime.
- **JavaScript Only:** Works in Node.js and browser environments (with bundling; see Advanced Usage).

---

## Installation

Install via npm:
```sh
npm i privacycompliancelibrary
```

---

## Usage & Examples

### Quick Start

```js
import { showConsentForm, storeConsent, getConsentStatus } from 'privacy-lib/consent';
import { requestDataAccess, requestDataCorrection, requestDataDeletion } from 'privacy-lib/dsar';
import { anonymizeField, configureAnonymization } from 'privacy-lib/anonymization';
import { logDataProcessing, getLogs } from 'privacy-lib/logging';

// Show consent form (UI integration required; see below)
showConsentForm({ purposes: ['analytics', 'marketing'] });

// Store user consent
storeConsent('user123', { analytics: true, marketing: false });

// Get consent status
const status = getConsentStatus('user123', 'analytics');
console.log('Consent for analytics:', status);

// Request data access
requestDataAccess('user123');

// Anonymize email field
const anonData = anonymizeField({ email: 'user@email.com' }, 'email');

// Configure anonymization
configureAnonymization({ strategy: 'hash', salt: 'somesalt' });

// Log a data processing activity
logDataProcessing('User login', { userId: 'user123' });

// Retrieve logs
const logs = getLogs({ userId: 'user123' });
console.log(logs);
```

### Consent UI Integration

The `showConsentForm` method is a placeholder. You must implement your own UI and call the provided callbacks. For a web app, display a modal or popup; for CLI, prompt in the terminal. See [Consent UI Integration Details](#consent-ui-integration-details) for more.

#### Customizing the Consent Form UI at Runtime

You can override the default consent form UI at runtime by registering your own UI handler. Use `ConsentForm.setCustomUI(fn)` to provide a function that receives `onAccept` and `onReject` callbacks. This allows you to fully control the UI and user experience:

```js
const ConsentForm = require('./lib/consent/ConsentForm');

// Register a custom UI handler
ConsentForm.setCustomUI((onAccept, onReject) => {
  // Your custom UI logic here (e.g., show a custom modal, use a different prompt, etc.)
  // Call onAccept() if the user accepts, or onReject() if the user rejects
  if (window && window.confirm('Do you accept our terms?')) {
    onAccept();
  } else {
    onReject();
  }
});

// Later, when you want to show the consent form:
const form = new ConsentForm();
form.showConsentForm(
  () => console.log('User accepted!'),
  () => console.log('User rejected!')
);
```

If no custom UI is registered, the library will use the default modal (web) or prompt (CLI).

### Example Scripts

- `examples/realDeveloperExample.js`: Comprehensive usage (consent, DSAR, anonymization)
- `examples/breachNotificationExample.js`: Breach notification workflow
- `examples/auditTrailExample.js`: Audit trail logging and retrieval
- `examples/anonymizationExample.js`: Anonymization strategies
- `examples/batchOperationsExample.js`: Batch operations
- `examples/errorHandlingExample.js`: Error handling patterns
- `examples/consentWebTest.html`: UI logic demonstration (browser)

To run an example:
```sh
node examples/realDeveloperExample.js
```

---

## Configuration

Configure anonymization strategies and parameters to fit your compliance requirements:

```js
import { configureAnonymization } from 'privacy-lib/anonymization';

configureAnonymization({
  strategy: 'hash', // Available: 'hash', 'pseudonymize', 'mask', 'reverse', etc.
  salt: 'somesalt',
});
```

Refer to the documentation for all available strategies and configuration options.

---

## API Reference

### Consent Management
- `showConsentForm(options)` — Display consent form (UI integration required)
- `storeConsent(userId, preferences)` — Store user consent
- `getConsentStatus(userId, purpose)` — Retrieve consent status
- `withdrawConsent(userId, purposes)` — Revoke consent (all or specific purposes)

### DSAR Management
- `requestDataAccess(userId)` — Retrieve user data
- `requestDataCorrection(userId, fields)` — Update user data
- `requestDataDeletion(userId)` — Delete user data
- `logDSARAction(userId, actionType)` — Log DSAR action

### Anonymization
- `configureAnonymization(options)` — Set anonymization config
- `anonymizeField(data, fieldName, options)` — Anonymize a field
- `pseudonymizeField(data, fieldName, options)` — Pseudonymize a field
- `registerStrategy(name, fn)` — Register custom anonymization strategy

### Logging, Audit, and Breach Notification
- `logDataProcessing(action, details)` — Log data processing activity
- `getLogs(filter)` — Retrieve logs
- `logAudit(action, userId, details)` — Log audit trail entry
- `notifyBreach(details)` — Log and notify of a data breach

### REST API
- `POST /api/consent` — Store consent
- `GET /api/consent/:userId` — Retrieve consent
- `DELETE /api/consent/:userId` — Revoke consent
- `GET /api/consent/audit` — Retrieve audit trail
- `POST /api/consent/breach` — Trigger breach notification

### Error Handling
- Custom errors (e.g., `ValidationError`) are thrown for invalid input. Use try/catch to handle errors in your integration.

---

## How to Extend

You can register your own anonymization or consent strategies at runtime:

```js
const Anonymizer = require('./src/anonymization/Anonymizer');
Anonymizer.registerStrategy('reverse', (value, options) => {
  return typeof value === 'string' ? value.split('').reverse().join('') : value;
});
```

For consent strategies:
```js
const ConsentForm = require('./src/consent/ConsentForm');
ConsentForm.registerStrategy('consoleLog', (userId, preferences, options) => {
  console.log(`Consent for ${userId}:`, preferences);
});
```

---

## Advanced Usage

### Browser Support

To use in the browser, bundle with Webpack, Browserify, or Parcel. Node.js-only modules (e.g., `fs`) are not available in the browser. For persistent storage in the browser, implement your own (e.g., `localStorage`).

#### Example: Bundling with Webpack
1. Install dependencies:
   ```sh
   npm install --save-dev webpack webpack-cli path-browserify crypto-browserify
   ```
2. Create an entry point (e.g., `browserEntry.js`):
   ```js
   const ConsentForm = require('./lib/consent/ConsentForm');
   window.ConsentForm = ConsentForm;
   ```
3. Create a `webpack.config.js`:
   ```js
   const path = require('path');
   module.exports = {
     entry: './browserEntry.js',
     output: {
       filename: 'consentForm.bundle.js',
       path: path.resolve(__dirname, 'dist'),
     },
     resolve: {
       fallback: {
         fs: false,
         path: require.resolve('path-browserify'),
         crypto: require.resolve('crypto-browserify'),
       },
     },
   };
   ```
4. Build the bundle:
   ```sh
   npx webpack
   ```
5. Include in your HTML:
   ```html
   <script src="dist/consentForm.bundle.js"></script>
   <script>
     ConsentForm.showDefaultConsentForm().then(...);
   </script>
   ```

---

## Data Storage & Security

- **Logs, audit trails, and breach logs** are stored in the `data/` directory as JSON files.
- For secure log storage, use `secureLogStorage({ encryption: true })`.
- In browser environments, implement your own storage (e.g., `localStorage`).

---

## Consent UI Integration Details

The `ConsentForm.showConsentForm` method is a placeholder and does not display any UI or call the provided callbacks. To collect real user consent, implement your own UI and call the `onAccept` or `onReject` callbacks based on user action.

**Web Example:**
```js
showConsentForm(onAccept, onReject) {
  // Display your modal or popup here
  // If user clicks accept: onAccept();
  // If user clicks reject: onReject();
}
```

**CLI Example:**
```js
showConsentForm(onAccept, onReject) {
  const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
  readline.question('Do you accept? (y/n): ', answer => {
    if (answer.toLowerCase() === 'y') onAccept();
    else onReject();
    readline.close();
  });
}
```

The library also provides a default UI for both web and CLI environments:
```js
const ConsentForm = require('./src/consent/ConsentForm');
ConsentForm.showDefaultConsentForm().then(accepted => {
  if (accepted) {
    // User accepted
  } else {
    // User rejected
  }
});
```

---

## Contributing

Contributions, issues, and suggestions are welcome! Please open an issue or submit a pull request via GitHub. For major changes, please discuss them first to ensure alignment with the project goals.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Project Structure (Appendix)

- `src/` — Main entry points (e.g., API/server code)
- `lib/` — Core library modules (consent, anonymization, dsar, logging, errors)
- `config/` — Configuration files (`config.js`, `testConfig.js`)
- `examples/` — Example usage scripts
- `data/` — Runtime or persistent data (JSON logs, audit, breach logs)
- `tests/` — All test files (unit and integration)
- `node_modules/` — Installed dependencies
- `.git/`, `.gitignore` — Git version control
- `README.md`, `CONTRIBUTING.md`, `LICENSE` — Project documentation and license
