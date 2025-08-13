// src/excelService.js
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

/**
 * Your final, most robust function to convert Excel dates into a format Salesforce understands.
 * MOVED HERE - UNCHANGED.
 */
function excelDateToJSDate(serial) {
  if (!serial || (typeof serial === "string" && serial.trim().length < 8)) {
    return null;
  }
  if (typeof serial === "number") {
    return serial > 100
      ? new Date(Math.round((serial - 25569) * 86400 * 1000))
      : null;
  }
  if (typeof serial === "string") {
    const trimmedSerial = serial.trim();
    if (trimmedSerial.toLowerCase().includes("bed")) {
      return null;
    }
    const d = new Date(trimmedSerial);
    return d instanceof Date && !isNaN(d) ? d : null;
  }
  return null;
}

/**
 * Generic function to read all .xlsx files from a specified directory.
 * ADAPTED from your original readAllExcelData function.
 */
function readAndAggregateData(directoryPath, rowsToSkip) {
  console.log(`\nReading and aggregating data from: ${directoryPath}`);
  let allDataRows = [];

  const fileNames = fs
    .readdirSync(directoryPath)
    .filter((file) => path.extname(file).toLowerCase() === ".xlsx");

  if (fileNames.length === 0) {
    throw new Error(`No .xlsx files found in the directory: ${directoryPath}`);
  }

  for (const fileName of fileNames) {
    const filePath = path.join(directoryPath, fileName);
    console.log(`  - Processing file: ${fileName}`);
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const dataArray = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
    });
    const dataRows = dataArray.slice(rowsToSkip);
    allDataRows.push(...dataRows);
    console.log(`    > Found ${dataRows.length} data rows.`);
  }

  console.log(
    `\nFound ${allDataRows.length} total data rows across all files.`
  );
  return allDataRows;
}

module.exports = { readAndAggregateData, excelDateToJSDate };
