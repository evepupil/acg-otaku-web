/**
 * 插画详情页组件 - 展示插画的详细信息、作者信息、相关作品等
 * 支持图片缩放、收藏、分享等功能
 */

'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, Tag,
  ArrowLeft, ZoomIn, ZoomOut, RotateCw, X
} from 'lucide-react'
import Button from '@/components/Button'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation'
import {  getProxyImageUrl } from '@/lib/pixiv-proxy'
// 移除直接导入supabase，改为通过API路由获取数据

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
        {imageUrl && (
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
        )}
      </div>
    </motion.div>
  )
}



/**
 * 插画详情页组件
 */
export default function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [artwork, setArtwork] = useState<{
    id: string;
    pid: string;
    title: string;
    imageUrl: string;
    artist?: {
      id: number;
      name: string;
    };
    tags: string[];
    createdAt: string;
    stats: {
      views: number;
      likes: number;
      bookmarks: number;
    };
    dimensions: { width: number; height: number } | null;
    popularity: number;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showImageViewer, setShowImageViewer] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  /**
   * 获取插画详情数据
   */
  const fetchArtworkDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 通过API路由获取数据
      const response = await fetch(`/api/artwork/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('获取作品详情失败')
      }
      
      const data = await response.json()
      if (!data.success || !data.data) {
        throw new Error('作品不存在')
      }
      
      const artworkData = data.data
      
      // 转换为详情页面需要的格式
      const artworkDetail = {
        id: artworkData.id,
        pid: artworkData.pid || artworkData.id.toString(), // 确保pid有值
        title: artworkData.title,
        imageUrl: artworkData.imageUrl,
        artist: artworkData.artist || {
          id: artworkData.authorId ? parseInt(artworkData.authorId) : 0,
          name: typeof artworkData.artist === 'string' ? artworkData.artist : '未知作者'
        },
        tags: artworkData.tags,
        createdAt: artworkData.uploadTime || new Date().toISOString(),
        stats: {
          views: artworkData.views || 0,
          likes: artworkData.likes || 0,
          bookmarks: artworkData.bookmarks || 0
        },
        dimensions: null as { width: number; height: number } | null, // 数据库中暂无尺寸信息
        popularity: artworkData.popularity
      }
      
      setArtwork(artworkDetail)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取作品详情失败')
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])



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

        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto">
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
              
              
              {artwork.pid && (
                <img
                  src={getProxyImageUrl(artwork.pid, 'regular')}
                  alt={artwork.title}
                  className={`w-full h-auto ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
              )}
              
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
            className="glass-card rounded-xl p-6"
          >
            {/* 标题 */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {artwork.title}
            </h1>
            
            {/* 基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">PID: {artwork.id}</div>
                <div className="text-sm text-gray-500">作品ID</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{artwork.artist?.name || '未知作者'}</div>
                <div className="text-sm text-gray-500">作者</div>
              </div>
              <div className="text-center">
                 <div className="text-lg font-bold text-gray-800">
                   {artwork.popularity ? `${(artwork.popularity * 100).toFixed(1)}%` : '未知'}
                 </div>
                 <div className="text-sm text-gray-500">热度</div>
               </div>
            </div>
            
            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">{(artwork.stats?.views || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">浏览量</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">{(artwork.stats?.likes || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">点赞数</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">{(artwork.stats?.bookmarks || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">收藏数</div>
              </div>
            </div>
            
            {/* 作品标签 */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
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
          </motion.div>
        </div>


      </div>

      {/* 图片查看器 */}
      <AnimatePresence>
        {showImageViewer && artwork.pid && (
          <ImageViewer
            imageUrl={getProxyImageUrl(artwork.pid, 'original')}
            title={artwork.title}
            isOpen={showImageViewer}
            onClose={() => setShowImageViewer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}