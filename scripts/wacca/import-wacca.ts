import path from 'path';
import { writeJsonData } from '../utils';

const fetch = require('node-fetch');

const DATA_URL = 'https://dp4p6x0xfi5o9.cloudfront.net/wacca/data.json';
const OUTFILE = 'src/songs/wacca_reverse.json';

function extractSong(rawSong: Record<string, any>) {
  return {
    name: rawSong.title,
    artist: rawSong.artist.trim(),
    folder: rawSong.version,
    category: rawSong.category,
    jacket: `wacca/${rawSong.imageName}`,
    charts: extractSheets(rawSong),
  };
}

function extractSheets(rawSong: Record<string, any>) {
  return rawSong.sheets.map((sheet: any) => ({
    flags: [],
    diffClass: sheet.difficulty,
    lvl: convertLevel(sheet.level),
    levelConstant: Number(sheet.levelValue.toFixed(1)),
  }));
}

function convertLevel(lvl: string) {
  if (lvl.endsWith('+')) {
    return Number(`${lvl.substring(0, lvl.length - 1)}.5`);
  }
  return Number(lvl);
}

export default async function run() {
  console.info(`Fetching data from: ${DATA_URL} ...`);
  const response = await fetch(DATA_URL);

  const json: Record<string, any> = await response.json();
  const rawSongs: Record<string, any>[] = json.songs;
  console.info(`OK, ${rawSongs.length} songs fetched.`);

  const songs = rawSongs.map((rawSong) => extractSong(rawSong));
  const filePath = path.join(__dirname, '../../', OUTFILE);
  const existingData = require(filePath);

  const data = {
    ...existingData,
    songs,
  };

  await writeJsonData(data, filePath);

  console.info('Done!');
}

if (require.main === module) run();
