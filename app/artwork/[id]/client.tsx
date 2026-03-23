'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  RotateCw,
  Tag,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import ShareButtons from '@/components/ShareButtons'
import WechatQRCode from '@/components/WechatQRCode'
import { getImageUrl } from '@/lib/pixiv-proxy'

export type ArtworkDetailData = {
  id: number | string
  pid: string
  title: string
  imageUrl: string
  imagePath: string
  artist?: {
    id: number
    name: string
  } | string
  tags: string[]
  createdAt: string
  stats: {
    views: number
    likes: number
    bookmarks: number
  }
  dimensions: { width: number; height: number } | null
  popularity: number
  editorComment?: string | null
  curationType?: string | null
}

function ImageViewer({
  imageUrl,
  title,
  isOpen,
  onClose,
}: {
  imageUrl: string
  title: string
  isOpen: boolean
  onClose: () => void
}) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const reset = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90" onClick={onClose}>
      <div className="absolute right-4 top-4 z-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setScale((prev) => Math.min(prev + 0.2, 3))
          }}
          className="rounded-xl bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setScale((prev) => Math.max(prev - 0.2, 0.5))
          }}
          className="rounded-xl bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setRotation((prev) => prev + 90)
          }}
          className="rounded-xl bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
        >
          <RotateCw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            reset()
          }}
          className="rounded-xl bg-white/10 px-4 py-3 text-sm text-white backdrop-blur transition hover:bg-white/20"
        >
          重置
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex h-full items-center justify-center p-6">
        <img
          src={imageUrl}
          alt={title}
          className="max-h-full max-w-full cursor-move select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center',
          }}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => {
            setIsDragging(true)
            setDragStart({ x: event.clientX - position.x, y: event.clientY - position.y })
          }}
          onMouseMove={(event) => {
            if (!isDragging) return
            setPosition({
              x: event.clientX - dragStart.x,
              y: event.clientY - dragStart.y,
            })
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        />
      </div>
    </div>
  )
}

export default function ArtworkDetailClient({
  artwork,
}: {
  artwork: ArtworkDetailData | null
}) {
  const router = useRouter()
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!artwork) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">作品不存在</h1>
          <p className="mt-3 text-slate-600">你访问的作品可能不存在，或者已经被移除。</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            返回上一页
          </button>
        </div>
      </div>
    )
  }

  const artistName =
    typeof artwork.artist === 'object' ? artwork.artist.name : artwork.artist || '未知作者'
  const originalImageUrl = artwork.pid
    ? getImageUrl(artwork.pid, 'original', artwork.imagePath)
    : artwork.imageUrl

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_28%),linear-gradient(180deg,#f7fdf9_0%,#ffffff_38%,#f5fbf6_100%)]">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/78 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>

          <span className="text-sm text-slate-500">作品 ID: {artwork.pid}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
              <div className="relative flex aspect-square items-center justify-center bg-slate-100">
                <img
                  src={originalImageUrl}
                  alt={artwork.title}
                  className={`h-full w-full cursor-zoom-in object-contain transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onClick={() => setShowImageViewer(true)}
                />

                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{artwork.title}</h1>

              <div className="mt-5 space-y-4">
                <div>
                  <h2 className="text-sm font-medium text-slate-500">作者</h2>
                  <p className="mt-1 text-lg text-slate-900">{artistName}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-slate-500">创建时间</h2>
                  <p className="mt-1 text-slate-700">
                    {new Date(artwork.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>

                <div>
                  <h2 className="mb-3 text-sm font-medium text-slate-500">统计信息</h2>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-2xl bg-slate-50 px-3 py-4">
                      <Eye className="mx-auto mb-2 h-4 w-4 text-slate-400" />
                      <p className="text-lg font-semibold text-slate-900">
                        {artwork.stats.views.toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">浏览</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-4">
                      <span className="mb-2 block text-sm text-rose-500">❤</span>
                      <p className="text-lg font-semibold text-slate-900">
                        {artwork.stats.likes.toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">点赞</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-4">
                      <span className="mb-2 block text-sm text-amber-500">★</span>
                      <p className="text-lg font-semibold text-slate-900">
                        {artwork.stats.bookmarks.toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">收藏</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {artwork.tags.length > 0 && (
              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Tag className="h-5 w-5" />
                  标签
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {artwork.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {artwork.editorComment && (
              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">编辑评语</h2>
                <p className="mt-4 border-l-4 border-emerald-400 pl-4 text-sm leading-7 text-slate-700">
                  {artwork.editorComment}
                </p>
              </section>
            )}

            <section className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">分享与链接</h2>

              <a
                href={`https://www.pixiv.net/artworks/${artwork.pid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
              >
                <ExternalLink className="h-4 w-4" />
                在 Pixiv 查看原作
              </a>

              <ShareButtons title={artwork.title} />
            </section>

            <WechatQRCode />
          </div>
        </div>
      </div>

      <ImageViewer
        imageUrl={originalImageUrl}
        title={artwork.title}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
      />
    </div>
  )
}
