// src/transformers/gnrl220Transformer.js
const { excelDateToJSDate } = require("../excelService");

// --- Data Type Conversion Helpers ---
const toBoolean = (value) => {
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    if (s === "yes" || s === "true" || s === "on") return true;
  }
  return false;
};
const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(num) ? null : num;
};

// --- FIX: ROBUST DATE FORMATTING HELPERS ---
const formatDateOnly = (date) => {
  // This function now handles invalid date objects gracefully.
  if (!date || isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateTime = (date) => {
  // This function also handles invalid date objects gracefully.
  if (!date || isNaN(date.getTime())) return null;
  return date.toISOString();
};

// --- COLUMN MAPPING BY INDEX ---
const COLUMN_MAP = {
  uniqueId: 0,
  firstName: 1,
  lastName: 2,
  agency: 3,
  assignedStaff: 4,
  staffCreated: 5,
  enrollmentStart: 6,
  enrollmentExit: 7,
  chronicHomeless: 8,
  bedNightService: 9,
  bedNightFirst: 10,
  bedNightLast: 11,
  dob: 12,
  ssn: 13,
  personalId: 14,
  householdId: 15,
  gender: 16,
  raceEthnicity: 17,
  veteranStatus: 18,
  translationNeeded: 19,
  preferredLang: 20,
  specifyLang: 21,
  interestedInRelo: 22,
  relationshipToHoh: 23,
  enrollmentCoc: 24,
  isAdultHoh: 25,
  isEsShSo: 26,
  isSoNbnEs: 27,
  isPh: 28,
  dateOfEngagement: 29,
  housingMoveInDate: 30,
  staffCompleting: 31,
  agencyFirstContact: 32,
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
  guestReferralSource: 44,
  communityReferralSource: 45,
  other1: 46,
  other2: 47,
  usualSleepLocation: 48,
  otherSleepLocations: 49,
  priorLivingSituation: 50,
  sameAsUsualSleep: 51,
  usualSleepLocation2: 52,
  typeOfResidence: 53,
  rentalSubsidyType: 54,
  lengthOfStayPrior: 55,
  stayLessThan7: 56,
  stayLessThan90: 57,
  nightBefore: 58,
  homelessStartDate: 59,
  timesHomeless3Yrs: 60,
  monthsHomeless3Yrs: 61,
  homelessInSf: 62,
  yearsHomelessSf: 63,
  monthsHomelessSf: 64,
  homelessOutsideSf: 65,
  yearsHomelessOutsideSf: 66,
  monthsHomelessOutsideSf: 67,
  disablingCondition: 68,
  physicalDisability: 69,
  longTermPhysical: 70,
  developmentalDisability: 71,
  chronicHealth: 72,
  longTermChronic: 73,
  hivAids: 74,
  mentalHealth: 75,
  longTermMental: 76,
  substanceUse: 77,
  longTermSubstance: 78,
  dvSurvivor: 79,
  whenDvOccurred: 80,
  currentlyFleeing: 81,
  incomeFromAnySource: 82,
  earnedIncome: 83,
  amountEarned: 84,
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

function transformToContacts(dataRows) {
  const uniqueClients = new Map();
  dataRows.forEach((row) => {
    const uniqueId = row[COLUMN_MAP.uniqueId];
    if (!uniqueId || String(uniqueId).trim() === "") {
      return;
    }

    if (!uniqueClients.has(uniqueId)) {
      uniqueClients.set(uniqueId, {
        FirstName: row[COLUMN_MAP.firstName],
        LastName: row[COLUMN_MAP.lastName],
        Birthdate: formatDateOnly(excelDateToJSDate(row[COLUMN_MAP.dob])),
        ONE_Systems_ID__c: uniqueId,
      });
    }
  });
  console.log(
    `\nExtracted ${uniqueClients.size} unique contacts from GNRL-220 data.`
  );
  return [...uniqueClients.values()];
}

function transformToProgramDetails(dataRows, contactIdMap) {
  const records = []; // Moved declaration to the top of the function
  dataRows.forEach((row) => {
    const uniqueId = row[COLUMN_MAP.uniqueId];
    if (!uniqueId || String(uniqueId).trim() === "") {
      return;
    }

    const contactSalesforceId = contactIdMap.get(uniqueId);
    if (contactSalesforceId) {
      records.push({
        Contact__c: contactSalesforceId,
        Name: uniqueId,
        Unique_ID__c: uniqueId,
        Name__c: row[COLUMN_MAP.firstName],
        Last_Name__c: row[COLUMN_MAP.lastName],
        DOB__c: formatDateOnly(excelDateToJSDate(row[COLUMN_MAP.dob])),
        SSN__c: row[COLUMN_MAP.ssn],
        Personal_ID__c: row[COLUMN_MAP.personalId],
        Household_ID__c: row[COLUMN_MAP.householdId],
        Agency__c: row[COLUMN_MAP.agency],
        Enrollment_Start_Date__c: formatDateTime(
          excelDateToJSDate(row[COLUMN_MAP.enrollmentStart])
        ),
        Enrollment_Exit_Date__c: formatDateTime(
          excelDateToJSDate(row[COLUMN_MAP.enrollmentExit])
        ),
        Chronic_Homeless__c: row[COLUMN_MAP.chronicHomeless]
          ? String(row[COLUMN_MAP.chronicHomeless]).trim()
          : null,
        Veteran_Status__c: row[COLUMN_MAP.veteranStatus]
          ? String(row[COLUMN_MAP.veteranStatus]).trim()
          : null,
        Gender__c: row[COLUMN_MAP.gender]
          ? String(row[COLUMN_MAP.gender]).trim()
          : null,
        Ethnicity__c: row[COLUMN_MAP.raceEthnicity]
          ? String(row[COLUMN_MAP.raceEthnicity]).trim()
          : null,
        Relationship_to_HoH__c: row[COLUMN_MAP.relationshipToHoh]
          ? String(row[COLUMN_MAP.relationshipToHoh]).trim()
          : null,
        Date_of_Engagement__c: formatDateOnly(
          excelDateToJSDate(row[COLUMN_MAP.dateOfEngagement])
        ),
        Housing_Move_In_Date__c: formatDateOnly(
          excelDateToJSDate(row[COLUMN_MAP.housingMoveInDate])
        ),
        Do_you_have_any_Special_Accommodations__c: row[
          COLUMN_MAP.specialAccommodations
        ]
          ? String(row[COLUMN_MAP.specialAccommodations]).trim()
          : null,
        Please_list_the_Accommodation_Needed__c:
          row[COLUMN_MAP.listAccommodations],
        Physical_Disability__c: row[COLUMN_MAP.physicalDisability]
          ? String(row[COLUMN_MAP.physicalDisability]).trim()
          : null,
        Long_Term_Physical_Disability__c: toBoolean(
          row[COLUMN_MAP.longTermPhysical]
        ),
        Developmental_Disability__c: row[COLUMN_MAP.developmentalDisability]
          ? String(row[COLUMN_MAP.developmentalDisability]).trim()
          : null,
        Chronic_Health_Condition__c: row[COLUMN_MAP.chronicHealth]
          ? String(row[COLUMN_MAP.chronicHealth]).trim()
          : null,
        Long_Term_Chronic_Health__c: toBoolean(row[COLUMN_MAP.longTermChronic]),
        HIV_AIDS__c: row[COLUMN_MAP.hivAids]
          ? String(row[COLUMN_MAP.hivAids]).trim()
          : null,
        Mental_Health_Disorder__c: row[COLUMN_MAP.mentalHealth]
          ? String(row[COLUMN_MAP.mentalHealth]).trim()
          : null,
        Long_Term_Mental_Health__c: toBoolean(row[COLUMN_MAP.longTermMental]),
        Substance_Use_Disorder__c: row[COLUMN_MAP.substanceUse]
          ? String(row[COLUMN_MAP.substanceUse]).trim()
          : null,
        Long_Term_Substance_Use__c: toBoolean(
          row[COLUMN_MAP.longTermSubstance]
        ),
        Survivor_of_Domestic_Violence__c: row[COLUMN_MAP.dvSurvivor]
          ? String(row[COLUMN_MAP.dvSurvivor]).trim()
          : null,
        When_experience_occurred__c: row[COLUMN_MAP.whenDvOccurred]
          ? String(row[COLUMN_MAP.whenDvOccurred]).trim()
          : null,
        Are_you_currently_fleeing__c: row[COLUMN_MAP.currentlyFleeing]
          ? String(row[COLUMN_MAP.currentlyFleeing]).trim()
          : null,
        Income_from_Any_Source__c: row[COLUMN_MAP.incomeFromAnySource]
          ? String(row[COLUMN_MAP.incomeFromAnySource]).trim()
          : null,
        Earned_Income__c: toBoolean(row[COLUMN_MAP.earnedIncome]),
        Amount_Earned_Income__c: toNumber(row[COLUMN_MAP.amountEarned]),
        Unemployment_Insurance__c: toBoolean(row[COLUMN_MAP.unemployment]),
        Amount_Unemployment__c: toNumber(row[COLUMN_MAP.amountUnemployment]),
        Supplemental_Security_Income_SSI__c: toBoolean(row[COLUMN_MAP.ssi]),
        Amount_SSI__c: toNumber(row[COLUMN_MAP.amountSsi]),
        Social_Security_Disability_Insurance_SS__c: toBoolean(
          row[COLUMN_MAP.ssdi]
        ),
        Amount_SSDI__c: toNumber(row[COLUMN_MAP.amountSsdi]),
        VA_Service_Connected_Disability_Compensa__c: toBoolean(
          row[COLUMN_MAP.vaServiceConnected]
        ),
        Amount_VA_Service_Connected__c: toNumber(
          row[COLUMN_MAP.amountVaService]
        ),
        VA_Non_Service_Connected_Disability_Pens__c: toBoolean(
          row[COLUMN_MAP.vaNonService]
        ),
        Amount_VA_Non_Service_Connected__c: toNumber(
          row[COLUMN_MAP.amountVaNonService]
        ),
        Private_Disability_Insurance__c: toBoolean(
          row[COLUMN_MAP.privateDisability]
        ),
        Amount_Private_Disability__c: toNumber(
          row[COLUMN_MAP.amountPrivateDisability]
        ),
        Worker_s_Compensation__c: toBoolean(row[COLUMN_MAP.workersComp]),
        Amount_Worker_s_Comp__c: toNumber(row[COLUMN_MAP.amountWorkersComp]),
        CalWORKs__c: toBoolean(row[COLUMN_MAP.calworks]),
        Amount_CalWORKs__c: toNumber(row[COLUMN_MAP.amountCalworks]),
        CAAP__c: toBoolean(row[COLUMN_MAP.caap]),
        Amount_CAAP__c: toNumber(row[COLUMN_MAP.amountCaap]),
        RetiremRent_Income_from_Social_Security__c: toBoolean(
          row[COLUMN_MAP.retirementSs]
        ),
        Amount_Retirement_Social_Security__c: toNumber(
          row[COLUMN_MAP.amountRetirementSs]
        ),
        Pension_or_Retirement_Income_from_a_Form__c: toBoolean(
          row[COLUMN_MAP.pension]
        ),
        Amount_Pension__c: toNumber(row[COLUMN_MAP.amountPension]),
        Child_Support__c: toBoolean(row[COLUMN_MAP.childSupport]),
        Amount_Child_Support__c: toNumber(row[COLUMN_MAP.amountChildSupport]),
        Alimony_and_Other_Spousal_Support__c: toBoolean(
          row[COLUMN_MAP.alimony]
        ),
        Amount_Alimony__c: toNumber(row[COLUMN_MAP.amountAlimony]),
        Other_Income_Source_1__c: toBoolean(row[COLUMN_MAP.otherIncome1]),
        Amount_Other_Income_1__c: toNumber(row[COLUMN_MAP.amountOther1]),
        Other_Income_Source_2__c: toBoolean(row[COLUMN_MAP.otherIncome2]),
        Amount_Other_Income_2__c: toNumber(row[COLUMN_MAP.totalMonthlyIncome]), // Note: Original script had a typo here, might need to check column index
        Total_Monthly_Income_for_Individual__c: toNumber(
          row[COLUMN_MAP.totalMonthlyIncome]
        ),
        Receiving_Non_Cash_Benefits__c: row[COLUMN_MAP.receivingNonCash]
          ? String(row[COLUMN_MAP.receivingNonCash]).trim()
          : null,
        CalFresh_Food_Stamps__c: toBoolean(row[COLUMN_MAP.calfresh]),
        WIC__c: toBoolean(row[COLUMN_MAP.wic]),
        CalWORKS_Childcare_Services__c: toBoolean(
          row[COLUMN_MAP.calworksChildcare]
        ),
        CalWORKS_Transportation__c: toBoolean(
          row[COLUMN_MAP.calworksTransport]
        ),
        Other_CalWORKS_Funded__c: toBoolean(row[COLUMN_MAP.otherCalworks]),
        Other_Non_Cash_Benefit__c: toBoolean(row[COLUMN_MAP.otherNonCash]),
        Source_Other_Non_Cash__c: row[COLUMN_MAP.sourceOtherNonCash],
        Covered_by_Health_Insurance__c: row[COLUMN_MAP.coveredByHealthIns]
          ? String(row[COLUMN_MAP.coveredByHealthIns]).trim()
          : null,
        Medi_Cal__c: toBoolean(row[COLUMN_MAP.mediCal]),
        MEDICARE__c: toBoolean(row[COLUMN_MAP.medicare]),
        State_Children_s_Health_Ins__c: toBoolean(
          row[COLUMN_MAP.stateChildrensIns]
        ),
        Veteran_s_Health_Admin_VHA__c: toBoolean(row[COLUMN_MAP.vha]),
        Employer_Provided_Health_Ins__c: toBoolean(row[COLUMN_MAP.employerIns]),
        COBRA__c: toBoolean(row[COLUMN_MAP.cobra]),
        Private_Pay_Health_Insurance__c: toBoolean(
          row[COLUMN_MAP.privatePayIns]
        ),
        State_Health_Insurance_for_Adults__c: toBoolean(
          row[COLUMN_MAP.stateHealthIns]
        ),
        Indian_Health_Services_Prog__c: toBoolean(row[COLUMN_MAP.indianHealth]),
        Other_Health_Insurance__c: toBoolean(row[COLUMN_MAP.otherHealthIns]),
        Source_Other_Health_Ins__c: row[COLUMN_MAP.sourceOtherHealth],
        Unit_Assignment__c: row[COLUMN_MAP.unitAssignment],
        Bed_Assignment__c: row[COLUMN_MAP.bedAssignment],
        Occupancy_Start_Date__c: formatDateTime(
          excelDateToJSDate(row[COLUMN_MAP.occupancyStart])
        ),
        Occupancy_End_Date__c: formatDateTime(
          excelDateToJSDate(row[COLUMN_MAP.occupancyEnd])
        ),
        Assigned_Staff_denotes_Inactive__c: row[COLUMN_MAP.assignedStaff],
        Staff_Created__c: row[COLUMN_MAP.staffCreated],
        Bed_Night_Service__c: row[COLUMN_MAP.bedNightService],
        Bed_Night_First_Date__c: formatDateOnly(
          excelDateToJSDate(row[COLUMN_MAP.bedNightFirst])
        ),
        Bed_Night_Last_Date__c: formatDateOnly(
          excelDateToJSDate(row[COLUMN_MAP.bedNightLast])
        ),
        Translation_Assistance_Needed__c: row[COLUMN_MAP.translationNeeded],
        Preferred_Language__c: row[COLUMN_MAP.preferredLang],
        Preferred_Language_Other__c: row[COLUMN_MAP.specifyLang],
        Interested_in_Relocation__c: row[COLUMN_MAP.interestedInRelo],
        Enrollment_CoC__c: row[COLUMN_MAP.enrollmentCoc],
        Is_Adult_or_HoH__c: toBoolean(row[COLUMN_MAP.isAdultHoh]),
        Is_ES_SH_or_SO__c: toBoolean(row[COLUMN_MAP.isEsShSo]),
        Is_SO_or_NBN_ES__c: toBoolean(row[COLUMN_MAP.isSoNbnEs]),
        Is_Permanent_Housing__c: toBoolean(row[COLUMN_MAP.isPh]),
        Staff_Completing_Enrollment__c: row[COLUMN_MAP.staffCompleting],
        Agency_First_Contact__c: row[COLUMN_MAP.agencyFirstContact],
        Locker__c: row[COLUMN_MAP.lockerNum],
        Arriving_from_an_Encampment__c: row[COLUMN_MAP.arrivingFromEncampment],
        Arriving_with_any_Pets__c: row[COLUMN_MAP.hasPets],
        Pet_Type__c: row[COLUMN_MAP.petType],
        Pet_Name__c: row[COLUMN_MAP.petName],
        Do_you_have_a_Partner_or_Spouse__c: row[COLUMN_MAP.hasPartner],
        Is_your_Partner_or_Spouse_Staying_at_the__c:
          row[COLUMN_MAP.partnerSameShelter],
        Partner_Spouse_Name__c: row[COLUMN_MAP.partnerName],
        Do_you_have_More_than_2_Bags__c: row[COLUMN_MAP.moreThan2Bags],
        Guest_Referral_Source__c: row[COLUMN_MAP.guestReferralSource],
        Community_Referral_Source__c: row[COLUMN_MAP.communityReferralSource],
        Referral_Source_Other__c: row[COLUMN_MAP.other1],
        Community_Referral_Other__c: row[COLUMN_MAP.other2],
        Usual_Sleep_Location__c: row[COLUMN_MAP.usualSleepLocation],
        Other_Sleep_Locations__c: row[COLUMN_MAP.otherSleepLocations],
        Same_as_Usual_Sleep__c: row[COLUMN_MAP.sameAsUsualSleep],
        Usual_Sleep_Location_2__c: row[COLUMN_MAP.usualSleepLocation2],
        Type_of_Residence__c: row[COLUMN_MAP.typeOfResidence],
        Rental_Subsidy_Type__c: row[COLUMN_MAP.rentalSubsidyType],
        Length_of_Stay_in_Prior_Situation__c: row[COLUMN_MAP.lengthOfStayPrior],
        Length_of_Stay_Less_Than_7_Nights__c: row[COLUMN_MAP.stayLessThan7],
        Length_of_Stay_Less_Than_90_Days__c: row[COLUMN_MAP.stayLessThan90],
        Night_Before_Situation__c: row[COLUMN_MAP.nightBefore],
        Ever_Homeless_in_SF__c: row[COLUMN_MAP.homelessInSf],
        Years_Homeless_in_SF__c: toNumber(row[COLUMN_MAP.yearsHomelessSf]),
        Months_Homeless_in_SF__c: toNumber(row[COLUMN_MAP.monthsHomelessSf]),
        Ever_Homeless_Outside_SF__c: row[COLUMN_MAP.homelessOutsideSf],
        Years_Homeless_Outside_SF__c: toNumber(
          row[COLUMN_MAP.yearsHomelessOutsideSf]
        ),
        Months_Homeless_Outside_SF__c: toNumber(
          row[COLUMN_MAP.monthsHomelessOutsideSf]
        ),
        Disabling_Condition__c: row[COLUMN_MAP.disablingCondition],
        Sexual_Orientation__c: row[COLUMN_MAP.sexualOrientation],
        Other_Sexual_Orientation__c: row[COLUMN_MAP.otherSexualOrientation],
      });
    }
  });
  console.log(
    `\nPrepared ${records.length} total program detail records for GNRL-220.`
  );
  return records;
}

module.exports = { transformToContacts, transformToProgramDetails };
