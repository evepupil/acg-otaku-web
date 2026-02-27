'use client'

import { useState, useEffect } from 'react'
import { Palette, Loader2 } from 'lucide-react'
import { getImageUrl } from '@/lib/pixiv-proxy'
import type { ArtistFeature } from '@/types'

export default function ArtistsPage() {
  const [features, setFeatures] = useState<ArtistFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/artist-features?page=${page}&limit=12`)
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
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            <Palette className="inline-block w-8 h-8 mr-2 text-purple-600" />
            画师鉴赏
          </h1>
          <p className="text-gray-500 mt-2">探索优秀画师的艺术世界</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : features.length === 0 ? (
          <div className="text-center py-20">
            <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">暂无画师专题</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(feature => (
                <a key={feature.id} href={`/artists/${feature.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* 封面 */}
                  <div className="aspect-[16/9] overflow-hidden relative">
                    {feature.coverPid ? (
                      <img src={getImageUrl(feature.coverPid, 'small')} alt={feature.featureTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center">
                        <Palette className="w-12 h-12 text-purple-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="text-white text-sm font-medium">{feature.artistName}</p>
                    </div>
                  </div>
                  {/* 信息 */}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-lg">
                      {feature.featureTitle}
                    </h3>
                    {feature.artistBio && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{feature.artistBio}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        {feature.artworks?.length || 0} 件作品
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-purple-50'}`}>
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
