const fs = require('fs');
const path = require('path');

const sourceDir = 'C:/Users/viren/Downloads/ai-website-cloner-template-master/ai-website-cloner-template-master/Website2-Shopify-Theme-Generate';
const outputFile = 'C:/Users/viren/Downloads/ai-website-cloner-template-master/ai-website-cloner-template-master/morphogen-theme.zip';

// Simple ZIP creation (stores files without compression)
function createSimpleZip(source, dest) {
  const files = getAllFiles(source);
  let zipData = '';
  
  files.forEach(file => {
    const relativePath = path.relative(source, file);
    const content = fs.readFileSync(file);
    const base64 = content.toString('base64');
    
    // For now, just list files
    console.log('Would add:', relativePath);
  });
  
  console.log('Total files:', files.length);
  console.log('Output:', dest);
}

function getAllFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  });
  
  return files;
}

console.log('Checking theme folder...');
console.log('Source:', sourceDir);
console.log('Output:', outputFile);
console.log('Exists:', fs.existsSync(sourceDir));

if (fs.existsSync(sourceDir)) {
  const files = getAllFiles(sourceDir);
  console.log('Found', files.length, 'files');
  files.forEach(f => console.log(' -', path.relative(sourceDir, f)));
}