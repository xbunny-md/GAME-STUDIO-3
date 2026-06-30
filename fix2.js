import fs from 'fs';

const files = ['src/components/CommentBox.tsx', 'src/views/Leaderboard.tsx', 'src/views/Profile.tsx', 'src/views/Game.tsx'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/to=/g, "href=");
    
    if (f === 'src/views/Game.tsx' && !content.includes('next/navigation')) {
      content = "import { useParams } from 'next/navigation';\n" + content;
    }
    
    fs.writeFileSync(f, content);
  }
});
