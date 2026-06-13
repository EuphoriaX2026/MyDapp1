import fs from 'fs';
import path from 'path';

const root = path.resolve('src');
const skip = `${path.sep}pages${path.sep}public${path.sep}`;
const RESP = /\b(?:sm|md|lg|xl|2xl):!?[a-zA-Z0-9_[\]./#%+-]+/g;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      if (p.includes(skip)) continue;
      walk(p, out);
    } else if (/\.(tsx|ts)$/.test(name) && !p.includes(skip)) {
      out.push(p);
    }
  }
  return out;
}

function normalizeClasses(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function process(content) {
  return content.replace(RESP, (match, offset, full) => {
    void match;
    void offset;
    void full;
    return '';
  }).replace(/className="([^"]*)"/g, (_, cls) => `className="${normalizeClasses(cls)}"`);
}

for (const file of walk(root)) {
  const src = fs.readFileSync(file, 'utf8');
  const next = process(src);
  if (next !== src) {
    fs.writeFileSync(file, next);
    console.log('updated', path.relative(root, file));
  }
}
