// src/salesforceService.js
const jsforce = require("jsforce");

/**
 * Handles connection and authentication with Salesforce.
 * ADAPTED from your loginToSalesforce function.
 */
async function login(loginUrl, username, password) {
  console.log("\nLogging in to Salesforce...");
  const conn = new jsforce.Connection({ loginUrl });
  await conn.login(username, password);
  console.log("Salesforce login successful!");
  return conn;
}

async function logout(conn) {
  if (conn && conn.accessToken) {
    await conn.logout();
    console.log("Logged out from Salesforce.");
  }
}

/**
 * Performs a bulk upsert operation in batches.
 * MOVED HERE - Your exact upsertInBatches logic, now a generic utility.
 */
async function upsertInBatches(
  conn,
  objectName,
  externalIdField,
  records,
  batchSize
) {
  console.log(
    `\n--- Upserting ${records.length} records to ${objectName}... ---`
  );
  if (records.length === 0) {
    console.log(`  - No records to upsert for ${objectName}. Skipping.`);
    return [];
  }

  let allResults = [];
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    console.log(
      `  - Processing batch for ${objectName} (size: ${batch.length})...`
    );
    const results = await conn
      .sobject(objectName)
      .upsert(batch, externalIdField, { allOrNone: false });
    allResults.push(...results);
  }

  const successCount = allResults.filter((r) => r.success).length;
  const failureCount = allResults.length - successCount;
  console.log(
    `  >> Results for ${objectName}: ${successCount} successes, ${failureCount} failures.`
  );

  if (failureCount > 0) {
    const firstFailure = allResults.find((r) => !r.success);
    console.error(
      "  >> First failure details:",
      JSON.stringify(firstFailure.errors)
    );
  }
  return allResults;
}

module.exports = { login, logout, upsertInBatches };
