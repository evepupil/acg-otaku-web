import type { Metadata } from 'next'

export const homeMetadata: Metadata = {
  title: 'ACG萌图宅',
  description: '收录每日精选、排行整理、画师专题、话题归档与搜图工具的 ACG 插画内容站。',
  keywords: ['ACG', '插画', 'Pixiv', '每日精选', '排行', '画师专题', '话题专题'],
  openGraph: {
    title: 'ACG萌图宅',
    description: '收录每日精选、排行整理、画师专题、话题归档与搜图工具的 ACG 插画内容站。',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://acgotaku.com',
    siteName: 'ACG萌图宅',
    images: [
      {
        url: 'https://acgotaku.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ACG萌图宅首页',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACG萌图宅',
    description: '收录每日精选、排行整理、画师专题、话题归档与搜图工具的 ACG 插画内容站。',
    images: ['https://acgotaku.com/og-image.jpg'],
  },
}

export const searchMetadata: Metadata = {
  title: '搜图 - ACG萌图宅',
  description: '上传图片后查找相近作品与来源信息。',
  keywords: ['搜图', '以图搜图', '反向图片搜索', 'ACG', '插画'],
  openGraph: {
    title: '搜图 - ACG萌图宅',
    description: '上传图片后查找相近作品与来源信息。',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://acgotaku.com/search',
    siteName: 'ACG萌图宅',
    images: [
      {
        url: 'https://acgotaku.com/og-search.jpg',
        width: 1200,
        height: 630,
        alt: 'ACG萌图宅搜图页面',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '搜图 - ACG萌图宅',
    description: '上传图片后查找相近作品与来源信息。',
    images: ['https://acgotaku.com/og-search.jpg'],
  },
}

export const rankingsMetadata: Metadata = {
  title: '排行精选 - ACG萌图宅',
  description: '按日期查看已经整理发布的排行精选作品。',
  keywords: ['排行精选', '每日排行', 'Pixiv', '插画精选', 'ACG'],
  openGraph: {
    title: '排行精选 - ACG萌图宅',
    description: '按日期查看已经整理发布的排行精选作品。',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://acgotaku.com/rankings',
    siteName: 'ACG萌图宅',
    images: [
      {
        url: 'https://acgotaku.com/og-rankings.jpg',
        width: 1200,
        height: 630,
        alt: 'ACG萌图宅排行精选页面',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '排行精选 - ACG萌图宅',
    description: '按日期查看已经整理发布的排行精选作品。',
    images: ['https://acgotaku.com/og-rankings.jpg'],
  },
}

export const articlesMetadata: Metadata = {
  title: '文章已下线 - ACG萌图宅',
  description: '文章内容已下线，当前站点以精选作品、画师专题、话题专题和搜图工具为主。',
  robots: {
    index: false,
    follow: false,
  },
}
