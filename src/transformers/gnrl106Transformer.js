const { excelDateToJSDate } = require("../excelService");

const COLUMN_MAP = {
  programName: 0,
  clientName: 1,
  uniqueId: 2,
  birthDate: 3,
  enrollDate: 6,
  exitDate: 7,
  assessments: 11,
  services: 12,
  caseNotes: 13,
  assignedStaff: 15,
  unitAssignment: 17,
  bedAssignment: 18,
  occupancyStart: 19,
  occupancyEnd: 20,
};

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

function transformToRosters(dataRows, contactIdMap) {
  const rosterRecords = [];
  dataRows.forEach((row) => {
    const contactUniqueId = row[COLUMN_MAP.uniqueId];
    const contactSalesforceId = contactIdMap.get(contactUniqueId);
    const enrollDate = excelDateToJSDate(row[COLUMN_MAP.enrollDate]);
    const programName = row[COLUMN_MAP.programName];

    if (contactSalesforceId && enrollDate && programName) {
      let assignedStaffValue = row[COLUMN_MAP.assignedStaff];
      if (typeof assignedStaffValue === "string") {
        assignedStaffValue = assignedStaffValue.replace(/\n/g, "; ");
      }

      const enrollDateKey = enrollDate.toISOString().split("T")[0];
      rosterRecords.push({
        Name: programName,
        Contact__c: contactSalesforceId,
        GNRL_106_Roster_ID__c: `GNRL106-${contactUniqueId}-${enrollDateKey}`,
        Enroll_Date__c: enrollDate,
        Exit_Date__c: excelDateToJSDate(row[COLUMN_MAP.exitDate]),
        Assesments__c: row[COLUMN_MAP.assessments],
        Services__c: row[COLUMN_MAP.services],
        Case_Notes__c: row[COLUMN_MAP.caseNotes],
        Assigned_Staff__c: assignedStaffValue,
        Unit_Assignment__c: row[COLUMN_MAP.unitAssignment],
        Bed_Assignment__c: row[COLUMN_MAP.bedAssignment],
        Occupancy_Start__c: excelDateToJSDate(row[COLUMN_MAP.occupancyStart]),
        Occupancy_End_Date__c: excelDateToJSDate(row[COLUMN_MAP.occupancyEnd]),
      });
    }
  });
  console.log(`\nPrepared ${rosterRecords.length} total roster records.`);
  return rosterRecords;
}

module.exports = { transformToContacts, transformToRosters };
