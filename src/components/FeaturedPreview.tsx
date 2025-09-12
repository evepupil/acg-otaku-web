/**
 * 精选预览组件
 * 展示热门插画作品的预览卡片
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Eye, Star, ArrowRight, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from './Button'
import { CardSkeleton } from './Loading'
import { cn, formatNumber, formatDate } from '../lib/utils'
import type { Artwork } from '../types'

/**
 * 精选预览组件属性接口
 */
interface FeaturedPreviewProps {
  /** 自定义类名 */
  className?: string
  /** 是否显示加载状态 */
  loading?: boolean
  /** 精选作品数据 */
  artworks?: Artwork[]
  /** 标题 */
  title?: string
  /** 副标题 */
  subtitle?: string
}

// 注意：实际数据从API获取

/**
 * 作品卡片组件
 */
const ArtworkCard = ({ artwork, index }: { artwork: Artwork, index: number }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const router = useRouter()

  /**
   * 处理卡片点击事件，跳转到作品详情页面
   */
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
      className="glass-card overflow-hidden group cursor-pointer"
    >
      {/* 作品图片 */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <motion.img
          src={artwork.imageUrl}
          alt={artwork.title}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            'group-hover:scale-110',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* 加载占位符 */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}
        
        {/* 悬浮操作层 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                setIsLiked(!isLiked)
              }}
              className={cn(
                'w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors',
                isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              )}
            >
              <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Star className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
        
        {/* 统计信息 */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <div className="glass px-2 py-1 text-xs text-white flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{formatNumber(artwork.stats.views)}</span>
          </div>
        </div>
      </div>
      
      {/* 作品信息 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-pink-600 transition-colors">
          {artwork.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {artwork.description}
        </p>
        
        {/* 画师信息 */}
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={artwork.artist.avatar}
            alt={artwork.artist.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {artwork.artist.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatNumber(artwork.artist.followerCount || 0)} 关注者
            </p>
          </div>
        </div>
        
        {/* 统计和时间 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>{formatNumber(artwork.stats.likes)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>{formatNumber(artwork.stats.bookmarks)}</span>
            </span>
          </div>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(artwork.createdAt)}</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * 主精选预览组件
 */
export default function FeaturedPreview({
  className,
  loading = false,
  artworks = [],
  title = '精选作品',
  subtitle = '发现最受欢迎的插画作品'
}: FeaturedPreviewProps) {
  const [viewMode] = useState<'grid' | 'list'>('grid')
  
  if (loading) {
    return (
      <section className={cn('py-16', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
          </div>
          <CardSkeleton count={6} />
        </div>
      </section>
    )
  }

  return (
    <section className={cn('py-16 bg-white/50', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
        
        {/* 作品网格 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'grid gap-6 mb-12',
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 md:grid-cols-2 gap-8'
            )}
          >
            {artworks.slice(0, 8).map((artwork, index) => (
              <ArtworkCard key={artwork.id} artwork={artwork} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
        
        {/* 查看更多按钮 */}
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
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="px-8 py-3"
          >
            查看更多作品
          </Button>
        </motion.div>
      </div>
    </section>
  )
}