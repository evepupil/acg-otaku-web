/**
 * 插画详情页组件 - 展示插画的详细信息、作者信息、相关作品等
 * 支持图片缩放、收藏、分享等功能
 */

import type { Metadata } from 'next'
import ArtworkDetailClient from './client'

/**
 * 获取插画数据的服务器端函数
 * @param id 插画ID
 * @returns 插画数据或null
 */
async function getArtworkData(id: string) {
  try {
    const response = await fetch(`https://acgotaku.com/api/artwork/${id}`, {
      cache: 'no-store' // 确保获取最新数据
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Failed to fetch artwork data:', error)
    return null
  }
}

/**
 * 生成动态metadata
 * @param params 路由参数
 * @returns Metadata对象
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const artwork = await getArtworkData(resolvedParams.id)

  if (!artwork) {
    return {
      title: '插画未找到',
      description: '您访问的插画可能不存在或已被删除。',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${artwork.title} - ${artwork.artist || '未知作者'}`
  const description = `欣赏由 ${artwork.artist || '未知作者'} 创作的精美插画《${artwork.title}》。${artwork.tags ? `标签：${artwork.tags.join(', ')}。` : ''}在ACG萌图宅发现更多优质二次元艺术作品。`
  const imageUrl = artwork.imageUrl || '/og-image.jpg'
  const canonicalUrl = `https://acgotaku.com/artwork/${artwork.pid || resolvedParams.id}`

  return {
    title,
    description,
    keywords: artwork.tags ? [...artwork.tags, 'ACG', '萌图', '二次元', '插画', 'Pixiv'] : ['ACG', '萌图', '二次元', '插画', 'Pixiv'],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: artwork.title,
        },
      ],
      publishedTime: artwork.uploadTime || new Date().toISOString(),
      authors: [artwork.artist || '未知作者'],
      tags: artwork.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}



/**
 * 插画详情页服务器组件
 * @param params 路由参数
 * @returns JSX元素
 */
export default function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ArtworkDetailClient params={params} />
}