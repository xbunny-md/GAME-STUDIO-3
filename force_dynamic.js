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
    if (!content.includes('force-dynamic')) {
      content = "export const dynamic = 'force-dynamic';\n" + content;
      fs.writeFileSync(p, content);
    }
  }
});
