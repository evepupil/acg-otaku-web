/**
 * 插画详情页组件 - 展示插画的详细信息、作者信息、相关作品等
 * 支持图片缩放、收藏、分享等功能
 */

'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Eye, Download, Share2, Tag, // Calendar, User,
  ArrowLeft, ZoomIn, ZoomOut, RotateCw, X, // ChevronLeft, 
  // ChevronRight, 
  Bookmark // MessageCircle, ThumbsUp
} from 'lucide-react'
import Button from '@/components/Button'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation'
import type { Artwork } from '@/types'
// import type { Artist } from '@/types' // 暂时未使用

/**
 * 图片查看器组件
 */
function ImageViewer({ 
  imageUrl, 
  title, 
  isOpen, 
  onClose 
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

  /**
   * 重置图片状态
   */
  const resetImage = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  /**
   * 处理鼠标拖拽
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isOpen) {
      resetImage()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 控制栏 */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="glass-card p-2 rounded-lg">
          <h3 className="text-white font-medium">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="glass-card p-1 rounded-lg flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setScale(Math.max(0.5, scale - 0.25))
              }}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-white text-sm px-2">{Math.round(scale * 100)}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setScale(Math.min(3, scale + 0.25))
              }}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setRotation(rotation + 90)
              }}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                resetImage()
              }}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            >
              重置
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="glass-card p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 图片容器 */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          src={imageUrl}
          alt={title}
          className="max-w-none max-h-none select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          drag={false}
        />
      </div>
    </motion.div>
  )
}

/**
 * 相关作品组件
 */
function RelatedArtworks({ artistId, currentArtworkId }: { artistId: number; currentArtworkId: number }) {
  const [relatedArtworks, setRelatedArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟获取相关作品数据
    const fetchRelatedArtworks = async () => {
      try {
        // 这里应该调用实际的API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 模拟数据
        const mockArtworks: Artwork[] = Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          title: `相关作品 ${i + 1}`,
          description: `相关作品描述 ${i + 1}`,
          imageUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20artwork%20${i + 1}&image_size=square_hd`,
          thumbnailUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20artwork%20${i + 1}&image_size=square`,
          artist: {
            id: artistId,
            name: '相关画师',
            avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar&image_size=square',
            followerCount: 1000,
            artworkCount: 50
          },
          stats: {
            views: Math.floor(Math.random() * 10000),
            likes: Math.floor(Math.random() * 1000),
            bookmarks: Math.floor(Math.random() * 500)
          },
          createdAt: new Date().toISOString(),
          tags: ['相关', '推荐']
        }))
        
        setRelatedArtworks(mockArtworks)
      } catch (error) {
        console.error('获取相关作品失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedArtworks()
  }, [artistId, currentArtworkId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loading variant="spinner" size="md" text="加载相关作品..." />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {relatedArtworks.map((artwork) => (
        <motion.div
          key={artwork.id}
          whileHover={{ scale: 1.05 }}
          className="glass-card rounded-lg overflow-hidden cursor-pointer group"
        >
          <div className="aspect-square relative overflow-hidden">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                  <Eye className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <h4 className="font-medium text-gray-800 text-sm line-clamp-1 mb-1">
              {artwork.title}
            </h4>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Eye className="w-3 h-3" />
                <span>{artwork.stats.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{artwork.stats.likes.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * 插画详情页组件
 */
export default function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  /**
   * 获取插画详情数据
   */
  const fetchArtworkDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 这里应该调用实际的API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟数据
      const mockArtwork: Artwork = {
        id: parseInt(resolvedParams.id),
        title: '美丽的樱花季节',
        description: '这是一幅描绘春天樱花盛开的美丽插画，充满了温暖和希望的色彩。',
        imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20cherry%20blossom%20season%20anime%20illustration&image_size=landscape_16_9',
        thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20cherry%20blossom%20season%20anime%20illustration&image_size=square',
        artist: {
          id: 1,
          name: '春日画师',
          avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20artist%20avatar%20profile&image_size=square',
          bio: '专注于自然风景和季节主题的插画创作',
          followerCount: 15420,
          artworkCount: 89
        },
        tags: ['樱花', '春天', '自然', '风景', '温暖'],
        createdAt: '2024-03-15T10:30:00Z',
        stats: {
          views: 25680,
          likes: 3420,
          bookmarks: 1250
        },
        dimensions: { width: 1920, height: 1080 },
        fileSize: 2500000,
        software: 'Photoshop, SAI'
      }
      
      setArtwork(mockArtwork)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取作品详情失败')
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  /**
   * 处理点赞
   */
  const handleLike = async () => {
    setLiked(!liked)
    // 这里应该调用API更新点赞状态
  }

  /**
   * 处理收藏
   */
  const handleBookmark = async () => {
    setBookmarked(!bookmarked)
    // 这里应该调用API更新收藏状态
  }

  /**
   * 处理分享
   */
  const handleShare = async () => {
    if (navigator.share && artwork) {
      try {
        await navigator.share({
          title: artwork.title,
          text: `来看看这个精美的插画作品：${artwork.title}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('分享取消或失败', error)
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
      // 这里可以显示一个提示
    }
  }

  /**
   * 处理下载
   */
  const handleDownload = async () => {
    if (artwork) {
      try {
        const response = await fetch(artwork.imageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${artwork.title}.jpg`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('下载失败:', error)
      }
    }
  }

  useEffect(() => {
    fetchArtworkDetail()
  }, [resolvedParams.id, fetchArtworkDetail])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-20">
        <div className="flex justify-center items-center h-96">
          <Loading variant="spinner" size="lg" text="加载作品详情..." />
        </div>
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="glass-card p-8 rounded-xl max-w-md mx-auto">
              <div className="text-red-500 mb-4">
                <Eye className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h3>
              <p className="text-gray-600 mb-4">{error || '作品不存在'}</p>
              <div className="flex space-x-3 justify-center">
                <Button onClick={() => router.back()} variant="outline">
                  返回
                </Button>
                <Button onClick={fetchArtworkDetail} variant="primary">
                  重试
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            onClick={() => router.back()}
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            返回
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2">
            {/* 作品图片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl overflow-hidden mb-6"
            >
              <div className="relative group cursor-pointer" onClick={() => setShowImageViewer(true)}>
                {!imageLoaded && (
                  <div className="aspect-[4/5] bg-gray-200 animate-pulse flex items-center justify-center">
                    <Eye className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className={`w-full h-auto ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
                
                {/* 悬浮提示 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="glass-card p-3 rounded-lg">
                      <ZoomIn className="w-6 h-6 text-white" />
                      <p className="text-white text-sm mt-1">点击查看大图</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 作品信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-xl p-6 mb-6"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                {artwork.title}
              </h1>
              
              {artwork.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {artwork.description}
                </p>
              )}
              
              {/* 作品标签 */}
              {artwork.tags && artwork.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {artwork.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm hover:bg-purple-200 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* 作品统计 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{artwork.stats.views.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">浏览量</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{artwork.stats.likes.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">点赞数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {artwork.dimensions ? `${artwork.dimensions.width}×${artwork.dimensions.height}` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">尺寸</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{artwork.fileSize || 'N/A'}</div>
                  <div className="text-sm text-gray-500">文件大小</div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleLike}
                  variant={liked ? "primary" : "outline"}
                  leftIcon={<Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />}
                >
                  {liked ? '已点赞' : '点赞'}
                </Button>
                
                <Button
                  onClick={handleBookmark}
                  variant={bookmarked ? "primary" : "outline"}
                  leftIcon={<Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />}
                >
                  {bookmarked ? '已收藏' : '收藏'}
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  分享
                </Button>
                
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  下载
                </Button>
              </div>
            </motion.div>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            {/* 作者信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-xl p-6 mb-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={artwork.artist.avatar}
                  alt={artwork.artist.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{artwork.artist.name}</h3>
                  <p className="text-sm text-gray-500">插画师</p>
                </div>
              </div>
              
              {artwork.artist.bio && (
                <p className="text-gray-600 text-sm mb-4">{artwork.artist.bio}</p>
              )}
              
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="font-semibold text-gray-800">{artwork.artist.artworkCount || 0}</div>
                  <div className="text-xs text-gray-500">作品</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{artwork.artist.followers || 0}</div>
                  <div className="text-xs text-gray-500">粉丝</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{artwork.artist.following || 0}</div>
                  <div className="text-xs text-gray-500">关注</div>
                </div>
              </div>
              
              <Button variant="primary" className="w-full">
                关注作者
              </Button>
            </motion.div>

            {/* 作品信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-xl p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">作品信息</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">发布时间</span>
                  <span className="text-gray-800">
                    {new Date(artwork.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {artwork.software && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">创作工具</span>
                    <span className="text-gray-800">{artwork.software}</span>
                  </div>
                )}
                
                {artwork.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">图片尺寸</span>
                    <span className="text-gray-800">
                      {artwork.dimensions.width} × {artwork.dimensions.height}
                    </span>
                  </div>
                )}
                
                {artwork.fileSize && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">文件大小</span>
                    <span className="text-gray-800">{artwork.fileSize}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* 相关作品 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">该作者的其他作品</h3>
          <RelatedArtworks artistId={artwork.artist.id} currentArtworkId={artwork.id} />
        </motion.div>
      </div>

      {/* 图片查看器 */}
      <AnimatePresence>
        {showImageViewer && (
          <ImageViewer
            imageUrl={artwork.imageUrl}
            title={artwork.title}
            isOpen={showImageViewer}
            onClose={() => setShowImageViewer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}