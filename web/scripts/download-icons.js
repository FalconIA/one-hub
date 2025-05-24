const fs = require('fs');
const path = require('path');
const { writeFile } = require('fs/promises');

// 需要下载的图标集
const iconSets = [
  'solar',
  'ph',
  'mdi',
  'eva',
  'ri',
  'uim',
  'tabler',
  'ic',
  'lets-icons',
  'material-symbols',
  'mingcute'
];

// 图标输出目录
const outputDir = path.join(__dirname, '../src/assets/icons');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadIconSet(prefix) {
  try {
    // 从 @iconify/json 包中导入图标集
    const iconSetPath = require.resolve(`@iconify/json/json/${prefix}.json`);
    const iconSet = require(iconSetPath);
    
    if (!iconSet) {
      throw new Error(`Icon set ${prefix} not found`);
    }
    
    // 保存为 JSON 文件
    const outputPath = path.join(outputDir, `${prefix}.json`);
    await writeFile(outputPath, JSON.stringify(iconSet, null, 2));
    
    console.log(`Downloaded ${prefix} icon set`);
  } catch (error) {
    console.error(`Error downloading ${prefix} icon set:`, error);
  }
}

async function main() {
  for (const prefix of iconSets) {
    await downloadIconSet(prefix);
  }
}

main().catch(console.error); 