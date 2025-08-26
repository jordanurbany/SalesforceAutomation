// src/transformers/gnrl220Transformer.js
const { excelDateToJSDate } = require("../excelService");

// --- Data Type Conversion Helpers ---
const toBoolean = (value) => {
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    if (s === "yes" || s === "true") return true;
  }
  return false;
};
const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  const num = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(num) ? null : num;
};

// --- FINAL, CORRECTED COLUMN MAPPING ---
// This has been meticulously rebuilt to prevent data shift errors.
const COLUMN_MAP = {
  uniqueId: 0,
  firstName: 1,
  lastName: 2,
  agency: 3,
  enrollmentStart: 6,
  enrollmentExit: 7,
  chronicHomeless: 8,
  dob: 12,
  ssn: 13,
  personalId: 14,
  householdId: 15,
  gender: 16,
  raceEthnicity: 17,
  veteranStatus: 18,
  relationshipToHoh: 23,
  dateOfEngagement: 29,
  housingMoveInDate: 30,
  lockerNum: 33,
  arrivingFromEncampment: 34,
  hasPets: 35,
  petType: 36,
  petName: 37,
  hasPartner: 38,
  partnerSameShelter: 39,
  partnerName: 40,
  moreThan2Bags: 41,
  specialAccommodations: 42,
  listAccommodations: 43,
  priorLivingSituation: 49,
  lengthOfStayPrior: 54,
  homelessStartDate: 58,
  timesHomeless3Yrs: 59,
  monthsHomeless3Yrs: 60,
  physicalDisability: 65,
  longTermPhysical: 66,
  developmentalDisability: 67,
  chronicHealth: 68,
  longTermChronic: 69,
  hivAids: 70,
  mentalHealth: 71,
  longTermMental: 72,
  substanceUse: 73,
  longTermSubstance: 74,
  dvSurvivor: 75,
  whenDvOccurred: 76,
  currentlyFleeing: 77,
  incomeFromAnySource: 78,
  earnedIncome: 79,
  amountEarned: 80,
  unemployment: 81,
  amountUnemployment: 82,
  ssi: 83,
  amountSsi: 84,
  ssdi: 85,
  amountSsdi: 86,
  vaServiceConnected: 87,
  amountVaService: 88,
  vaNonService: 89,
  amountVaNonService: 90,
  privateDisability: 91,
  amountPrivateDisability: 92,
  workersComp: 93,
  amountWorkersComp: 94,
  calworks: 95,
  amountCalworks: 96,
  caap: 97,
  amountCaap: 98,
  retirementSs: 99,
  amountRetirementSs: 100,
  pension: 101,
  amountPension: 102,
  childSupport: 103,
  amountChildSupport: 104,
  alimony: 105,
  amountAlimony: 106,
  otherIncome1: 107,
  amountOther1: 108,
  otherIncome2: 109,
  totalMonthlyIncome: 110,
  receivingNonCash: 111,
  calfresh: 112,
  wic: 113,
  calworksChildcare: 114,
  calworksTransport: 115,
  otherCalworks: 116,
  otherNonCash: 117,
  sourceOtherNonCash: 118,
  coveredByHealthIns: 119,
  mediCal: 120,
  medicare: 121,
  stateChildrensIns: 122,
  vha: 123,
  employerIns: 124,
  cobra: 125,
  privatePayIns: 126,
  stateHealthIns: 127,
  indianHealth: 128,
  otherHealthIns: 129,
  sourceOtherHealth: 130,
  sexualOrientation: 131,
  otherSexualOrientation: 132,
  unitAssignment: 133,
  bedAssignment: 134,
  occupancyStart: 135,
  occupancyEnd: 136,
};

/**
 * FUNCTION 1: Extracts a unique list of people to upsert to the standard Contact object.
 */
function transformToContacts(dataRows) {
  const uniqueClients = new Map();
  dataRows.forEach((row) => {
    const uniqueId = row[COLUMN_MAP.uniqueId];
    if (uniqueId && !uniqueClients.has(uniqueId)) {
      uniqueClients.set(uniqueId, {
        FirstName: row[COLUMN_MAP.firstName],
        LastName: row[COLUMN_MAP.lastName],
        Birthdate: excelDateToJSDate(row[COLUMN_MAP.dob]),
        ONE_Systems_ID__c: uniqueId,
      });
    }
  });
  console.log(
    `\nExtracted ${uniqueClients.size} unique contacts from GNRL-220 data.`
  );
  return [...uniqueClients.values()];
}

/**
 * FUNCTION 2: Prepares the detailed GNRL220Program__c records.
 */
function transformToProgramDetails(dataRows, contactIdMap) {
  const records = [];
  dataRows.forEach((row) => {
    const uniqueId = row[COLUMN_MAP.uniqueId];
    const contactSalesforceId = contactIdMap.get(uniqueId);
    if (contactSalesforceId) {
      records.push({
        Contact__c: contactSalesforceId,
        Name: uniqueId,
        Unique_ID__c: uniqueId,
        Name__c: row[COLUMN_MAP.firstName],
        Last_Name__c: row[COLUMN_MAP.lastName],
        DOB__c: excelDateToJSDate(row[COLUMN_MAP.dob]),
        SSN__c: row[COLUMN_MAP.ssn],
        Personal_ID__c: row[COLUMN_MAP.personalId],
        Household_ID__c: row[COLUMN_MAP.householdId],
        Agency__c: row[COLUMN_MAP.agency],
        Enrollment_Start_Date__c: excelDateToJSDate(
          row[COLUMN_MAP.enrollmentStart]
        ),
        Enrollment_Exit_Date__c: excelDateToJSDate(
          row[COLUMN_MAP.enrollmentExit]
        ),
        Chronic_Homeless__c: row[COLUMN_MAP.chronicHomeless]
          ? row[COLUMN_MAP.chronicHomeless].trim()
          : null,
        Veteran_Status__c: row[COLUMN_MAP.veteranStatus]
          ? row[COLUMN_MAP.veteranStatus].trim()
          : null,
        Gender__c: row[COLUMN_MAP.gender]
          ? row[COLUMN_MAP.gender].trim()
          : null,
        Ethnicity__c: row[COLUMN_MAP.raceEthnicity]
          ? row[COLUMN_MAP.raceEthnicity].trim()
          : null,
        Relationship_to_HoH__c: row[COLUMN_MAP.relationshipToHoh]
          ? row[COLUMN_MAP.relationshipToHoh].trim()
          : null,
        Date_of_Engagement__c: excelDateToJSDate(
          row[COLUMN_MAP.dateOfEngagement]
        ),
        Housing_Move_In_Date__c: excelDateToJSDate(
          row[COLUMN_MAP.housingMoveInDate]
        ),
        Arriving_from_an_Encampment__c: row[COLUMN_MAP.arrivingFromEncampment]
          ? row[COLUMN_MAP.arrivingFromEncampment].trim()
          : null,
        Prior_Living_Situation__c: row[COLUMN_MAP.priorLivingSituation]
          ? row[COLUMN_MAP.priorLivingSituation].trim()
          : null,
        Length_of_Stay_in_Prior_Situation__c: row[COLUMN_MAP.lengthOfStayPrior]
          ? row[COLUMN_MAP.lengthOfStayPrior].trim()
          : null,
        Homeless_Start_Date__c: excelDateToJSDate(
          row[COLUMN_MAP.homelessStartDate]
        ),
        Number_of_Times_Homeless_3_Yrs__c: toNumber(
          row[COLUMN_MAP.timesHomeless3Yrs]
        ),
        Total_Months_Homeless_3_Yrs__c: toNumber(
          row[COLUMN_MAP.monthsHomeless3Yrs]
        ),
        Physical_Disability__c: row[COLUMN_MAP.physicalDisability]
          ? row[COLUMN_MAP.physicalDisability].trim()
          : null,
        Long_Term_Physical_Disability__c: toBoolean(
          row[COLUMN_MAP.longTermPhysical]
        ),
        Developmental_Disability__c: row[COLUMN_MAP.developmentalDisability]
          ? row[COLUMN_MAP.developmentalDisability].trim()
          : null,
        Chronic_Health_Condition__c: row[COLUMN_MAP.chronicHealth]
          ? row[COLUMN_MAP.chronicHealth].trim()
          : null,
        Long_Term_Chronic_Health__c: toBoolean(row[COLUMN_MAP.longTermChronic]),
        HIV_AIDS__c: row[COLUMN_MAP.hivAids]
          ? row[COLUMN_MAP.hivAids].trim()
          : null,
        Mental_Health_Disorder__c: row[COLUMN_MAP.mentalHealth]
          ? row[COLUMN_MAP.mentalHealth].trim()
          : null,
        Long_Term_Mental_Health__c: toBoolean(row[COLUMN_MAP.longTermMental]),
        Substance_Use_Disorder__c: row[COLUMN_MAP.substanceUse]
          ? row[COLUMN_MAP.substanceUse].trim()
          : null,
        Long_Term_Substance_Use__c: toBoolean(
          row[COLUMN_MAP.longTermSubstance]
        ),
        Survivor_of_Domestic_Violence__c: row[COLUMN_MAP.dvSurvivor]
          ? row[COLUMN_MAP.dvSurvivor].trim()
          : null,
        When_experience_occurred__c: row[COLUMN_MAP.whenDvOccurred]
          ? row[COLUMN_MAP.whenDvOccurred].trim()
          : null,
        Are_you_currently_fleeing__c: row[COLUMN_MAP.currentlyFleeing]
          ? row[COLUMN_MAP.currentlyFleeing].trim()
          : null,
        Unit_Assignment__c: row[COLUMN_MAP.unitAssignment],
        Bed_Assignment__c: row[COLUMN_MAP.bedAssignment],
        Occupancy_Start_Date__c: excelDateToJSDate(
          row[COLUMN_MAP.occupancyStart]
        ),
        Occupancy_End_Date__c: excelDateToJSDate(row[COLUMN_MAP.occupancyEnd]),
      });
    }
  });
  console.log(
    `\nPrepared ${records.length} total program detail records for GNRL-220.`
  );
  return records;
}

module.exports = { transformToContacts, transformToProgramDetails };
