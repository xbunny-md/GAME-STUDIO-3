import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/Collections.tsx',
  'src/pages/EmailSubscribers.tsx',
  'src/pages/Blog.tsx',
  'src/pages/Game.tsx',
  'src/pages/Collection.tsx',
  'src/pages/Leaderboard.tsx',
  'src/pages/Admin.tsx',
  'src/pages/BlogPost.tsx',
  'src/pages/Login.tsx',
  'src/pages/Profile.tsx',
  'src/components/Sidebar.tsx',
  'src/components/GameCard.tsx',
  'src/components/CommentBox.tsx',
  'src/pages/Home.tsx',
  'src/pages/Special.tsx',
  'src/pages/Wishlist.tsx',
  'src/pages/About.tsx',
  'src/pages/Contact.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace Link
  content = content.replace(/import \{.*?Link.*?\} from 'react-router-dom';/g, "import Link from 'next/link';");
  content = content.replace(/<Link to=/g, "<Link href=");
  
  // Replace useNavigate
  content = content.replace(/import \{.*?useNavigate.*?\} from 'react-router-dom';/g, "import { useRouter } from 'next/navigation';");
  content = content.replace(/const navigate = useNavigate\(\);/g, "const router = useRouter();");
  content = content.replace(/navigate\(/g, "router.push(");
  
  // Replace useParams
  content = content.replace(/import \{.*?useParams.*?\} from 'react-router-dom';/g, "import { useParams } from 'next/navigation';");
  
  // Multi-imports handling
  content = content.replace(/import \{ (.*?) \} from 'react-router-dom';/g, (match, p1) => {
    let imports = [];
    if (p1.includes('Link')) imports.push("import Link from 'next/link';");
    if (p1.includes('useNavigate')) imports.push("import { useRouter } from 'next/navigation';");
    if (p1.includes('useParams')) imports.push("import { useParams } from 'next/navigation';");
    return imports.join('\n');
  });

  fs.writeFileSync(file, content);
});
console.log("Replaced react-router-dom with next/navigation");
