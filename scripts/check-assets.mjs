import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}

walk(dist);
const missing = [];
const withoutAlt = [];
let imageCount = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    imageCount++;
    const tag = match[0];
    const src = tag.match(/\bsrc=["']([^"']+)/i)?.[1] ?? '';
    const relative = path.relative(dist, file);
    if (!src) missing.push(`${relative}: image has no src`);
    else if (!/^(https?:|data:|\/\/)/i.test(src)) {
      const asset = path.join(dist, src.replace(/^\//, '').replaceAll('/', path.sep));
      if (!fs.existsSync(asset)) missing.push(`${relative}: ${src}`);
    }
    if (!/\balt=["']/i.test(tag)) withoutAlt.push(relative);
  }
}

console.log(`asset check: ${htmlFiles.length} HTML files, ${imageCount} images`);
if (missing.length || withoutAlt.length) {
  for (const item of missing) console.error(`missing image: ${item}`);
  for (const item of withoutAlt) console.error(`image missing alt: ${item}`);
  process.exit(1);
}
console.log('asset check: PASS');
