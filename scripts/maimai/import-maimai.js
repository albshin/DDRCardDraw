const fetch = require('node-fetch');
const path = require('path');
const { writeJsonData } = require('../utils');
const {
  MAIMAI_FESTIVAL_UNLOCKS,
  MAIMAI_UNIVERSE_PLUS_UNLOCKS,
} = require('./unlockable-maimai-songs');

const DATA_URL =
  'https://web.archive.org/web/20230316205106/https://maimai.sega.jp/data/maimai_songs.json';
const OUTFILE = 'src/songs/maimai_dx_festival.json';

const versionMap = new Map([
  [0, null],
  [100, 'maimai'],
  [110, 'maimai PLUS'],
  [120, 'GreeN'],
  [130, 'GreeN PLUS'],
  [140, 'ORANGE'],
  [150, 'ORANGE PLUS'],
  [160, 'PiNK'],
  [170, 'PiNK PLUS'],
  [180, 'MURASAKi'],
  [185, 'MURASAKi PLUS'],
  [190, 'MiLK'],
  [195, 'MiLK PLUS'],
  [199, 'FiNALE'],
  [200, 'maimaiでらっくす'],
  [205, 'maimaiでらっくす PLUS'],
  [210, 'Splash'],
  [215, 'Splash PLUS'],
  [220, 'UNiVERSE'],
  [225, 'UNiVERSE PLUS'],
  [230, 'FESTiVAL'],
  //! add further version here !//
]);

function extractSong(rawSong) {
  const versionId = Number(rawSong.version.substring(0, 3));
  const version = versionMap.get(versionId);

  if (version === undefined) {
    log.warn(
      `Unknown version id: ${versionId}, remember to add new version entry.`
    );
  }

  // Add unlockable flags
  let flags = [];
  if (MAIMAI_FESTIVAL_UNLOCKS.includes(rawSong.title)) {
    flags.push('unlock');
  }

  if (MAIMAI_UNIVERSE_PLUS_UNLOCKS.includes(rawSong.title)) {
    flags.push('unlock_uni_plus');
  }

  return {
    name: rawSong.title,
    artist: rawSong.artist.trim(),
    folder: version,
    category: rawSong.catcode,
    jacket: `maimai/${rawSong.image_url}`,
    charts: extractCharts(rawSong),
    flags,
  };
}

function extractCharts(rawSong) {
  return [
    { flags: ['dx'], diffClass: 'basic', lvl: rawSong.dx_lev_bas },
    { flags: ['dx'], diffClass: 'advanced', lvl: rawSong.dx_lev_adv },
    { flags: ['dx'], diffClass: 'expert', lvl: rawSong.dx_lev_exp },
    { flags: ['dx'], diffClass: 'master', lvl: rawSong.dx_lev_mas },
    { flags: ['dx'], diffClass: 'remaster', lvl: rawSong.dx_lev_remas },
    { flags: ['std'], diffClass: 'basic', lvl: rawSong.lev_bas },
    { flags: ['std'], diffClass: 'advanced', lvl: rawSong.lev_adv },
    { flags: ['std'], diffClass: 'expert', lvl: rawSong.lev_exp },
    { flags: ['std'], diffClass: 'master', lvl: rawSong.lev_mas },
    { flags: ['std'], diffClass: 'remaster', lvl: rawSong.lev_remas },
  ]
    .filter((e) => !!e.lvl)
    .map((rawSheet) => ({
      ...rawSheet,
      lvl: convertLevel(rawSheet.lvl),
    }));
}

function convertLevel(lvl) {
  if (lvl.endsWith('+')) {
    return Number(`${lvl.substring(0, lvl.length - 1)}.5`);
  }
  return Number(lvl);
}

async function run() {
  console.info(`Fetching data from: ${DATA_URL} ...`);
  const response = await fetch(DATA_URL);

  const rawSongs = await response.json();
  console.info(`OK, ${rawSongs.length} songs fetched.`);

  const songs = rawSongs.map((rawSong) => extractSong(rawSong));
  const filePath = path.join(__dirname, '../../', OUTFILE);
  const existingData = require(filePath);

  const maimaiData = {
    ...existingData,
    songs,
  };

  await writeJsonData(maimaiData, filePath);
  console.info('Done!');
}

if (require.main === module) run();
