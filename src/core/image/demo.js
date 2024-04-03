// const sharp = require('sharp');
import sharp from 'sharp';

const data = await sharp('./public/texture/china-terrain.png')
    // .resize(3200, 2400)
    .withMetadata({ density: 600 })
    .toFile('output.png', (err, info) => {  });