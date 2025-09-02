// report-definitions/gnrl220-test.js
const path = require("path");
const {
  transformToContacts,
  transformToProgramDetails,
} = require("../src/transformers/gnrl220Transformer");

const gnrl220TestDefinition = {
  reportId: "GNRL-220-TEST",
  sourceDataPath: path.join(__dirname, "../test-data/gnrl220-test"),
  rowsToSkip: 1,
  pipeline: [
    {
      step: "syncContacts",
      transformer: transformToContacts,
      salesforce: { object: "Contact", externalIdField: "ONE_Systems_ID__c" },
      createIdMap: true,
    },
    {
      step: "syncProgramDetails",
      transformer: transformToProgramDetails,
      salesforce: {
        object: "GNRL220Program__c",
        externalIdField: "Unique_ID__c",
      },
      useIdMap: true,
    },
  ],
};

module.exports = gnrl220TestDefinition;
