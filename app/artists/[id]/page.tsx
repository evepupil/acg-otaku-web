'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import ArtistProfileCard from '@/components/ArtistProfileCard'
import FeatureArticle from '@/components/FeatureArticle'
import ArtworkGrid from '@/components/ArtworkGrid'
import type { ArtistFeature } from '@/types'

export default function ArtistDetailPage() {
  const { id } = useParams() as { id: string }
  const [feature, setFeature] = useState<ArtistFeature | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/artist-features/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setFeature(data.data)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!feature) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">未找到该画师专题</p>
          <Link href="/artists" className="text-purple-600 hover:underline mt-2 inline-block">返回列表</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <Link href="/artists" className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回画师鉴赏
        </Link>

        {/* 画师信息 */}
        <ArtistProfileCard
          artistName={feature.artistName}
          artistBio={feature.artistBio}
          artistAvatar={feature.artistAvatar}
          pixivUrl={feature.pixivUrl}
          twitterUrl={feature.twitterUrl}
        />

        {/* 专题标题 */}
        <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-6">{feature.featureTitle}</h1>

        {/* 鉴赏文章 */}
        {feature.featureContent && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <FeatureArticle content={feature.featureContent} />
          </div>
        )}

        {/* 代表作品 */}
        {feature.artworks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">代表作品</h2>
            <ArtworkGrid artworks={feature.artworks} columns={3} />
          </div>
        )}
      </div>
    </div>
  )
}
