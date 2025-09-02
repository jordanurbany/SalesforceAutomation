import fs from "fs";
import path from "path";
import unzipper from "unzipper";

/**
 * Unzips a .zip file to a specified directory.
 * @param {string} zipFilePath The full path to the .zip file.
 * @param {string} destinationDir The folder where files should be extracted.
 * @returns {Promise<string[]>} A promise that resolves with an array of the full paths to the extracted files.
 */
export async function unzipFile(zipFilePath, destinationDir) {
  console.log(`Unzipping ${zipFilePath} to ${destinationDir}...`);

  // Ensure the destination directory exists
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  const extractedFilePaths = [];

  await fs
    .createReadStream(zipFilePath)
    .pipe(unzipper.Parse())
    .on("entry", function (entry) {
      const fileName = entry.path;
      const type = entry.type; // 'Directory' or 'File'

      // We only care about files, not the directories inside the zip
      if (type === "File") {
        const fullPath = path.join(destinationDir, fileName);
        extractedFilePaths.push(fullPath);
        entry.pipe(fs.createWriteStream(fullPath));
      } else {
        entry.autodrain();
      }
    })
    .promise(); // .promise() waits for the entire stream to finish

  console.log("Unzipping complete.");
  return extractedFilePaths;
}
