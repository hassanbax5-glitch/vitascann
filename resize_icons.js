const sharp = require('sharp');
const path = require('path');

const src = 'C:/Users/hassa/Desktop/hf_20260709_231907_924c29cb-e579-4fb4-b30f-0960dfb5d4ff.png';
const base = 'C:/Users/hassa/Desktop/VitaScann/vitascann-app/android/app/src/main/res';

const sizes = [
  ['mipmap-mdpi', 48],
  ['mipmap-hdpi', 72],
  ['mipmap-xhdpi', 96],
  ['mipmap-xxhdpi', 144],
  ['mipmap-xxxhdpi', 192],
];

(async () => {
  for (const [folder, size] of sizes) {
    const out = path.join(base, folder);
    await sharp(src).resize(size, size).png().toFile(path.join(out, 'ic_launcher.png'));
    await sharp(src).resize(size, size).png().toFile(path.join(out, 'ic_launcher_round.png'));
    console.log('Done: ' + folder);
  }
  console.log('Toutes les icones generees!');
})();
