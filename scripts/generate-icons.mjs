import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const svgPath = join(process.cwd(), 'public', 'icon.svg');
const svg = readFileSync(svgPath);

const sizes = [
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 32, name: 'favicon.png' },
];

async function generate() {
  for (const { size, name } of sizes) {
    await sharp(svg).resize(size, size).png().toFile(join(process.cwd(), 'public', name));
    console.log(`Generated ${name} (${size}x${size})`);
  }
}

generate().catch(console.error);
