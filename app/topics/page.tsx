'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Hash, Loader2 } from 'lucide-react'
import { getImageUrl } from '@/lib/pixiv-proxy'
import type { TopicFeature } from '@/types'

export default function TopicsPage() {
  const [features, setFeatures] = useState<TopicFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/topic-features?page=${page}&limit=12`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFeatures(data.data.features)
          setTotalPages(data.data.pagination.totalPages)
        }
      })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            <Hash className="inline-block w-8 h-8 mr-2 text-orange-600" />
            话题鉴赏
          </h1>
          <p className="text-gray-500 mt-2">围绕主题探索精选作品</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : features.length === 0 ? (
          <div className="text-center py-20">
            <Hash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">暂无话题专题</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(feature => (
                <Link key={feature.id} href={`/topics/${feature.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    {feature.coverPid ? (
                      <img src={getImageUrl(feature.coverPid, 'small')} alt={feature.topicName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-200 flex items-center justify-center">
                        <Hash className="w-12 h-12 text-orange-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors text-lg">
                      {feature.topicName}
                    </h3>
                    {feature.topicDescription && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{feature.topicDescription}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {feature.tags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                        {feature.artworks?.length || 0} 件作品
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
