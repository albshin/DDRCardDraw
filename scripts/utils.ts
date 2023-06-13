import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import pqueue from 'p-queue';
import jimp from 'jimp';
import sanitize from 'sanitize-filename';

function writeJsonData(data: Record<any, any>, filePath: string) {
  data.meta.lastUpdated = Date.now();
  return fs.promises.writeFile(
    filePath,
    prettier.format(JSON.stringify(data), { filepath: filePath })
  );
}

const requestQueue = new pqueue({
  concurrency: 6, // 6 concurrent max
  interval: 1000,
  intervalCap: 10, // 10 per second max
});
const JACKETS_PATH = path.resolve(__dirname, "../src/assets/jackets");

let JACKET_PREFIX = "";
function setJacketPrefix(prefix: string) {
  JACKET_PREFIX = prefix;
}

/**
 * @param coverUrl {string} url of image to fetch
 * @param localFilename {string | undefined} override filename found in url
 *
 * queues a cover path for download into the imageQueue.
 * Always skips if file already exists.
 * Immediately returns the relative path to the jacket where it will be saved
 */
function downloadJacket(coverUrl: string, localFilename?: string) {
  if (!localFilename) {
    localFilename = JACKET_PREFIX + path.basename(coverUrl);
  } else {
    localFilename = JACKET_PREFIX + localFilename;
  }
  if (!localFilename.endsWith(".jpg")) {
    localFilename += ".jpg";
  }
  const sanitizedFilename = sanitize(path.basename(localFilename));
  const outputPath = path.join(path.dirname(localFilename), sanitizedFilename);
  const absoluteOutput = path.join(JACKETS_PATH, outputPath);
  if (!fs.existsSync(absoluteOutput)) {
    requestQueue
      .add(() => jimp.read(coverUrl))
      .then((img) =>
        img.resize(128, jimp.AUTO).quality(80).writeAsync(absoluteOutput)
      )
      .catch((e) => {
        console.error(`image download failure while requesting ${coverUrl}`);
        console.error(e);
      });
  }

  return outputPath;
}

export {
  writeJsonData,
  downloadJacket,
  requestQueue,
  setJacketPrefix,
};
