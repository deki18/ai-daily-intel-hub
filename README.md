<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://picsum.photos/1200/475?random=1" />
</div>

# AI Daily Intel Hub

AI Daily Intel Hub 是一个现代化的每日情报简报应用，提供简洁、美观的用户界面，展示最新的全球资讯和深度分析。日报追溯新闻真实消息源，并在每条新闻下方附上链接。日报可通过网页自带的播放器进行播报收听。
官方网址https://www.dailyintel.qzz.io/

## 主要功能

- 📱 **响应式设计**：适配各种屏幕尺寸
- 🌐 **多语言支持**：中英文内容展示
- 🎵 **音频播放**：支持情报简报的音频播放
- 📖 **Markdown渲染**：优雅展示结构化内容
- 🔄 **流畅导航**：从登录页到详情页的无缝切换

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **UI组件**: 自定义组件库

## 运行说明

### 本地运行

**前置条件:** Node.js 18+ 

1. 安装依赖:
   ```bash
   npm install
   ```

2. 启动开发服务器:
   ```bash
   npm run dev
   ```

3. 在浏览器中访问:
   ```
   http://localhost:3000
   ```

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录中。

## 项目结构

```
ai-daily-intel-hub/
├── components/        # React组件
├── services/          # 数据服务
├── App.tsx            # 应用入口组件
├── index.tsx          # 应用渲染
├── types.ts           # TypeScript类型定义
├── index.html         # HTML模板
├── package.json       # 项目配置
├── tsconfig.json      # TypeScript配置
└── vite.config.ts     # Vite配置
```

## 许可证

MIT
