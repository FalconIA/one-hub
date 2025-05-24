const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const srcDir = path.join(__dirname, '../src');
const stats = {
  processed: 0,
  modified: 0,
  errors: 0,
  files: []
};

async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    stats.processed++;
    
    // 检查文件是否包含 Icon 组件
    const hasIconImport = content.includes('@iconify/react');
    const hasIconComponent = content.includes('<Icon');
    const hasConstIcon = content.includes('const Icon ');
    
    if (hasIconImport || hasIconComponent) {
      console.log(`Processing file with Icon: ${filePath}`);
      stats.files.push(filePath);
    }
    
    // 替换导入语句
    let newContent = content.replace(
      /import\s*{\s*Icon\s*}\s*from\s*['"]@iconify\/react['"]/g,
      'import LocalIcon from \'src/ui-component/iconify/LocalIcon\''
    );
    
    // 只有在没有 const Icon 定义的情况下才替换 Icon 组件
    if (!hasConstIcon) {
      newContent = newContent.replace(/<Icon\b/g, '<LocalIcon');
      newContent = newContent.replace(/<\/Icon>/g, '</LocalIcon>');
    }
    
    if (content !== newContent) {
      // 创建备份
      const backupPath = `${filePath}.bak`;
      await writeFile(backupPath, content);
      
      await writeFile(filePath, newContent);
      stats.modified++;
      console.log(`Updated ${filePath}`);
    }
  } catch (error) {
    stats.errors++;
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function processDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
      await processFile(fullPath);
    }
  }
}

async function main() {
  console.log('Starting Iconify replacement...');
  await processDirectory(srcDir);
  console.log('Iconify replacement completed');
  console.log('Statistics:', {
    processed: stats.processed,
    modified: stats.modified,
    errors: stats.errors,
    files: stats.files
  });
}

main().catch(console.error); 