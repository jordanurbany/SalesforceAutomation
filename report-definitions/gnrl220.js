// report-definitions/gnrl220.js
const path = require("path");

// This line should only import the transformer.
const {
  transformToContacts,
  transformToProgramDetails,
} = require("../src/transformers/gnrl220Transformer");

const gnrl220Definition = {
  reportId: "GNRL-220",
  sourceDataPath: path.join(__dirname, "../test-data/gnrl220"),

  // We are setting this to 1 with confidence, to skip the single header row.
  rowsToSkip: 1,

  pipeline: [
    {
      step: "syncContacts",
      transformer: transformToContacts,
      salesforce: {
        object: "Contact",
        externalIdField: "ONE_Systems_ID__c",
      },
      createIdMap: true,
    },
    {
      step: "syncProgramDetails",
      transformer: transformToProgramDetails,
      salesforce: {
        object: "GNRL220Program__c", // The correct API name you confirmed.
        externalIdField: "Unique_ID__c",
      },
      useIdMap: true,
    },
  ],
};

module.exports = gnrl220Definition;
