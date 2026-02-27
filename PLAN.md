# ACG萌图宅 项目改造计划

## 背景

项目从爬虫自动抓取Pixiv数据的模式，转型为人工筛选+AI鉴赏的内容策展模式。目标是降低运营成本、规避版权风险、提升内容质量，并为微信公众号引流。

## 核心变更

- **删除**: 推荐栏目（`/recommendations`）
- **改造**: 排行榜 → 每日排行精选（人工从Pixiv排行中挑选）
- **新增**: 每日美图、画师鉴赏、话题鉴赏三个栏目
- **新增**: 管理后台（内建 `/admin` 路由，密码保护）
- **新增**: 公众号引流组件（二维码、分享按钮）
- **清理**: 移除Supabase依赖，简化为Turso单库
- **图片**: 下载到B2对象存储

---

## 实施阶段

### 第一阶段：数据库Schema + 类型定义

**数据库迁移** — 创建 `migrations/001_curation_tables.sql`:

```sql
-- pic表新增字段
ALTER TABLE pic ADD COLUMN curation_type TEXT;   -- ranking_pick/daily_art/artist_feature/topic_feature
ALTER TABLE pic ADD COLUMN curated_date TEXT;
ALTER TABLE pic ADD COLUMN editor_comment TEXT;

-- 每日精选
CREATE TABLE daily_pick (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pick_date TEXT NOT NULL,
  pick_type TEXT NOT NULL DEFAULT 'daily_art',  -- ranking_pick | daily_art
  title TEXT,
  description TEXT,
  cover_pid TEXT,
  is_published INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE daily_pick_artwork (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  daily_pick_id INTEGER NOT NULL,
  pid TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  editor_comment TEXT
);

-- 画师专题
CREATE TABLE artist_feature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artist_avatar TEXT,
  artist_bio TEXT,
  feature_title TEXT NOT NULL,
  feature_content TEXT,          -- Markdown
  cover_pid TEXT,
  pixiv_url TEXT,
  twitter_url TEXT,
  is_published INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE artist_feature_artwork (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_feature_id INTEGER NOT NULL,
  pid TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  editor_comment TEXT
);

-- 话题专题
CREATE TABLE topic_feature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_name TEXT NOT NULL,
  topic_slug TEXT NOT NULL UNIQUE,
  topic_description TEXT,
  feature_content TEXT,          -- Markdown
  cover_pid TEXT,
  tags TEXT,                     -- 逗号分隔
  is_published INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE topic_feature_artwork (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_feature_id INTEGER NOT NULL,
  pid TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  editor_comment TEXT
);

-- 索引
CREATE INDEX idx_daily_pick_date ON daily_pick(pick_date);
CREATE INDEX idx_daily_pick_published ON daily_pick(is_published);
CREATE INDEX idx_artist_feature_published ON artist_feature(is_published);
CREATE INDEX idx_topic_feature_published ON topic_feature(is_published);
CREATE INDEX idx_topic_feature_slug ON topic_feature(topic_slug);
```

**修改文件:**
- `src/types/index.ts` — 新增 `CurationType`, `DailyPick`, `ArtistFeature`, `TopicFeature`, `AdminStats` 类型；移除 `RecommendationData`
- `src/lib/turso.ts` — 新增数据访问函数: `getDailyPicks()`, `getDailyPickByDate()`, `createDailyPick()`, `getArtistFeatures()`, `getArtistFeatureById()`, `createArtistFeature()`, `getTopicFeatures()`, `getTopicFeatureBySlug()`, `createTopicFeature()`, `addArtworkByPid()`, `getContentStats()` 等

---

### 第二阶段：管理后台框架

**认证系统:**
- 新建 `src/lib/admin-auth.ts` — token生成与验证
- 新建 `app/api/admin/login/route.ts` — 登录API
- 环境变量: `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`

**后台页面框架:**
- 新建 `app/admin/layout.tsx` — 后台专用布局（侧边栏+主区域，不用公共Navigation）
- 新建 `app/admin/page.tsx` — 仪表盘（内容统计）
- 新建 `app/admin/login/page.tsx` — 登录页

**管理组件:**
- 新建 `src/components/admin/AdminSidebar.tsx`
- 新建 `src/components/admin/AdminHeader.tsx`
- 新建 `src/components/admin/StatsCard.tsx`
- 新建 `src/components/admin/DataTable.tsx`
- 新建 `src/components/admin/ConfirmDialog.tsx`

---

### 第三阶段：作品管理功能

**Pixiv信息获取:**
- 新建 `src/lib/pixiv-api.ts` — `fetchPixivIllustInfo(pid)`, `fetchPixivIllustPages(pid)`（复用proxy-worker的Pixiv AJAX API逻辑）

**B2存储上传:**
- 新建 `src/lib/b2-storage.ts` — `downloadAndUploadPixivImage(url, pid, size)`
- 环境变量: `B2_APPLICATION_KEY_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_ID`, `B2_BUCKET_NAME`, `PIXIV_COOKIE`

**API路由:**
- 新建 `app/api/admin/artwork/route.ts` — GET列表 / POST通过PID添加 / DELETE删除
- 新建 `app/api/admin/artwork/batch/route.ts` — POST批量添加

**管理页面:**
- 新建 `app/admin/artworks/page.tsx` — 作品列表（表格，搜索/筛选）
- 新建 `app/admin/artworks/add/page.tsx` — 添加作品（PID输入→预览→确认→B2上传）
- 新建 `src/components/admin/ArtworkForm.tsx`

---

### 第四阶段：每日精选管理

**API路由:**
- 新建 `app/api/admin/daily-picks/route.ts` — CRUD
- 新建 `app/api/admin/daily-picks/[id]/artworks/route.ts` — 管理精选中的作品
- 新建 `app/api/daily-picks/route.ts` — 公共API（支持date、type参数）

**管理页面:**
- 新建 `app/admin/daily-picks/page.tsx` — 精选列表（按日期）
- 新建 `app/admin/daily-picks/[id]/page.tsx` — 编辑精选（选作品、排序、写评语、发布）
- 新建 `src/components/admin/DailyPickEditor.tsx`

---

### 第五阶段：画师专题 + 话题专题管理

**画师专题API:**
- 新建 `app/api/admin/artist-features/route.ts` — CRUD
- 新建 `app/api/admin/artist-features/[id]/artworks/route.ts`
- 新建 `app/api/artist-features/route.ts` — 公共列表API
- 新建 `app/api/artist-features/[id]/route.ts` — 公共详情API

**话题专题API:**
- 新建 `app/api/admin/topic-features/route.ts` — CRUD
- 新建 `app/api/admin/topic-features/[id]/artworks/route.ts`
- 新建 `app/api/topic-features/route.ts` — 公共列表API
- 新建 `app/api/topic-features/[id]/route.ts` — 公共详情API

**管理页面:**
- 新建 `app/admin/artists/page.tsx` + `app/admin/artists/[id]/page.tsx`
- 新建 `app/admin/topics/page.tsx` + `app/admin/topics/[id]/page.tsx`
- 新建 `src/components/admin/MarkdownEditor.tsx` — Markdown编辑+实时预览

---

### 第六阶段：公共页面 — 每日精选 + 排行榜改造

**每日美图:**
- 新建 `app/daily/page.tsx` — 以日期展示每日美图，日期选择器，作品网格

**排行榜改造:**
- 修改 `app/rankings/page.tsx` — 从自动排行改为展示人工精选（`pick_type='ranking_pick'`），移除daily/weekly/monthly选择器，改为日期切换
- 修改 `app/api/rankings/route.ts` — 数据源从ranking表改为daily_pick表

**通用组件:**
- 新建 `src/components/CuratedArtworkCard.tsx` — 策展卡片（含编辑评语、Pixiv原链接 `https://www.pixiv.net/artworks/{pid}`）
- 新建 `src/components/ArtworkGrid.tsx` — 通用作品网格

---

### 第七阶段：公共页面 — 画师鉴赏 + 话题鉴赏

**画师鉴赏:**
- 新建 `app/artists/page.tsx` — 画师专题列表（卡片：封面、画师名、标题）
- 新建 `app/artists/[id]/page.tsx` — 画师详情（画师信息+鉴赏文章+代表作品）
- 新建 `src/components/ArtistProfileCard.tsx`

**话题鉴赏:**
- 新建 `app/topics/page.tsx` — 话题列表
- 新建 `app/topics/[id]/page.tsx` — 话题详情（描述+鉴赏文章+相关作品）

**通用:**
- 新建 `src/components/FeatureArticle.tsx` — Markdown鉴赏文章渲染组件（复用现有remark管道 `src/lib/articles.ts`）

---

### 第八阶段：导航 + 首页 + 页脚改造

**导航** — 修改 `src/components/Navigation.tsx`:
```
navItems 从:
  首页 / 排行榜 / 推荐 / 鉴赏 / 搜图
改为:
  首页 / 每日排行精选 / 每日美图 / 画师鉴赏 / 话题鉴赏 / 文章 / 搜图
```

**首页** — 修改 `app/page.tsx`:
- 轮播数据源从 `/api/recommendations` 改为 `/api/daily-picks`
- 下方展示四个板块入口预览（排行精选/每日美图/画师鉴赏/话题鉴赏）

**页脚** — 修改 `src/components/Footer.tsx`:
- 更新链接，移除"推荐"，添加新栏目
- 添加公众号二维码区域

**公众号组件:**
- 新建 `src/components/WechatQRCode.tsx` — 二维码+关注CTA
- 新建 `src/components/ShareButtons.tsx` — 分享按钮（复制链接、微博）
- 需提供 `public/images/wechat-qrcode.png`

---

### 第九阶段：清理旧功能

- 删除 `app/recommendations/page.tsx`
- 删除 `app/api/recommendations/route.ts`
- 删除 `src/lib/supabase.ts`
- 修改 `src/lib/turso.ts` — 移除 `getRecommendations()`
- 修改 `src/types/index.ts` — 移除 `RecommendationData`
- 修改 `package.json` — 移除 `@supabase/supabase-js`
- 全局搜索清理所有supabase引用

---

### 第十阶段：作品详情页 + 公众号集成

- 修改 `app/artwork/[id]/` — 添加"在Pixiv查看原作"按钮、编辑评语展示、分享按钮、公众号二维码
- 修改 `app/articles/[id]/page.tsx` — 文章底部添加公众号CTA

---

## 阶段依赖关系

```
第一阶段 (数据库Schema)
   ↓
第二阶段 (管理后台框架)
   ↓
第三阶段 (作品管理) ←── 可开始录入数据
   ↓
第四阶段 (每日精选管理)
   ↓
第五阶段 (画师/话题管理)
   ↓
第六阶段 (每日精选公共页面) ─┐
第七阶段 (画师/话题公共页面) ─┤ 可并行
                              ↓
第八阶段 (导航/首页/页脚)
   ↓
第九阶段 (清理旧功能)
   ↓
第十阶段 (公众号集成)
```

## 新增依赖

```bash
npm install jose              # JWT认证（轻量，支持Edge Runtime）
npm install @aws-sdk/client-s3 # B2 S3兼容API
```

## 新增环境变量

```env
# 管理后台
ADMIN_PASSWORD=xxx
ADMIN_JWT_SECRET=xxx

# B2存储
B2_APPLICATION_KEY_ID=xxx
B2_APPLICATION_KEY=xxx
B2_BUCKET_ID=xxx
B2_BUCKET_NAME=xxx

# Pixiv（服务端获取作品信息用）
PIXIV_COOKIE=xxx
```

## 验证方式

每个阶段完成后:
1. `npm run check` — TypeScript类型检查通过
2. `npm run build` — 构建成功
3. `npm run dev` — 手动验证页面功能正常
4. 最终验收: 全站所有栏目可访问，管理后台可登录并添加内容，推荐页面已移除，公众号引流组件展示正常
