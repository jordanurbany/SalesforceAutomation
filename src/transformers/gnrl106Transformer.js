// src/transformers/gnrl106Transformer.js
const { excelDateToJSDate } = require("../excelService");

// This helper function safely converts values to numbers and handles commas.
const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  // The value from the file might have commas (e.g., "1,855"), so we remove them.
  const num = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(num) ? null : num;
};

// This is the final, correct map based on the CSV data you provided.
const COLUMN_MAP = {
  programName: 0,
  clientName: 1,
  uniqueId: 2,
  birthDate: 3,
  enrollDate: 6,
  exitDate: 7,
  los: 8,
  assessments: 11,
  services: 12,
  caseNotes: 13,
  assignedStaff: 15,
  unitAssignment: 17,
  bedAssignment: 18,
  occupancyStart: 19,
  occupancyEnd: 20,
};

/**
 * FUNCTION 1: Extracts a unique list of people to upsert to the standard Contact object.
 */
function transformToContacts(dataRows) {
  const uniqueClients = new Map();
  dataRows.forEach((row) => {
    const uniqueId = row[COLUMN_MAP.uniqueId];
    if (uniqueId && !uniqueClients.has(uniqueId)) {
      const clientName = row[COLUMN_MAP.clientName];
      if (!clientName) return;

      const nameParts = clientName.split(",").map((p) => p.trim());
      const lastName = nameParts[0] || "";
      const firstName = nameParts[1] || "";

      if (lastName) {
        uniqueClients.set(uniqueId, {
          FirstName: firstName,
          LastName: lastName,
          Birthdate: excelDateToJSDate(row[COLUMN_MAP.birthDate]),
          ONE_Systems_ID__c: uniqueId,
        });
      }
    }
  });
  console.log(`\nExtracted ${uniqueClients.size} unique contacts.`);
  return [...uniqueClients.values()];
}

/**
 * FUNCTION 2: Prepares the detailed GNRL_106_Program_Roster__c records.
 */
function transformToRosters(dataRows, contactIdMap) {
  const records = [];
  dataRows.forEach((row) => {
    const contactUniqueId = row[COLUMN_MAP.uniqueId];
    const contactSalesforceId = contactIdMap.get(contactUniqueId);
    const enrollDate = excelDateToJSDate(row[COLUMN_MAP.enrollDate]);
    const programName = row[COLUMN_MAP.programName];

    if (contactSalesforceId && enrollDate && programName) {
      const enrollDateKey = enrollDate.toISOString().split("T")[0];

      let assignedStaffValue = row[COLUMN_MAP.assignedStaff];
      if (typeof assignedStaffValue === "string") {
        assignedStaffValue = assignedStaffValue.replace(/\n/g, "; ");
      }

      records.push({
        Name: programName,
        Contact__c: contactSalesforceId,
        GNRL_106_Roster_ID__c: `GNRL106-${contactUniqueId}-${enrollDateKey}`,
        Enroll_Date__c: enrollDate,
        Exit_Date__c: excelDateToJSDate(row[COLUMN_MAP.exitDate]),
        LOS__c: toNumber(row[COLUMN_MAP.los]),
        Assesments__c: toNumber(row[COLUMN_MAP.assessments]),
        Services__c: toNumber(row[COLUMN_MAP.services]),
        Case_Notes__c: toNumber(row[COLUMN_MAP.caseNotes]),
        Assigned_Staff__c: assignedStaffValue,
        Unit_assignment__c: row[COLUMN_MAP.unitAssignment], // Corrected API Name
        Bed_Assignment__c: row[COLUMN_MAP.bedAssignment],
        Occupancy_Start__c: excelDateToJSDate(row[COLUMN_MAP.occupancyStart]),
        Occupancy_End_Date__c: excelDateToJSDate(row[COLUMN_MAP.occupancyEnd]),
      });
    }
  });
  console.log(`\nPrepared ${records.length} total roster records.`);
  return records;
}

module.exports = { transformToContacts, transformToRosters };
