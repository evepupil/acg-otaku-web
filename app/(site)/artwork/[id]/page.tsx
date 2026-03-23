import type { Metadata } from 'next'

import ArtworkDetailClient, { type ArtworkDetailData } from './client'
import { getArtworkById } from '@/lib/turso'

export const dynamic = 'force-dynamic'

async function getArtworkData(id: string): Promise<ArtworkDetailData | null> {
  const parsedId = Number(id)
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null
  }

  try {
    const artworkData = await getArtworkById(parsedId)
    if (!artworkData) {
      return null
    }

    return {
      id: artworkData.id,
      pid: artworkData.pid || artworkData.id.toString(),
      title: artworkData.title,
      imageUrl: artworkData.imageUrl,
      imagePath: artworkData.imagePath || '',
      artist: artworkData.artist || {
        id: 0,
        name: '未知作者',
      },
      tags: artworkData.tags || [],
      createdAt: artworkData.uploadTime || artworkData.createdAt || new Date().toISOString(),
      stats: {
        views: artworkData.stats?.views || 0,
        likes: artworkData.stats?.likes || 0,
        bookmarks: artworkData.stats?.bookmarks || 0,
      },
      dimensions: null,
      popularity: artworkData.popularity || 0,
      editorComment: artworkData.editorComment || null,
      curationType: artworkData.curationType || null,
    }
  } catch (error) {
    console.error('Failed to load artwork data:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
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

  const artistName =
    typeof artwork.artist === 'object' ? artwork.artist.name : artwork.artist || '未知作者'
  const title = `${artwork.title} - ${artistName}`
  const description = `欣赏 ${artistName} 创作的插画《${artwork.title}》。${
    artwork.tags.length ? `标签：${artwork.tags.join('、')}。` : ''
  }`
  const imageUrl = artwork.imageUrl || '/og-image.jpg'
  const canonicalUrl = `https://acgotaku.com/artwork/${artwork.pid || resolvedParams.id}`

  return {
    title,
    description,
    keywords: [...artwork.tags, 'ACG', '萌图', '二次元', '插画', 'Pixiv'],
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
      publishedTime: artwork.createdAt,
      authors: [artistName],
      tags: artwork.tags,
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

export default async function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const artwork = await getArtworkData(resolvedParams.id)

  return <ArtworkDetailClient artwork={artwork} />
}
