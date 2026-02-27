import { Metadata } from 'next'

/**
 * 主页SEO元数据配置
 */
export const homeMetadata: Metadata = {
  title: 'Pixiv插画排行榜 - 发现最热门的二次元插画作品',
  description: '探索Pixiv平台最受欢迎的插画作品，包含每日、每周、每月排行榜，发现优秀的二次元艺术作品和插画师。实时更新，精选推荐。',
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
 * 推荐页面SEO元数据配置
 */
export const recommendationsMetadata: Metadata = {
  title: 'Pixiv插画推荐 - 精选高评分作品',
  description: '精选高评分作品，发现新的艺术风格和优秀插画师。',
  keywords: [
    'pixiv推荐', '个性化推荐', '精选插画', '优质作品', '艺术推荐',
    '插画发现', '新作品', '推荐算法', 'pixiv recommendations'
  ],
  openGraph: {
    title: 'Pixiv插画推荐 - 精选高评分作品',
    description: '精选高评分作品，发现新的艺术风格和优秀插画师。',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://acgotaku.com/recommendations',
    siteName: 'Pixiv插画排行榜',
    images: [
      {
        url: 'https://acgotaku.com/og-recommendations.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixiv插画推荐 - 个性化精选作品',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixiv插画推荐 - 个性化精选作品',
    description: '基于您的喜好为您推荐优质的Pixiv插画作品，发现新的艺术风格和优秀插画师。',
    images: ['https://acgotaku.com/og-recommendations.jpg'],
  },
}

/**
 * 文章鉴赏页面SEO元数据配置
 */
export const articlesMetadata: Metadata = {
  title: 'Pixiv插画鉴赏 - 艺术教程与评测文章',
  description: '阅读专业的插画鉴赏文章，包含绘画教程、作品评测、艺术家访谈等内容。提升您的艺术鉴赏能力，学习绘画技巧。',
  keywords: [
    'pixiv鉴赏', '插画教程', '绘画技巧', '艺术评测', '插画师访谈',
    '艺术鉴赏', '绘画学习', '插画分析', 'art tutorial', 'illustration guide'
  ],
  openGraph: {
    title: 'Pixiv插画鉴赏 - 艺术教程与评测文章',
    description: '阅读专业的插画鉴赏文章，包含绘画教程、作品评测、艺术家访谈等内容。',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://acgotaku.com/articles',
    siteName: 'Pixiv插画排行榜',
    images: [
      {
        url: 'https://acgotaku.com/og-articles.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixiv插画鉴赏 - 艺术教程与评测文章',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixiv插画鉴赏 - 艺术教程与评测文章',
    description: '阅读专业的插画鉴赏文章，包含绘画教程、作品评测、艺术家访谈等内容。',
    images: ['https://acgotaku.com/og-articles.jpg'],
  },
}

/**
 * 排行榜页面SEO元数据配置
 */
export const rankingsMetadata: Metadata = {
  title: 'Pixiv插画排行榜 - 每日/每周/每月热门作品',
  description: '查看Pixiv平台的插画排行榜，包含每日、每周、每月最受欢迎的二次元插画作品。实时更新，发现优秀的插画师和热门作品。',
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