#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const targets = [
  'docs',
  path.join('content'),
];

const banned = [
  /\bwhere in the world\b/i,
  /\bwarrant\b/i,
  /\bchief\b/i,
  /\bgumshoe\b/i,
  /\bhench\w*/i,
  /\barrest\w*/i,
  /red\s+(coat|hat)/i,
  /trench\s*coat/i,
  /passport\s*stamp/i,
];

let violations = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile()) {
      // Skip root README.md for now (project title legacy) and brand policy docs
      const rootReadme = path.join(root, 'README.md');
      const brandDifferentiation = path.join(root, 'docs', 'brand', 'Differentiation.md');
      if (path.resolve(full) === path.resolve(rootReadme)) continue;
      if (path.resolve(full) === path.resolve(brandDifferentiation)) continue;
      if (!/\.(md|mdx|txt|json)$/i.test(entry.name)) continue;
      const text = fs.readFileSync(full, 'utf8');
      banned.forEach((re) => {
        const m = text.match(re);
        if (m) {
          violations.push({ file: full, term: re.toString() });
        }
      });
    }
  }
}

targets.forEach((t) => {
  const p = path.join(root, t);
  if (fs.existsSync(p)) walk(p);
});

if (violations.length) {
  console.error('BANNED TERMS FOUND:');
  violations.forEach(v => console.error(`${v.file} -> ${v.term}`));
  process.exit(1);
} else {
  console.log('No banned terms found.');
}
