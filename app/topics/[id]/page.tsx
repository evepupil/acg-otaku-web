'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import FeatureArticle from '@/components/FeatureArticle'
import ArtworkGrid from '@/components/ArtworkGrid'
import type { TopicFeature } from '@/types'

export default function TopicDetailPage() {
  const { id } = useParams() as { id: string }
  const [feature, setFeature] = useState<TopicFeature | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/topic-features/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setFeature(data.data)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!feature) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">未找到该话题专题</p>
          <Link href="/topics" className="text-orange-600 hover:underline mt-2 inline-block">返回列表</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <Link href="/topics" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回话题鉴赏
        </Link>

        {/* 话题标题 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{feature.topicName}</h1>
        {feature.topicDescription && (
          <p className="text-lg text-gray-600 mb-4">{feature.topicDescription}</p>
        )}

        {/* 标签 */}
        {feature.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {feature.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 text-sm text-orange-600 bg-orange-50 rounded-full border border-orange-100">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 鉴赏文章 */}
        {feature.featureContent && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <FeatureArticle content={feature.featureContent} />
          </div>
        )}

        {/* 相关作品 */}
        {feature.artworks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">相关作品</h2>
            <ArtworkGrid artworks={feature.artworks} columns={3} />
          </div>
        )}
      </div>
    </div>
  )
}
