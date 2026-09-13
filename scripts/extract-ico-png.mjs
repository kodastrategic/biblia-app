import sharp from 'sharp';
import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join, resolve } from 'path';

const root = resolve(process.cwd());
const icoPath = join(root, 'icon.ico');
const publicDir = join(root, 'public');

const ico = readFileSync(icoPath);
const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const start = ico.indexOf(pngSig);
if (start === -1) {
  console.error('PNG não encontrado dentro do ICO.');
  process.exit(1);
}

let end = ico.indexOf(Buffer.from([0x49, 0x45, 0x4e, 0x44]), start);
if (end !== -1) end += 8;

const png = ico.subarray(start, end === -1 ? ico.length : end);
const pngTmp = join(publicDir, 'source.png');
writeFileSync(pngTmp, png);

const meta = await sharp(pngTmp).metadata();
console.log(`PNG extraído: ${meta.width}x${meta.height}`);

const sizes = [
  { size: 32, name: 'favicon.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

for (const { size, name } of sizes) {
  await sharp(pngTmp).resize(size, size).png().toFile(join(publicDir, name));
  console.log(`Gerado: ${name} (${size}x${size})`);
}

copyFileSync(icoPath, join(publicDir, 'icon.ico'));
console.log('Copiado: public/icon.ico');

sharp(pngTmp).png().toFile(join(publicDir, 'icon-512-square.png'));
console.log('Gerado: icon-512-square.png');