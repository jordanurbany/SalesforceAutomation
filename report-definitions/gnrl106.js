const path = require("path");

// This line imports the specific data-shaping functions for this report
// from its dedicated transformer file.
const {
  transformToContacts,
  transformToRosters,
} = require("../src/transformers/gnrl106Transformer");

// This is the "recipe" object that the main process.js engine will use.
const gnrl106Definition = {
  // --- Report Metadata ---
  reportId: "GNRL-106",
  sourceDataPath: path.join(__dirname, "../test-data/gnrl106"),
  rowsToSkip: 11,

  // --- Processing Pipeline ---
  // The engine will execute these steps in the exact order they appear here.
  pipeline: [
    {
      step: "syncContacts",
      transformer: transformToContacts, // The function to prepare Contact data.
      salesforce: {
        object: "Contact",
        externalIdField: "ONE_Systems_ID__c",
      },
      // This flag tells the engine to create the "cheat sheet" ID map
      // from this step's successful results.
      createIdMap: true,
    },
    {
      step: "syncRosters",
      transformer: transformToRosters, // The function to prepare Roster data.
      salesforce: {
        object: "GNRL_106_Program_Roster__c",
        externalIdField: "GNRL_106_Roster_ID__c",
      },
      // This flag tells the engine to pass the "cheat sheet" map
      // to this step's transformer function.
      useIdMap: true,
    },
  ],
};

module.exports = gnrl106Definition;
