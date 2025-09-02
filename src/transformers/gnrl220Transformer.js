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

// --- FINAL, CORRECTED COLUMN MAPPING (Based on BW = index 74 for HIV) ---
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
  physicalDisability: 69, // Corrected Index
  longTermPhysical: 70, // Corrected Index
  developmentalDisability: 71, // Corrected Index
  chronicHealth: 72, // Corrected Index
  longTermChronic: 73, // Corrected Index
  hivAids: 74, // Corrected Index (BW)
  mentalHealth: 75, // Corrected Index
  longTermMental: 76, // Corrected Index
  substanceUse: 77, // Corrected Index
  longTermSubstance: 78, // Corrected Index
  dvSurvivor: 79, // Corrected Index
  whenDvOccurred: 80, // Corrected Index
  currentlyFleeing: 81, // Corrected Index
  incomeFromAnySource: 82, // Corrected Index
  earnedIncome: 83, // Corrected Index
  amountEarned: 84, // Corrected Index
  unemployment: 85,
  amountUnemployment: 86,
  ssi: 87,
  amountSsi: 88,
  ssdi: 89,
  amountSsdi: 90,
  vaServiceConnected: 91,
  amountVaService: 92,
  vaNonService: 93,
  amountVaNonService: 94,
  privateDisability: 95,
  amountPrivateDisability: 96,
  workersComp: 97,
  amountWorkersComp: 98,
  calworks: 99,
  amountCalworks: 100,
  caap: 101,
  amountCaap: 102,
  retirementSs: 103,
  amountRetirementSs: 104,
  pension: 105,
  amountPension: 106,
  childSupport: 107,
  amountChildSupport: 108,
  alimony: 109,
  amountAlimony: 110,
  otherIncome1: 111,
  amountOther1: 112,
  otherIncome2: 113,
  totalMonthlyIncome: 114,
  receivingNonCash: 115,
  calfresh: 116,
  wic: 117,
  calworksChildcare: 118,
  calworksTransport: 119,
  otherCalworks: 120,
  otherNonCash: 121,
  sourceOtherNonCash: 122,
  coveredByHealthIns: 123,
  mediCal: 124,
  medicare: 125,
  stateChildrensIns: 126,
  vha: 127,
  employerIns: 128,
  cobra: 129,
  privatePayIns: 130,
  stateHealthIns: 131,
  indianHealth: 132,
  otherHealthIns: 133,
  sourceOtherHealth: 134,
  sexualOrientation: 135,
  otherSexualOrientation: 136,
  unitAssignment: 137,
  bedAssignment: 138,
  occupancyStart: 139,
  occupancyEnd: 140,
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
 * FUNCTION 2: Prepares the detailed GNRL220Program__c records with the corrected mapping.
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
        Do_you_have_any_Special_Accommodations__c: row[
          COLUMN_MAP.specialAccommodations
        ]
          ? row[COLUMN_MAP.specialAccommodations].trim()
          : null,
        Please_list_the_Accommodation_Needed__c:
          row[COLUMN_MAP.listAccommodations],
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
        Income_from_Any_Source__c: row[COLUMN_MAP.incomeFromAnySource]
          ? row[COLUMN_MAP.incomeFromAnySource].trim()
          : null,
        Amount_Earned_Income__c: toNumber(row[COLUMN_MAP.amountEarned]),
        Total_Monthly_Income_for_Individual__c: toNumber(
          row[COLUMN_MAP.totalMonthlyIncome]
        ),
        CalFresh_Food_Stamps__c: toBoolean(row[COLUMN_MAP.calfresh]),
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
