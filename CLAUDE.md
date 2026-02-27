# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ACG萌图宅 (ACG Moe Gallery) is a Next.js-based platform for showcasing and discovering ACG (Anime, Comics, Games) artwork. The project integrates with Pixiv through a Cloudflare Worker proxy, **Turso (优先)** 和 Supabase (备用) for data persistence, and provides features like daily rankings, recommendations, and article content.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking without emit
npm run check

# Linting
npm run lint
```

### Proxy Worker Commands

```bash
# Navigate to proxy worker directory
cd proxy-worker

# Install proxy worker dependencies
npm install

# Start proxy worker development server (http://localhost:8787)
npm run dev

# Deploy proxy worker to Cloudflare
npm run deploy
```

## Project Architecture

### Dual-Entry Structure

The codebase has a **dual architecture** combining Next.js App Router (modern) with legacy React Router components:

1. **Next.js App Router** (`/app`): Main entry point for production
   - Server-side rendering and API routes
   - Pages: home, rankings, recommendations, articles, artwork details
   - API routes: `/api/rankings`, `/api/recommendations`, `/api/articles`

2. **Legacy React Router** (`/src`): Contains reusable components and utilities
   - Components in `/src/components` (Button, Navigation, Footer, etc.)
   - Hooks in `/src/hooks` (useTheme, useInfiniteScroll)
   - Utilities and type definitions

**Important**: When adding new pages, use the Next.js App Router pattern in `/app`. The `/src` directory should only be used for shared components, utilities, and types.

### Data Layer Architecture

#### Turso 数据库 (主数据库)

项目优先使用 Turso 作为主数据库，Turso 是基于 libSQL 的边缘数据库。数据库操作函数位于 `/src/lib/turso.ts`。

**数据库连接配置**:
```typescript
import { getTursoClient, getRankings, getRecommendations, getArtworkById } from '@/lib/turso'
```

#### 数据库表结构

Key database tables (Turso 和 Supabase 表结构一致):

- **`pic`**: Main artwork table
  - Fields: `pid`, `title`, `author_id`, `author_name`, `image_url`, `tag`, `good`, `star`, `view`, `popularity`, etc.
  - Primary data source for all artwork displays

- **`ranking`**: Ranking data
  - Fields: `pid`, `rank`, `rank_type` (daily/weekly/monthly)
  - Links to `pic` table via `pid`

**所有数据库查询都使用 Turso 客户端** 从 `/src/lib/turso.ts`。

#### Supabase Integration (备用)

Supabase 配置保留在 `/src/lib/supabase.ts`，可作为备用数据源或用于其他功能。

#### Pixiv Image Proxy

Images from Pixiv require a proxy due to referrer restrictions. The project uses a **dual-proxy system**:

1. **Primary**: Custom Cloudflare Worker (`/proxy-worker`)
   - Deployed at `pixivproxy.acgotaku.com`
   - Handles Pixiv authentication via cookies
   - Provides `/proxy/{pid}?size={size}` endpoint
   - Development: `npm run dev` (in proxy-worker directory)
   - Deploy: `npm run deploy` (requires Wrangler CLI)

2. **Fallback**: Utility functions in `/src/lib/pixiv-proxy.ts`
   - `getProxyImageUrl(pid, size)`: Generates proxy URLs
   - Sizes: `thumb_mini`, `small`, `regular`, `original`

**When displaying images**: Always use the proxy URL from `getProxyImageUrl()` or the `image_url` field from the database (which may already be proxied).

### Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:

```typescript
import { getRankings } from '@/lib/turso'
import { Button } from '@/components/Button'
import { Artwork } from '@/types'
```

Available aliases:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/utils/*` → `./src/utils/*`
- `@/hooks/*` → `./src/hooks/*`
- `@/types/*` → `./src/types/*`

## API Routes Pattern

API routes follow Next.js App Router conventions in `/app/api`:

```typescript
// Example: /app/api/rankings/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'daily'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  // 使用 Turso 进行服务端查询
  const { artworks, total } = await getRankings(period, page, limit)

  return NextResponse.json({
    success: true,
    data: { rankings: artworks, pagination: {...}, period }
  })
}
```

**Key patterns**:
- 使用 `getRankings`, `getRecommendations`, `getArtworkById` 从 `@/lib/turso`
- Return consistent API response format: `{ success: boolean, data?: T, error?: string }`
- Handle pagination with `page` and `limit` parameters
- Transform database `pic` records to `Artwork` type (see `/src/types/index.ts`)

## Environment Variables

Required in `.env.local`:

```env
# Turso 数据库配置 (主数据库 - 必需)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token

# Supabase 配置 (备用数据库 - 可选)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Note**: `TURSO_DATABASE_URL` 和 `TURSO_AUTH_TOKEN` 是 API 路由的必需配置。

## Styling and UI

- **Framework**: Tailwind CSS (config in `tailwind.config.js`)
- **Animations**: Framer Motion for interactive elements
- **UI Utilities**:
  - `clsx` and `tailwind-merge` via `/src/lib/utils.ts`
  - Class variance authority for component variants

## Type System

All shared types are in `/src/types/index.ts`. Key types:

- `Artwork`: Main artwork interface with artist, stats, tags
- `Artist`: Artist/author information
- `Article`: Blog article structure
- `ApiResponse<T>`: Standard API response wrapper
- `Pagination`: Pagination metadata

**When adding new features**: Update types in this central location rather than defining inline types.

## Cloudflare Worker Proxy

The `/proxy-worker` directory contains a standalone Cloudflare Worker project:

**Purpose**: Bypass Pixiv's referrer restrictions by proxying image requests with proper authentication headers.

**Key files**:
- `index.ts`: Main worker entry point with routing
- `pixiv-proxy.ts`: Core proxy logic
- `wrangler.toml`: Cloudflare Worker configuration

**Deployment** (from `/proxy-worker`):
```bash
npm install
npm run dev      # Local development on :8787
npm run deploy   # Deploy to Cloudflare
```

**Required secrets** (set via Wrangler):
```bash
wrangler secret put PIXIV_COOKIE
```

## Data Transformation Pattern

Database records from Turso must be transformed to match frontend types:

```typescript
// Example from /src/lib/turso.ts
const artworks = pics.map(pic => ({
  id: parseInt(pic.pid),
  title: pic.title || `插画 ${pic.pid}`,
  artist: {
    id: parseInt(pic.author_id || '0'),
    name: pic.author_name || '未知作者',
    avatar: generateAvatarUrl()
  },
  imageUrl: pic.image_url || pic.wx_url || '',
  tags: pic.tag ? pic.tag.split(',').filter(Boolean) : [],
  stats: {
    views: pic.view || 0,
    likes: pic.good || 0,
    bookmarks: pic.star || 0
  }
}))
```

**Always handle null values** from the database and provide sensible defaults.

## Articles System

Articles are stored as Markdown files in `/articles` directory. Processing:

1. Read markdown files using `gray-matter` for frontmatter
2. Parse with `remark` and `remark-html`
3. Served via `/app/api/articles/route.ts`
4. Displayed at `/app/articles/[id]`

See `/src/lib/articles.ts` for the article processing pipeline.

## Build Configuration

- **TypeScript**: Ignores build errors (`ignoreBuildErrors: true` in `next.config.js`)
- **ESLint**: Runs during builds
- **Images**: Allows all remote patterns for flexibility with Pixiv proxies
- **Module Resolution**: Bundler mode with custom webpack aliases

## Common Patterns

### Fetching Data from APIs

```typescript
// Client-side fetching in components
const response = await fetch('/api/rankings?period=daily&page=1')
const { success, data } = await response.json()
```

### Using the Proxy

```typescript
import { getProxyImageUrl } from '@/lib/pixiv-proxy'

const imageUrl = getProxyImageUrl(pid, 'regular')  // Returns proxied URL
```

### Database Queries

```typescript
import { getTursoClient } from '@/lib/turso'

const client = getTursoClient()
const result = await client.execute({
  sql: `
    SELECT * FROM pic
    WHERE popularity >= 0.5
    ORDER BY popularity DESC
    LIMIT 20
  `,
  args: []
})
```

## Deployment

The project is configured for Vercel deployment:
- `vercel.json` handles API rewrites
- Next.js builds are optimized for Vercel's platform
- Environment variables must be configured in Vercel dashboard

### Deployment Requirements

**Vercel (Main Project)**:
```env
# Required environment variables in Vercel dashboard
# Turso 配置 (必需)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token

# Supabase 配置 (备用，可选)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Cloudflare Worker (Proxy)**:
```bash
# Set secrets in Cloudflare Worker
wrangler secret put PIXIV_COOKIE
```

## Search Functionality

The project includes a reverse image search feature:
- **Route**: `/search` page with search interface
- **Integration**: Uses third-party image search services
- **UI Components**: Search input, results display, image preview

## UI/UX Patterns

### Glass Morphism Design
The navigation bar uses modern glass morphism effects:
```css
backdrop-blur-xl bg-white/80 dark:bg-gray-900/80
```

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Animation System
Uses Framer Motion for:
- Page transitions
- Image hover effects
- Loading animations
- Scroll-triggered animations

## Performance Considerations

- **Image Optimization**: Lazy loading with intersection observer
- **Infinite Scroll**: Optimized with requestAnimationFrame
- **Caching Strategy**: API responses cached on client side
- **Bundle Size**: Code splitting for optimal loading

## Debugging Tips

### Common Issues
1. **Proxy not working**: Check Cloudflare Worker deployment and PIXIV_COOKIE
2. **Database connection**: 验证 Turso 凭据 (TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN)
3. **Build errors**: TypeScript issues are ignored in production builds
4. **Image loading**: Ensure proxy URLs are correctly formatted

### Development Tools
- React DevTools for component inspection
- Turso CLI for database monitoring (`turso db shell`)
- Supabase Dashboard for backup database monitoring
- Cloudflare Dashboard for worker logs
- Vercel Analytics for performance monitoring

# 其他
对话全部用中文
写完代码不要启动服务器