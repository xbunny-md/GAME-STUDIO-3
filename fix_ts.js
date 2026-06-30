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
    
    // Fix `<Link to=`
    content = content.replace(/<Link(.*?)to=/g, "<Link$1href=");
    
    // Fix `useRouter` missing import
    if (content.includes('useRouter()') && !content.includes('next/navigation')) {
      content = "import { useRouter } from 'next/navigation';\n" + content;
    }
    
    // Fix `useParams` missing import
    if (content.includes('useParams()') && !content.includes('next/navigation')) {
      content = "import { useParams } from 'next/navigation';\n" + content;
    }

    fs.writeFileSync(p, content);
  }
});
