// Central configuration file for PrivacyCompliance
// Now loads configuration from environment variables using dotenv

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

module.exports = {
  APP_NAME: process.env.APP_NAME,
  DB_URL: process.env.DB_URL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  PORT: process.env.PORT,
}; 