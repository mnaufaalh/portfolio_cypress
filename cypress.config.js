const { defineConfig } = require("cypress");
require('dotenv').config();

const specPattern = 'cypress/integeration/**/*.js';
module.exports = defineConfig({
  env: { ...process.env },
  e2e: {
    specPattern
  },
  // from cypress.json
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 20000,
  requestTimeout: 10000,
  responseTimeout: 60000,
  screenshotsFolder: 'report/screenshots',
  video: false,
  chromeWebSecurity: false,
  scrollBehavior: 'nearest',
  reporter: 'mochawesome',
  screenshotOnRunFailure: true,
  userAgent: null,
  watchForFileChanges: false,
  reporterOptions: {
    reportDir: 'report/html',
    reportFilename: 'test_report',
    charts: true,
    timestamp: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
    showPassed: false,
    html: true,
    json: true,
    overwrite: false
  },
  retries: {
    runMode: 1,
    openMode: 0
  }
});
