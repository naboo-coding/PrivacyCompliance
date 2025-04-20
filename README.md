# Privacy Compliance Library

<p align="left">
  <a href="https://www.npmjs.com/package/privacy-lib"><img src="https://img.shields.io/npm/v/privacy-lib.svg?style=flat-square" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License"></a>
</p>

> **⚠️ DISCLAIMER:**
> This library is provided for educational and compliance support purposes only. It does not constitute legal advice. The authors are not responsible for any misuse or failure to comply with applicable privacy laws and regulations. Always consult with a qualified legal professional for compliance matters.

## Why Choose Privacy Compliance Library?

- **Purpose-Built for Privacy Compliance:** Designed for organizations, developers, and privacy professionals seeking robust tools to manage user consent, data subject requests (DSARs), and data anonymization in line with global privacy regulations (GDPR, CCPA, etc.).
- **Risk-Free Integration:** All operations are implemented with a focus on user safety, transparency, and compliance best practices.
- **Modular & Extensible:** Easily integrate consent management, DSAR handling, anonymization, and logging into your existing applications.
- **Comprehensive Observability:** Built-in logging and secure storage provide visibility and auditability for compliance workflows.
- **Configurable & Adaptable:** Supports customizable anonymization strategies and flexible integration for both frontend (JavaScript) and backend (Java) environments.

## Key Features

- **Consent Management:** Display, store, and retrieve user consent for various data processing purposes.
- **DSAR Handling:** Manage Data Subject Access Requests, including access, correction, deletion, and action logging.
- **Data Anonymization:** Anonymize and pseudonymize user data fields with configurable strategies.
- **Comprehensive Logging:** Log data processing activities, retrieve logs, and configure secure log storage.
- **Multi-Platform Support:** Integrate seamlessly with both JavaScript (frontend/backend) and Java (backend) applications.
- **Configurable Anonymization:** Easily set anonymization strategies and parameters to fit your compliance needs.

## Installation

### JavaScript

Install via npm:
```sh
npm install privacy-lib
```

### Java

Add the following dependency to your Maven `pom.xml`:
```xml
<dependency>
  <groupId>com.privacy</groupId>
  <artifactId>privacy-lib</artifactId>
  <version>1.0.0</version>
</dependency>
```

## Quick Start

### JavaScript Example

The following example demonstrates how to use the main features of the Privacy Compliance library in a JavaScript application:

```js
import { showConsentForm, storeConsent, getConsentStatus } from 'privacy-lib/consent';
import { requestDataAccess, requestDataCorrection, requestDataDeletion } from 'privacy-lib/dsar';
import { anonymizeField, configureAnonymization } from 'privacy-lib/anonymization';
import { logDataProcessing, getLogs } from 'privacy-lib/logging';

// Show consent form
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

### Java Example

This example shows how to use the library's core features in a Java backend service:

```java
import com.privacy.consent.ConsentForm;
import com.privacy.dsar.DSARManager;
import com.privacy.anonymization.Anonymizer;
import com.privacy.logging.Logger;

// Show consent form
ConsentForm.showConsentForm(new ConsentOptions(Arrays.asList("analytics", "marketing")));

// Store user consent
ConsentForm.storeConsent("user123", Map.of("analytics", true, "marketing", false));

// Get consent status
boolean status = ConsentForm.getConsentStatus("user123", "analytics");
System.out.println("Consent for analytics: " + status);

// Request data access
DSARManager.requestDataAccess("user123");

// Anonymize email field
Map<String, Object> anonData = Anonymizer.anonymizeField(Map.of("email", "user@email.com"), "email");

// Configure anonymization
Anonymizer.configureAnonymization(Map.of("strategy", "hash", "salt", "somesalt"));

// Log a data processing activity
Logger.logDataProcessing("User login", Map.of("userId", "user123"));

// Retrieve logs
List<LogEntry> logs = Logger.getLogs(Map.of("userId", "user123"));
System.out.println(logs);
```

## Configuration

You can configure anonymization strategies and parameters to fit your compliance requirements. The following examples show how to set up anonymization in both JavaScript and Java:

### JavaScript

```js
import { configureAnonymization } from 'privacy-lib/anonymization';

configureAnonymization({
  strategy: 'hash', // or 'pseudonymize', 'mask', etc.
  salt: 'somesalt',
});
```

### Java

```java
import com.privacy.anonymization.Anonymizer;

Anonymizer.configureAnonymization(Map.of(
  "strategy", "hash", // or "pseudonymize", "mask", etc.
  "salt", "somesalt"
));
```

Refer to the documentation for all available strategies and configuration options.

## Dynamic Registration

Dynamic registration of new consent, DSAR, or anonymization strategies at runtime is not currently supported. If you require extensibility or wish to contribute such features, please see the Contributing section below.

## Logging & Telemetry

The Privacy Compliance library provides built-in logging for data processing activities, supporting secure storage and auditability.

### JavaScript

```js
import { logDataProcessing, getLogs, secureLogStorage } from 'privacy-lib/logging';

// Log a data processing activity
logDataProcessing('User login', { userId: 'user123' });

// Retrieve logs
const logs = getLogs({ userId: 'user123' });
console.log(logs);

// Configure secure log storage
secureLogStorage({ encryption: true });
```

### Java

```java
import com.privacy.logging.Logger;

// Log a data processing activity
Logger.logDataProcessing("User login", Map.of("userId", "user123"));

// Retrieve logs
List<LogEntry> logs = Logger.getLogs(Map.of("userId", "user123"));
System.out.println(logs);

// Configure secure log storage
Logger.secureLogStorage(Map.of("encryption", true));
```

## Helpers

All main features are accessible via the primary API modules for consent, DSAR, anonymization, and logging. There are no additional helper utilities at this time.

## Examples

The following section provides guidance on integrating the Privacy Compliance library into real-world applications, with references to both JavaScript and Java usage patterns.

See the Quick Start section above for basic usage in both JavaScript and Java. For more detailed integration examples:

- **JavaScript:**
  - Integrate with Express.js routes to manage consent and DSARs.
- **Java:**
  - Integrate with Spring Boot controllers for backend consent and DSAR management.

Refer to the documentation and source code for additional examples and advanced usage patterns.

## Contributing

Contributions, issues, and suggestions are welcome! Please open an issue or submit a pull request via GitHub. For major changes, please discuss them first to ensure alignment with the project goals.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
