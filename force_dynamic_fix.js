import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else callback(p);
  });
}

walk('app', (p) => {
  if (p.endsWith('page.tsx')) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace("export const dynamic = 'force-dynamic';\n", "");
    content = content.replace("'use client';", "'use client';\nexport const dynamic = 'force-dynamic';\n");
    fs.writeFileSync(p, content);
  }
});
