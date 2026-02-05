import fs from 'fs';
import path from 'path';

const categories = ['politics', 'economy', 'technology'];
const languages = ['zh', 'en'];

// 更新索引文件，添加 category 字段
function updateIndexFile(filePath, category) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    if (Array.isArray(data)) {
      const lang = filePath.split('/')[2];
      const updated = data.map(item => ({
        ...item,
        category: category,
        path: item.path ? item.path.replace(`/data/${lang}/archive/`, `/data/${lang}/${category}/archive/`) : undefined
      }));
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
      console.log(`Updated: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error updating ${filePath}:`, err.message);
  }
}

// 更新详情文件，添加 category 字段
function updateDetailFile(filePath, category) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    if (data && typeof data === 'object') {
      data.category = category;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Updated: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error updating ${filePath}:`, err.message);
  }
}

// 处理所有文件
languages.forEach(lang => {
  categories.forEach(cat => {
    const basePath = path.join('public', 'data', lang, cat);
    
    // 更新索引文件
    const indexPath = path.join(basePath, 'index.json');
    if (fs.existsSync(indexPath)) {
      updateIndexFile(indexPath, cat);
    }
    
    // 更新详情文件
    const archivePath = path.join(basePath, 'archive');
    if (fs.existsSync(archivePath)) {
      const files = fs.readdirSync(archivePath).filter(f => f.endsWith('.json'));
      files.forEach(file => {
        updateDetailFile(path.join(archivePath, file), cat);
      });
    }
  });
});

console.log('Category update complete!');
