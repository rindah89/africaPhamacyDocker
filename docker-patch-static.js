// Patch script to disable static generation for Docker builds
const fs = require('fs');
const path = require('path');

// Files that have generateStaticParams
const filesToPatch = [
  'app/(shop)/brands/[slug]/page.tsx',
  'app/(shop)/product/[slug]/page.tsx'
];

// Backup and patch files
filesToPatch.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace generateStaticParams with empty function
    const patched = content.replace(
      /export\s+async\s+function\s+generateStaticParams[^}]+\}/gs,
      'export async function generateStaticParams() { return []; }'
    );
    
    // Create backup
    fs.writeFileSync(filePath + '.backup', content);
    // Write patched version
    fs.writeFileSync(filePath, patched);
    console.log(`Patched ${file}`);
  }
});

console.log('Static generation disabled for Docker build');