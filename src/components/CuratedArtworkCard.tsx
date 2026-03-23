import Link from 'next/link'
import { ExternalLink, MessageSquare } from 'lucide-react'

import { getImageUrl } from '@/lib/pixiv-proxy'
import type { Artwork } from '@/types'

interface CuratedArtworkCardProps {
  artwork: Artwork & { editorComment?: string }
  showComment?: boolean
}

export default function CuratedArtworkCard({
  artwork,
  showComment = true,
}: CuratedArtworkCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <Link href={`/artwork/${artwork.id}`} className="block aspect-[3/4] overflow-hidden">
        <img
          src={getImageUrl(String(artwork.id), 'small', artwork.imagePath)}
          alt={artwork.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/artwork/${artwork.id}`} className="block">
              <h3 className="truncate text-base font-semibold text-slate-900 transition group-hover:text-emerald-700">
                {artwork.title}
              </h3>
            </Link>
            <p className="mt-1 truncate text-sm text-slate-500">{artwork.artist?.name}</p>
          </div>

          <a
            href={`https://www.pixiv.net/artworks/${artwork.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 transition hover:text-sky-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Pixiv
          </a>
        </div>

        {showComment && artwork.editorComment && (
          <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 px-3 py-2.5">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
            <p className="text-xs leading-6 text-emerald-800">{artwork.editorComment}</p>
          </div>
        )}

        {artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {artwork.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{artwork.stats?.views?.toLocaleString()} 浏览</span>
          <span>{artwork.stats?.bookmarks?.toLocaleString()} 收藏</span>
        </div>
      </div>
    </article>
  )
}
