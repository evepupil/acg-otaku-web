'use client'

import CuratedArtworkCard from '@/components/CuratedArtworkCard'
import type { Artwork } from '@/types'

interface ArtworkGridProps {
  artworks: (Artwork & { editorComment?: string })[]
  showComment?: boolean
  columns?: 2 | 3 | 4
}

export default function ArtworkGrid({ artworks, showComment = true, columns = 4 }: ArtworkGridProps) {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns]

  if (artworks.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">暂无作品</p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {artworks.map((artwork) => (
        <CuratedArtworkCard key={artwork.id} artwork={artwork} showComment={showComment} />
      ))}
    </div>
  )
}
