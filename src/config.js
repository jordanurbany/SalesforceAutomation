// src/config.js
require("dotenv").config();
const path = require("path");

const CONFIG = {
  // Salesforce Credentials from .env file
  sfLoginUrl: process.env.SF_LOGIN_URL,
  sfUsername: process.env.SF_USERNAME,
  sfPassword: process.env.SF_PASSWORD + process.env.SF_TOKEN,

  // Universal Application Settings
  batchSize: 200,
};

// Validate that essential .env variables are loaded
if (!CONFIG.sfUsername || !CONFIG.sfPassword || !CONFIG.sfLoginUrl) {
  throw new Error(
    "Critical Salesforce environment variables (SF_USERNAME, SF_PASSWORD, SF_LOGIN_URL, SF_TOKEN) are missing."
  );
}

module.exports = CONFIG;
