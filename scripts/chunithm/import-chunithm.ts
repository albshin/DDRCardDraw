import path from 'path';
import { writeJsonData } from '../utils';

const fetch = require('node-fetch');

const DATA_URL =
  'https://web.archive.org/web/20231213090716/https://chunithm.sega.jp/storage/json/music.json';
const OUTFILE = 'src/songs/chunithm_sun_plus.json';

function extractSong(rawSong: Record<string, any>) {
  return {
    id: rawSong.id,
    name: rawSong.title,
    artist: rawSong.artist.trim(),
    folder: '',
    category: rawSong?.catcode ?? rawSong.catname,
    jacket: `chunithm/${rawSong.id}.png`,
    charts: extractSheets(rawSong),
  };
}

function extractSheets(rawSong: Record<string, any>) {
  return [
    { flags: [], diffClass: 'basic', lvl: rawSong.lev_bas },
    { flags: [], diffClass: 'advanced', lvl: rawSong.lev_adv },
    { flags: [], diffClass: 'expert', lvl: rawSong.lev_exp },
    { flags: [], diffClass: 'master', lvl: rawSong.lev_mas },
    { flags: [], diffClass: 'ultima', lvl: rawSong.lev_ult },
    {
      flags: [rawSong.we_tex, rawSong.lev_we],
      diffClass: 'worldsend',
      lvl: 0,
    },
  ]
    .filter((e) => !!e.lvl)
    .map((rawSheet) => ({
      ...rawSheet,
      lvl: rawSong?.we_tex ? 1 : convertLevel(rawSheet.lvl),
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

  const rawSongs: Record<string, any>[] = await response.json();
  rawSongs.sort((a, b) => Number(a.id) - Number(b.id));
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
