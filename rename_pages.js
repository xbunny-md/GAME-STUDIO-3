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
walk('src', (p) => {
  if (exts.includes(path.extname(p))) {
    let content = fs.readFileSync(p, 'utf8');
    const newContent = content.replace(/pages\//g, "views/");
    if (content !== newContent) fs.writeFileSync(p, newContent);
  }
});
walk('app', (p) => {
  if (exts.includes(path.extname(p))) {
    let content = fs.readFileSync(p, 'utf8');
    const newContent = content.replace(/pages\//g, "views/");
    if (content !== newContent) fs.writeFileSync(p, newContent);
  }
});

console.log("Renamed pages/ to views/");
