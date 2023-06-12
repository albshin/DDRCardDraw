# PerformaiCardDraw
[![Netlify Status](https://api.netlify.com/api/v1/badges/a9ac8be2-edad-4096-b5c4-d30457afc399/deploy-status)](https://app.netlify.com/sites/performaicarddraw/deploys)

This is web-app that allows random draw of songs from Performai and other music games
with a variety of options for filtering which songs and charts are included. The intended use case
is in competitive tournaments or personal training.

The app is officially available at [https://performaicarddraw.netlify.app/](https://performaicarddraw.netlify.app/)
or as a downloadable zip file from the [releases page](https://github.com/albshin/PerformaiCardDraw/releases).
The app supports running fully offline, and can load and operate without an internet connection after
being loaded once in any modern web browser.

Original app by Jeff Lloyd; forked by [noahm](https://github.com/noahm)
and [FuriousDCSL](https://github.com/FuriousDCSL); and again forked. Contributions are welcome!

## Customizing / Contributing

Requirements
- Node 18
- Yarn 4.0.0-rc.40

**If your PR fails Netlify deployment, please check that your Yarn version matches the required Yarn version exactly**

Clone this repo to your computer. Then the following commands will be useful:

```sh
# Before running anything else, do this!
# It's a one-time local install of dependencies needed to build the app.
yarn install

# local development will start, with app running at http://localhost:8080/
# edits to the files in ./src/ will automatically reload the browser
yarn start

# if you make changes to any game/song data in ./src/songs/ this will give
# a basic sanity check on the format and contents of it
yarn validate:json

# build a zipped, standalone copy of the app that runs entirely offline,
# jacket images and all! simply unzip somewhere and open index.html
yarn build:zip
```

There are some other useful scripts in `scripts/` that help in maintaining data integrity and pulling
in new song data. Several have top-level aliases so you can conveniently update song data:

```sh
# Import song data
yarn import:maimai
# Import maimai jackets
yarn import:maimai-jackets
```
