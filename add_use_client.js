import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else callback(p);
  });
}

const exts = ['.tsx', '.ts', '.jsx', '.js'];
function addUseClient(dir) {
  walk(dir, (p) => {
    if (exts.includes(path.extname(p))) {
      let content = fs.readFileSync(p, 'utf8');
      if (!content.includes("'use client'") && !content.includes('"use client"')) {
        content = "'use client';\n" + content;
        fs.writeFileSync(p, content);
      }
    }
  });
}

addUseClient('src/views');
addUseClient('src/components');
