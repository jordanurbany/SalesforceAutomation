import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

// This path should point to your project's root, then into 'downloads'
const DOWNLOAD_PATH = path.join(salesforce - automation, "..", "downloads");

/**
 * Downloads a report by automating browser actions. This function is now smart
 * and will automatically discover the name of the downloaded file.
 * @param {object} reportConfig The definition object for the report.
 * @returns {Promise<string>} A promise that resolves with the full path to the downloaded file.
 */
export async function downloadReport(reportConfig) {
  console.log(`Starting download for report: ${reportConfig.name}`);

  if (!fs.existsSync(DOWNLOAD_PATH)) {
    fs.mkdirSync(DOWNLOAD_PATH, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // --- This is the new, powerful part ---
    // 1. Create a CDP session to talk directly to the browser's APIs
    const client = await page.target().createCDPSession();

    // 2. Set the download behavior to save files to our designated folder
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: DOWNLOAD_PATH,
    });

    // 3. Set up a promise that will resolve when the download is complete
    const downloadPromise = new Promise((resolve, reject) => {
      let downloadGuid = "";

      client.on("Page.downloadWillBegin", (event) => {
        downloadGuid = event.guid; // Store the unique ID of the download
      });

      client.on("Page.downloadProgress", (event) => {
        if (event.guid === downloadGuid && event.state === "completed") {
          // The download we were waiting for is now complete!
          const finalFileName = path.basename(event.suggestedFilename);
          resolve(finalFileName);
        } else if (
          event.guid === downloadGuid &&
          (event.state === "canceled" || event.state === "failed")
        ) {
          reject(new Error(`Download failed with state: ${event.state}`));
        }
      });
    });

    // --- Your existing automation logic goes here ---
    console.log("Logging into system...");
    await page.goto(reportConfig.loginUrl); // Assuming URL is in the definition
    // ... await page.type for username/password ...
    // ... await page.click for login button ...
    await page.waitForNavigation();
    console.log("Login successful.");

    // 4. Trigger the download AFTER setting up the listener
    console.log("Navigating and clicking download button...");
    // ... await page.goto(reportConfig.reportUrl) ...
    await page.click(reportConfig.downloadSelector); // This click starts the download

    // 5. Wait for the downloadPromise to resolve
    console.log("Waiting for download to complete...");
    const downloadedFileName = await downloadPromise;
    const fullPath = path.join(DOWNLOAD_PATH, downloadedFileName);

    console.log(`Download complete! File saved as: ${downloadedFileName}`);
    return fullPath;
  } catch (error) {
    console.error("An error occurred during browser automation:", error);
    throw error; // Re-throw the error to be caught by process.js
  } finally {
    await browser.close();
  }
}
