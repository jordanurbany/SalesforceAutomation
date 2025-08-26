const path = require("path");
const {
  transformToContacts,
  transformToRosters,
} = require("../src/transformers/gnrl106Transformer");

const gnrl106Definition = {
  reportId: "GNRL-106",
  sourceDataPath: path.join(__dirname, "../test-data/gnrl106"),

  pipeline: [
    {
      step: "syncContacts",
      transformer: transformToContacts,
      salesforce: { object: "Contact", externalIdField: "ONE_Systems_ID__c" },
      createIdMap: true,
    },
    {
      step: "syncRosters",
      transformer: transformToRosters,
      salesforce: {
        object: "GNRL_106_Program_Roster__c",
        externalIdField: "GNRL_106_Roster_ID__c",
      },
      useIdMap: true,
    },
  ],
};

module.exports = gnrl106Definition;
