# ACG萌图宅

一个精美的二次元插画作品展示平台，专注于ACG文化和萌系艺术的分享与鉴赏。

## 项目特色

- 🎨 **精美界面设计** - 现代化的UI设计，完美展现二次元艺术之美
- 📊 **实时排行榜** - 每日更新的热门萌图排行，发现最受欢迎的作品
- 💝 **个性推荐** - 基于用户喜好的智能推荐系统
- ⭐ **精品鉴赏** - 深度解析二次元优秀作品，提升艺术鉴赏能力
- 📱 **响应式设计** - 完美适配各种设备，随时随地欣赏萌图

## 技术栈

- **前端框架**: Next.js 14 + React 18
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS
- **动画库**: Framer Motion
- **数据库**: Supabase
- **部署平台**: Vercel

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env.local` 文件并配置以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── rankings/          # 排行榜页面
│   ├── recommendations/   # 推荐页面
│   └── articles/          # 文章页面
├── src/
│   ├── components/        # React 组件
│   ├── lib/              # 工具库
│   ├── data/             # 数据层
│   └── types/            # TypeScript 类型定义
└── public/               # 静态资源
```
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
