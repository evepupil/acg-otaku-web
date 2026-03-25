/**
 * 精选预览组件
 * 展示热门插画作品的预览卡片
 */

'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock, Eye, Heart, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

import Button from './Button'
import { CardSkeleton } from './Loading'
import { cn, formatDate, formatNumber } from '../lib/utils'
import { getImageUrl } from '../lib/pixiv-proxy'
import type { Artwork } from '../types'

interface FeaturedPreviewProps {
  className?: string
  loading?: boolean
  artworks?: Artwork[]
  title?: string
  subtitle?: string
}

function getProxyImageUrl(src: string) {
  if (src.startsWith('/')) {
    return src
  }

  return `/api/image-proxy?src=${encodeURIComponent(src)}`
}

const ArtworkCard = ({ artwork, index }: { artwork: Artwork; index: number }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/artwork/${artwork.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={handleCardClick}
      className="glass-card group cursor-pointer overflow-hidden"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={getImageUrl(artwork.id.toString(), 'small', artwork.imagePath)}
          alt={artwork.title}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
          className={cn(
            'h-full w-full object-cover transition-all duration-500',
            'group-hover:scale-110',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(event) => {
                event.stopPropagation()
                setIsLiked(!isLiked)
              }}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-colors',
                isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              )}
            >
              <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            >
              <Star className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        <div className="absolute right-3 top-3 flex space-x-2">
          <div className="glass flex items-center space-x-1 px-2 py-1 text-xs text-white">
            <Eye className="h-3 w-3" />
            <span>{formatNumber(artwork.stats.views)}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-2 line-clamp-1 font-semibold text-gray-800 transition-colors group-hover:text-pink-600">
          {artwork.title}
        </h3>

        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{artwork.description}</p>

        <div className="mb-3 flex items-center space-x-3">
          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
            <Image
              src={getProxyImageUrl(artwork.artist.avatar || '/wechat-qrcode-placeholder.svg')}
              alt={artwork.artist.name}
              fill
              unoptimized
              sizes="32px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-800">{artwork.artist.name}</p>
            <p className="text-xs text-gray-500">
              {formatNumber(artwork.artist.followerCount || 0)} 关注者
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{formatNumber(artwork.stats.likes)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>{formatNumber(artwork.stats.bookmarks)}</span>
            </span>
          </div>
          <span className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(artwork.createdAt)}</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function FeaturedPreview({
  className,
  loading = false,
  artworks = [],
  title = '精选作品',
  subtitle = '发现最受欢迎的插画作品',
}: FeaturedPreviewProps) {
  const [viewMode] = useState<'grid' | 'list'>('grid')

  if (loading) {
    return (
      <section className={cn('py-16', className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
            <div className="mx-auto h-4 w-64 animate-pulse rounded bg-gray-200" />
          </div>
          <CardSkeleton count={6} />
        </div>
      </section>
    )
  }

  return (
    <section className={cn('bg-white/50 py-16', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">{subtitle}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'mb-12 grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 gap-8 md:grid-cols-2'
            )}
          >
            {artworks.slice(0, 8).map((artwork, index) => (
              <ArtworkCard key={artwork.id} artwork={artwork} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <Button
            size="lg"
            variant="outline"
            rightIcon={<ArrowRight className="h-5 w-5" />}
            className="px-8 py-3"
          >
            查看更多作品
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
