import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) htmlFiles.push(file);
  }
}
walk(root);

const urls = new Set();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]+)(?:[?#][^"]*)?"/g)) urls.add(match[1]);
}

const missing = [...urls].filter((url) => {
  const direct = path.join(root, url);
  return !fs.existsSync(direct) && !fs.existsSync(path.join(root, url, 'index.html'));
});

console.log(`internal link check: ${htmlFiles.length} HTML files, ${urls.size} targets`);
if (missing.length) {
  console.error('Missing targets:', missing.join(', '));
  process.exit(1);
}
console.log('internal link check: PASS');
