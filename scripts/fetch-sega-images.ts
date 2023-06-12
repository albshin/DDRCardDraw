/* eslint-disable no-await-in-loop */
import fs from 'node:fs';
import download from 'download';
import pqueue from 'p-queue';
import { Song } from '../src/models/SongData';

const requestQueue = new pqueue({
  concurrency: 6, // 6 concurrent max
  interval: 1000,
  intervalCap: 10, // 10 per second max
});

export default async function run(
  baseUrl: string,
  songs: Song[],
  headers?: Record<string, string>,
) {
  const coverImgDir = `src/assets/jackets`;

  console.info('* Downloading cover image for songs ...');
  for (const [index, song] of songs.entries()) {
    if (song.jacket && !fs.existsSync(`${coverImgDir}/${song.jacket}`)) {
      console.info(`(${1 + index} / ${songs.length}) ${song.name}`);
      const jacketName = song.jacket.split('/')[1];
      const imageUrl = `${baseUrl}${jacketName}`;

      requestQueue
        .add(() => download(imageUrl, coverImgDir, { filename: song.jacket, headers, rejectUnauthorized: false }))
        .catch((e) => {
          console.log(`Could not download jacket for: ${song.name}`)
        });
    }
  }

  console.info('Done!');
}