import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'src');

function relAppIconImport(filePath) {
  const dir = path.dirname(filePath);
  let rel = path.relative(dir, path.join(root, 'components', 'icons', 'AppIcon')).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx|ts)$/.test(entry.name)) files.push(full);
  }
  return files;
}

for (const file of walk(root)) {
  if (file.endsWith('AppIcon.tsx')) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('<AppIcon') && !content.includes('<AppIcon ')) continue;
  if (content.includes("from '") && /from ['"].*AppIcon['"]/.test(content)) continue;
  if (content.includes('from "../components/icons/AppIcon"') || content.includes("from './icons/AppIcon'")) continue;

  const importPath = relAppIconImport(file);
  const importLine = `import { AppIcon } from '${importPath}';\n`;
  if (!content.includes(importLine.trim())) {
    content = importLine + content;
    fs.writeFileSync(file, content);
    console.log('added import:', path.relative(root, file));
  }
}
