import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const activeHtml = html.replace(/<!--[\s\S]*?-->/g, '');
const errors = [];

const ids = [...activeHtml.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) errors.push(`Duplicate IDs: ${[...new Set(duplicates)].join(', ')}`);

for (const match of activeHtml.matchAll(/\bhref="#([^"]+)"/g)) {
  if (!ids.includes(match[1])) errors.push(`Missing fragment target: #${match[1]}`);
}

for (const match of activeHtml.matchAll(/\b(?:href|src|data)="([^"]+)"/g)) {
  const reference = match[1];
  if (/^(?:https?:|mailto:|#|data:)/.test(reference)) continue;
  const localPath = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  if (!existsSync(resolve(root, localPath))) errors.push(`Missing local asset: ${reference}`);
}

for (const match of activeHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  try { JSON.parse(match[1]); }
  catch (error) { errors.push(`Invalid JSON-LD: ${error.message}`); }
}

if (!/<meta name="description"/.test(activeHtml)) errors.push('Missing meta description');
if (!/<link rel="canonical"/.test(activeHtml)) errors.push('Missing canonical URL');
if (!/<meta property="og:image"/.test(activeHtml)) errors.push('Missing Open Graph image');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Site checks passed: ${ids.length} unique IDs and all local references resolved.`);
