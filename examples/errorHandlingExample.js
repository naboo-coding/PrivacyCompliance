// Example: Error Handling and Validation

const ValidationError = require('../lib/errors/ValidationError');

function processUserInput(input) {
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be a string');
  }
  return input.toUpperCase();
}

try {
  const result = processUserInput(123); // Invalid input
  console.log('Processed:', result);
} catch (err) {
  if (err instanceof ValidationError) {
    console.error('Validation error:', err.message);
  } else {
    console.error('Other error:', err);
  }
} 