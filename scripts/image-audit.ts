/** Run this to help audit which songs need jackets, and which already have jackets but are not linked up */
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import fuzzysearch from 'fuzzy-search';
import { GameData, Song } from '../src/models/SongData';
const { writeJsonData } = require("./utils");

const jacketDir = path.resolve(__dirname, "..", "src/assets/jackets");
const targetFile = path.resolve(__dirname, "../src/songs/a20plus.json");

const images = fs
  .readdirSync(jacketDir)
  .filter((file) => !file.startsWith("ex_"));
const jacketIndex = new fuzzysearch(images, undefined, { sort: true });

function jacketExists(song: Song) {
  return fs.existsSync(path.join(jacketDir, song.jacket));
}

function jacketOnDisc(song: Song) {
  return (
    fs.existsSync(path.join(jacketDir, song.name + ".png")) ||
    fs.existsSync(path.join(jacketDir, song.name_translation + ".png"))
  );
}

async function promptForJacket(song: Song) {
  const jacketKey = song.name_translation || song.name;
  let results = jacketIndex.search(jacketKey);
  if (!results.length) {
    results = jacketIndex.search(jacketKey.slice(0, 3));
  }
  results.unshift("");
  const answers = await inquirer.prompt({
    type: "list",
    name: "image",
    message: `Pick a jacket for ${jacketKey}`,
    choices: results,
  });
  return answers.image;
}

const counts = {
  missingJacket: [] as string[],
  unusedJacketOnDisc: [] as string[],
  missingOnDisc: [] as string[],
};

async function main() {
  const data: GameData = require(targetFile);

  for (const song of data.songs) {
    if (song.jacket) {
      if (!jacketExists(song)) {
        counts.missingOnDisc.push(song.name);
      }
    } else {
      counts.missingJacket.push(song.name_translation || song.name);
      if (jacketOnDisc(song)) {
        counts.unusedJacketOnDisc.push(song.name);
      } else {
        song.jacket = await promptForJacket(song);
      }
    }
  }

  console.log(counts);
  console.log({
    missingJacket: counts.missingJacket.length,
    unusedJacketOnDisc: counts.unusedJacketOnDisc.length,
    missingOnDisc: counts.missingOnDisc.length,
  });
  writeJsonData(data, targetFile);
}

main();
