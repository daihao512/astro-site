import { readFile, writeFile } from 'node:fs/promises';

const path = 'dist/_routes.json';
const routes = JSON.parse(await readFile(path, 'utf8'));
const splatPrefixes = routes.exclude
  .filter((rule) => rule.endsWith('/*'))
  .map((rule) => rule.slice(0, -1));
routes.exclude = routes.exclude.filter((rule) =>
  !splatPrefixes.some((prefix) => rule !== `${prefix}*` && rule.startsWith(prefix))
);
await writeFile(path, `${JSON.stringify(routes, null, 2)}\n`);
