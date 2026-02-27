import { MetadataRoute } from 'next'

/**
 * 生成网站站点地图
 * @returns 站点地图配置
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ranking-pixiv.vercel.app'
  
  // 基础页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/ranking`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  // 动态生成作品页面
  try {
    // 这里可以根据实际情况获取热门作品ID列表
    // 由于API限制，这里只添加一些示例ID
    const popularArtworkIds = [
      '114514191', '114514192', '114514193', '114514194', '114514195',
      '114514196', '114514197', '114514198', '114514199', '114514200'
    ]

    const artworkPages: MetadataRoute.Sitemap = popularArtworkIds.map(id => ({
      url: `${baseUrl}/artwork/${id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...artworkPages]
  } catch (error) {
    console.error('生成站点地图时出错:', error)
    return staticPages
  }
}