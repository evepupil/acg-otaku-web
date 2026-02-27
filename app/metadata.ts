import { Metadata } from 'next'

/**
 * 主页SEO元数据配置
 */
export const homeMetadata: Metadata = {
  title: 'ACG萌图宅 - 精选ACG插画鉴赏平台',
  description: '精心策划的ACG插画鉴赏平台，每日精选优质作品，深度解读画师风格，围绕话题探索作品集。',
  keywords: [
    'pixiv', '插画', '排行榜', '二次元', '动漫', '艺术', '绘画', 
    '插画师', '原创', 'illustration', 'anime', 'manga', '热门作品'
  ],
  openGraph: {
    title: 'Pixiv插画排行榜 - 发现最热门的二次元插画作品',
    description: '探索Pixiv平台最受欢迎的插画作品，包含每日、每周、每月排行榜，发现优秀的二次元艺术作品和插画师。',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://acgotaku.com',
    siteName: 'Pixiv插画排行榜',
    images: [
      {
        url: 'https://acgotaku.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixiv插画排行榜 - 发现最热门的二次元插画作品',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixiv插画排行榜 - 发现最热门的二次元插画作品',
    description: '探索Pixiv平台最受欢迎的插画作品，包含每日、每周、每月排行榜。',
    images: ['https://acgotaku.com/og-image.jpg'],
  },
}

/**
 * 搜图页面SEO元数据配置
 */
export const searchMetadata: Metadata = {
  title: '以图搜图 - ACG萌图宅',
  description: '上传图片，通过AI技术找到相似的二次元作品和来源信息。支持动漫、插画、漫画等各类ACG图片搜索。',
  keywords: ['以图搜图', '反向图像搜索', 'ACG', '二次元', '动漫', '插画', 'SauceNAO'],
  openGraph: {
    title: '以图搜图 - ACG萌图宅',
    description: '上传图片，通过AI技术找到相似的二次元作品和来源信息',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://acgotaku.com/search',
    siteName: 'ACG萌图宅',
    images: [
      {
        url: 'https://acgotaku.com/og-search.jpg',
        width: 1200,
        height: 630,
        alt: '以图搜图 - ACG萌图宅',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '以图搜图 - ACG萌图宅',
    description: '上传图片，通过AI技术找到相似的二次元作品和来源信息。支持动漫、插画、漫画等各类ACG图片搜索。',
    images: ['https://acgotaku.com/og-search.jpg'],
  },
}

/**
 * 排行榜页面SEO元数据配置
 */
export const rankingsMetadata: Metadata = {
  title: '每日排行精选 - ACG萌图宅',
  description: '从Pixiv排行榜中精心挑选的优质ACG插画作品，每日更新。',
  keywords: [
    'pixiv排行榜', '每日排行', '每周排行', '每月排行', '热门插画', 
    '二次元排行榜', '插画排名', '人气作品', 'pixiv ranking'
  ],
  openGraph: {
    title: 'Pixiv插画排行榜 - 每日/每周/每月热门作品',
    description: '查看Pixiv平台的插画排行榜，包含每日、每周、每月最受欢迎的二次元插画作品。',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://acgotaku.com/rankings',
    siteName: 'Pixiv插画排行榜',
    images: [
      {
        url: 'https://acgotaku.com/og-rankings.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixiv插画排行榜 - 每日/每周/每月热门作品',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixiv插画排行榜 - 每日/每周/每月热门作品',
    description: '查看Pixiv平台的插画排行榜，包含每日、每周、每月最受欢迎的二次元插画作品。',
    images: ['https://acgotaku.com/og-rankings.jpg'],
  },
}

/**
 * 文章页面SEO元数据配置
 */
export const articlesMetadata: Metadata = {
  title: '文章 - ACG萌图宅',
  description: '深度解读ACG艺术，画师风格分析，创作技巧分享，二次元文化探讨。',
  keywords: ['ACG文章', '插画鉴赏', '画师分析', '二次元文化', '创作技巧'],
  openGraph: {
    title: '文章 - ACG萌图宅',
    description: '深度解读ACG艺术，画师风格分析，创作技巧分享。',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://acgotaku.com/articles',
    siteName: 'ACG萌图宅',
  },
}