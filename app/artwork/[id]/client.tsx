/**
 * 插画详情页客户端组件 - 处理交互逻辑
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
import { getImageUrl } from '@/lib/pixiv-proxy'

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
   * 处理鼠标拖拽开始
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  /**
   * 处理鼠标拖拽
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  /**
   * 处理鼠标拖拽结束
   */
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  /**
   * 处理键盘事件
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          setScale(prev => Math.min(prev + 0.2, 3))
          break
        case '-':
          setScale(prev => Math.max(prev - 0.2, 0.5))
          break
        case 'r':
        case 'R':
          setRotation(prev => prev + 90)
          break
        case '0':
          resetImage()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
        onClick={onClose}
      >
        {/* 工具栏 */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setScale(prev => Math.min(prev + 0.2, 3))
            }}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setScale(prev => Math.max(prev - 0.2, 0.5))
            }}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setRotation(prev => prev + 90)
            }}
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              resetImage()
            }}
          >
            重置
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 图片容器 */}
        <motion.img
          src={imageUrl}
          alt={title}
          className="max-w-none cursor-move select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={(e) => e.stopPropagation()}
          drag
          dragConstraints={false}
        />
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * 插画详情页客户端组件
 */
export default function ArtworkDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [artwork, setArtwork] = useState<{
    id: string;
    pid: string;
    title: string;
    imageUrl: string;
    imagePath: string;  // B2 存储桶图片路径
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
        imagePath: artworkData.imagePath || '',  // 添加 imagePath
        artist: artworkData.artist || {
          id: artworkData.authorId ? parseInt(artworkData.authorId) : 0,
          name: typeof artworkData.artist === 'string' ? artworkData.artist : '未知作者'
        },
        tags: artworkData.tags,
        createdAt: artworkData.uploadTime || new Date().toISOString(),
        stats: {
          views: artworkData.stats?.views || 0,
          likes: artworkData.stats?.likes || 0,
          bookmarks: artworkData.stats?.bookmarks || 0
        },
        dimensions: null as { width: number; height: number } | null, // 数据库中暂无尺寸信息
        popularity: artworkData.popularity
      }
      
      setArtwork(artworkDetail)
    } catch (err) {
      console.error('获取作品详情失败:', err)
      setError(err instanceof Error ? err.message : '获取作品详情失败')
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    fetchArtworkDetail()
  }, [fetchArtworkDetail])

  /**
   * 处理返回按钮点击
   */
  const handleBack = () => {
    router.back()
  }

  /**
   * 处理图片加载完成
   */
  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  /**
   * 处理图片加载错误
   */
  const handleImageError = () => {
    setImageLoaded(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || '作品不存在'}
          </h1>
          <p className="text-gray-600 mb-8">
            抱歉，您访问的作品可能不存在或已被删除
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* 头部导航 */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                作品ID: {artwork.pid}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 图片展示区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                {artwork.pid ? (
                  <motion.img
                    src={getImageUrl(artwork.pid, 'original', artwork.imagePath)}
                    alt={artwork.title}
                    className="w-full h-full object-contain cursor-zoom-in"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    onClick={() => setShowImageViewer(true)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: imageLoaded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div className="text-gray-400">
                    图片加载失败
                  </div>
                )}
                
                {!imageLoaded && artwork.pid && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loading />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 作品信息区域 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {artwork.title}
              </h1>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">作者</h3>
                  <p className="text-lg text-gray-900">
                    {typeof artwork.artist === 'object' ? artwork.artist.name : artwork.artist || '未知作者'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">创建时间</h3>
                  <p className="text-gray-700">
                    {new Date(artwork.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">统计信息</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="w-4 h-4 text-gray-400 mr-1" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {artwork.stats.views.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">浏览</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <span className="text-red-500">♥</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {artwork.stats.likes.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">点赞</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <span className="text-yellow-500">★</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {artwork.stats.bookmarks.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">收藏</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 标签 */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 图片查看器 */}
      <ImageViewer
        imageUrl={artwork.pid ? getImageUrl(artwork.pid, 'original', artwork.imagePath) : ''}
        title={artwork.title}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
      />
    </div>
  )
}