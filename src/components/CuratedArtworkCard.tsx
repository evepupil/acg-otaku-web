'use client'

import { ExternalLink, MessageSquare } from 'lucide-react'
import { getImageUrl } from '@/lib/pixiv-proxy'
import type { Artwork } from '@/types'

interface CuratedArtworkCardProps {
  artwork: Artwork & { editorComment?: string }
  showComment?: boolean
}

export default function CuratedArtworkCard({ artwork, showComment = true }: CuratedArtworkCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* 图片 */}
      <a href={`/artwork/${artwork.id}`} className="block relative aspect-[3/4] overflow-hidden">
        <img
          src={getImageUrl(String(artwork.id), 'small', artwork.imagePath)}
          alt={artwork.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>

      {/* 信息 */}
      <div className="p-4 space-y-2">
        <a href={`/artwork/${artwork.id}`} className="block">
          <h3 className="font-medium text-gray-900 truncate group-hover:text-green-600 transition-colors">
            {artwork.title}
          </h3>
        </a>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{artwork.artist?.name}</span>
          <a
            href={`https://www.pixiv.net/artworks/${artwork.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
          >
            <ExternalLink className="w-3 h-3" />
            Pixiv
          </a>
        </div>

        {/* 编辑评语 */}
        {showComment && artwork.editorComment && (
          <div className="flex items-start gap-2 p-2.5 bg-green-50 rounded-xl">
            <MessageSquare className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-700 leading-relaxed">{artwork.editorComment}</p>
          </div>
        )}

        {/* 标签 */}
        {artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artwork.tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 数据 */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{artwork.stats?.views?.toLocaleString()} 浏览</span>
          <span>{artwork.stats?.bookmarks?.toLocaleString()} 收藏</span>
        </div>
      </div>
    </div>
  )
}
