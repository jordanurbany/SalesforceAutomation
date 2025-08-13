// process.js
const CONFIG = require("./src/config");
const excelService = require("./src/excelService");
const sfService = require("./src/salesforceService");

async function run() {
  const reportName = process.argv[2];
  if (!reportName) {
    console.error("ERROR: Please specify a report name to run.");
    console.error("Usage: node process.js <reportName>");
    process.exit(1);
  }

  let reportDefinition;
  try {
    reportDefinition = require(`./report-definitions/${reportName}.js`);
  } catch (e) {
    console.error(
      `FATAL: Could not find or load report definition file for '${reportName}'.`
    );
    console.error(`Looked for: ./report-definitions/${reportName}.js`);
    console.error(e);
    process.exit(1);
  }

  console.log(
    `--- Starting Automated Sync for Report: ${reportDefinition.reportId} ---`
  );
  let salesforceConnection;

  try {
    salesforceConnection = await sfService.login(
      CONFIG.sfLoginUrl,
      CONFIG.sfUsername,
      CONFIG.sfPassword
    );
    const allDataRows = excelService.readAndAggregateData(
      reportDefinition.sourceDataPath,
      reportDefinition.rowsToSkip
    );
    const sharedState = new Map();

    for (const step of reportDefinition.pipeline) {
      console.log(`\n>> Executing Step: ${step.step}`);
      const idMap = step.useIdMap ? sharedState.get("idMap") : undefined;
      const recordsToUpsert = step.transformer(allDataRows, idMap);
      const results = await sfService.upsertInBatches(
        salesforceConnection,
        step.salesforce.object,
        step.salesforce.externalIdField,
        recordsToUpsert,
        CONFIG.batchSize
      );

      if (step.createIdMap) {
        const newIdMap = new Map();
        recordsToUpsert.forEach((record, index) => {
          const result = results[index];
          if (result && result.success) {
            const externalId = record[step.salesforce.externalIdField];
            newIdMap.set(externalId, result.id);
          }
        });
        sharedState.set("idMap", newIdMap);
        console.log(
          `   - Step created an ID map with ${newIdMap.size} entries.`
        );
      }
    }
    console.log(
      `\n--- Report '${reportDefinition.reportId}' processed successfully. ---`
    );
  } catch (error) {
    console.error(`\n--- A FATAL ERROR occurred ---`);
    console.error(error.message);
    process.exit(1);
  } finally {
    if (salesforceConnection) {
      await sfService.logout(salesforceConnection);
    }
  }
}

run();
