import fs from 'fs';
import path from 'path';

// 处理单个日报文件
function processDailyFile(filePath, language) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // 提取第一条重要新闻的标题和内容
    let firstNewsTitle = '';
    let firstNewsSummary = '';
    
    if (data.fullContent) {
      // 解析fullContent，提取第一条新闻
      const lines = data.fullContent.split('\n');
      let inNews = false;
      let newsLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // 匹配新闻标题（## 或 ### 开头）
        if (line.startsWith('## 重点情报') || line.startsWith('## Key Intelligence')) {
          inNews = true;
          continue;
        }
        
        if (inNews && line.startsWith('### ')) {
          // 找到第一条新闻标题
          firstNewsTitle = line.replace('### ', '').trim();
          // 收集接下来的摘要内容
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j];
            if (nextLine.startsWith('### ') || nextLine.startsWith('## ')) {
              break;
            }
            if (nextLine.startsWith('- **摘要**: ') || nextLine.startsWith('- **Summary**: ')) {
              firstNewsSummary = nextLine.replace('- **摘要**: ', '').replace('- **Summary**: ', '').trim();
              break;
            }
          }
          break;
        }
      }
    }
    
    // 如果没有找到，使用原标题和摘要
    if (!firstNewsTitle) {
      firstNewsTitle = data.title;
      firstNewsSummary = data.summary;
    }
    
    return { id: data.id, date: data.date, title: firstNewsTitle, summary: firstNewsSummary, coverImage: data.coverImage };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

// 处理整个目录
function processDirectory(directory, language) {
  const files = fs.readdirSync(directory);
  const results = [];
  
  for (const file of files) {
    if (file.endsWith('.json') && file !== 'index.json') {
      const filePath = path.join(directory, file);
      const result = processDailyFile(filePath, language);
      if (result) {
        results.push(result);
      }
    }
  }
  
  // 按日期排序（最新的在前）
  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return results;
}

// 主函数
function main() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  
  // 处理中文版
  const zhArchiveDir = path.join(__dirname, 'public', 'data', 'zh', 'archive');
  const zhIndexPath = path.join(__dirname, 'public', 'data', 'zh', 'index.json');
  
  if (fs.existsSync(zhArchiveDir)) {
    const zhResults = processDirectory(zhArchiveDir, 'zh');
    fs.writeFileSync(zhIndexPath, JSON.stringify(zhResults, null, 2), 'utf8');
    console.log(`Updated ${zhResults.length} entries in ${zhIndexPath}`);
  }
  
  // 处理英文版
  const enArchiveDir = path.join(__dirname, 'public', 'data', 'en', 'archive');
  const enIndexPath = path.join(__dirname, 'public', 'data', 'en', 'index.json');
  
  if (fs.existsSync(enArchiveDir)) {
    const enResults = processDirectory(enArchiveDir, 'en');
    fs.writeFileSync(enIndexPath, JSON.stringify(enResults, null, 2), 'utf8');
    console.log(`Updated ${enResults.length} entries in ${enIndexPath}`);
  }
}

main();