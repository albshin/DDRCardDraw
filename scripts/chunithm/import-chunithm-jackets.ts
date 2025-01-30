import fs from 'fs';
import https from 'node:https';
import fetchImages from '../fetch-arcade-songs-images';

// https.globalAgent.options.ca = fs.readFileSync('node_modules/node_extra_ca_certs_mozilla_bundle/ca_bundle/ca_intermediate_root_bundle.pem');

const GAME_CODE = 'chunithm_sun_plus';
const DATA_URL = 'https://dp4p6x0xfi5o9.cloudfront.net/chunithm/data.json';
const BASE_URL = 'https://dp4p6x0xfi5o9.cloudfront.net/chunithm/img/cover-m/';

async function run() {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  const data = JSON.parse(
    fs.readFileSync(`src/songs/${GAME_CODE}.json`, 'utf-8'),
  );
  await fetchImages(DATA_URL, BASE_URL, data.songs);
}

if (require.main === module) run();
