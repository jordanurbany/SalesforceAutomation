// src/excelService.js
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

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

// A simple, robust CSV line parser that correctly handles quoted fields.
function parseCsvLine(line) {
  const result = [];
  let currentField = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(currentField);
      currentField = "";
    } else {
      currentField += char;
    }
  }
  result.push(currentField); // Add the last field
  return result;
}

// FINAL, RESILIENT VERSION: Now correctly parses CSV files.
function readAndAggregateData(directoryPath, rowsToSkip) {
  console.log(`\nReading and aggregating data from: ${directoryPath}`);
  let allDataRows = [];

  const fileNames = fs.readdirSync(directoryPath).filter((file) => {
    const lower = file.toLowerCase();
    return lower.endsWith(".xlsx") || lower.endsWith(".csv");
  });

  if (fileNames.length === 0) {
    throw new Error(`No .xlsx or .csv files found in: ${directoryPath}`);
  }

  for (const fileName of fileNames) {
    const filePath = path.join(directoryPath, fileName);
    console.log(`  - Processing file: ${fileName}`);

    let dataArray;

    if (fileName.toLowerCase().endsWith(".csv")) {
      // --- THIS IS THE FIX ---
      // Use a robust method for CSV files.
      const fileContent = fs.readFileSync(filePath, "utf8");
      const lines = fileContent.split(/\r?\n/); // Handles different line endings
      dataArray = lines.map((line) => parseCsvLine(line));
      console.log(
        `    > Robustly parsed ${dataArray.length} raw rows from CSV.`
      );
      // --- END FIX ---
    } else {
      // Use the standard method for XLSX files.
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      dataArray = xlsx.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        range: 0,
      });
      console.log(`    > Parsed ${dataArray.length} raw rows from XLSX.`);
    }

    const dataRows = dataArray.slice(rowsToSkip);
    allDataRows.push(...dataRows);
    console.log(
      `    > Found ${dataRows.length} data rows after skipping ${rowsToSkip} row(s).`
    );
  }

  console.log(
    `\nFound ${allDataRows.length} total data rows across all files.`
  );
  return allDataRows;
}

module.exports = { readAndAggregateData, excelDateToJSDate };
