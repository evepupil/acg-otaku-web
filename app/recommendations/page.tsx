/**
 * 推荐页面组件 - 展示个性化推荐插画内容
 * 支持分类筛选和无限滚动加载
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Eye, Sparkles, Filter, RefreshCw, Grid, List } from 'lucide-react'
import Button from '../../src/components/Button'
import Loading from '../../src/components/Loading'
import { useInfiniteScroll } from '../../src/hooks'
import type { Artwork } from '../../src/types'



/**
 * 视图模式选项
 */
type ViewMode = 'grid' | 'masonry'

/**
 * 推荐作品卡片组件
 */
function RecommendationCard({ artwork, viewMode }: { artwork: Artwork; viewMode: ViewMode }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [liked, setLiked] = useState(false)

  /**
   * 处理点赞操作
   */
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
    
    // 记录用户行为
    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like',
          artworkId: artwork.id,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('记录用户行为失败:', error)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`
        glass-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300
        ${viewMode === 'masonry' ? 'break-inside-avoid mb-4' : ''}
      `}
    >
      <div className="relative">
        {/* 作品图片 */}
        <div className={`relative overflow-hidden ${
          viewMode === 'grid' ? 'aspect-[4/3]' : 'aspect-auto'
        }`}>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className={`
              w-full h-full object-cover group-hover:scale-105 transition-transform duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* 悬浮操作按钮 */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors duration-200
                ${liked 
                  ? 'bg-green-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-green-500 hover:text-white'
                }
              `}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
          
          {/* 底部信息栏 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{artwork.stats.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{artwork.stats.likes.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-xs opacity-80">
                {new Date(artwork.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        
        {/* 作品信息 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
            {artwork.title}
          </h3>
          
          {/* 作者和PID信息 */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <span className="hover:text-green-600 transition-colors cursor-pointer truncate">
                @{artwork.artist.name}
              </span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="font-medium text-green-600">
                PID {artwork.id}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{artwork.stats.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{artwork.stats.likes.toLocaleString()}</span>
              </div>
            </div>
            <span>{new Date(artwork.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * 推荐页面组件
 */
export default function RecommendationsPage() {

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [refreshing, setRefreshing] = useState(false)
  const [changingBatch, setChangingBatch] = useState(false)

  /**
   * 获取推荐数据
   */
  const fetchRecommendations = async (selectedPage: number = 1, append: boolean = false) => {
    try {
      if (selectedPage === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      
      const params = new URLSearchParams({
        page: selectedPage.toString(),
        limit: '20'
      })
      
      const response = await fetch(`/api/recommendations?${params}`)
      
      if (!response.ok) {
        throw new Error('获取推荐数据失败')
      }
      
      const data = await response.json()
      
      if (append) {
        setArtworks(prev => [...prev, ...data.data.recommendations])
      } else {
        setArtworks(data.data.recommendations)
      }
      
      setHasMore(data.data.pagination.page < data.data.pagination.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  }



  /**
   * 加载更多数据
   */
  const loadMore = useCallback(async () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      await fetchRecommendations(nextPage, true)
    }
  }, [page, loadingMore, hasMore])

  /**
   * 刷新推荐
   */
  const handleRefresh = () => {
    setRefreshing(true)
    setPage(1)
    setHasMore(true)
    fetchRecommendations(1, false)
  }

  /**
   * 换一批推荐
   */
  const handleChangeBatch = async () => {
    setChangingBatch(true)
    setPage(1)
    setHasMore(true)
    
    // 模拟换一批的延迟效果
    await new Promise(resolve => setTimeout(resolve, 800))
    
    await fetchRecommendations(1, false)
    setChangingBatch(false)
  }

  // 无限滚动
  useInfiniteScroll(loadMore, hasMore && !loadingMore)

  // 初始化数据
  useEffect(() => {
    fetchRecommendations()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              个性推荐
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            基于智能算法为您精选符合喜好的优质插画作品
          </p>
          
          {/* 换一批按钮 */}
          <motion.button
            onClick={handleChangeBatch}
            disabled={changingBatch || loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles 
              size={20} 
              className={`mr-2 ${changingBatch ? 'animate-spin' : ''}`} 
            />
            {changingBatch ? '正在换一批...' : '换一批'}
          </motion.button>
        </motion.div>

        {/* 控制栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8"
        >
          {/* 操作按钮 */}
          <div className="flex items-center space-x-3">
            {/* 视图模式切换 */}
            <div className="glass-card p-1 rounded-lg">
              <div className="flex space-x-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`
                    p-2 rounded-md transition-all duration-200
                    ${viewMode === 'grid'
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-white/50'
                    }
                  `}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`
                    p-2 rounded-md transition-all duration-200
                    ${viewMode === 'masonry'
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-white/50'
                    }
                  `}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 刷新按钮 */}
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            >
              刷新
            </Button>
          </div>
        </motion.div>

        {/* 推荐内容 */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <Loading variant="spinner" size="lg" text="加载推荐内容..." />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="glass-card p-8 rounded-xl max-w-md mx-auto">
                <div className="text-red-500 mb-4">
                  <Filter className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                  onClick={() => fetchRecommendations(1, false)}
                  variant="primary"
                >
                  重试
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
key="recommendations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* 作品网格 */}
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6'
                }
              `}>
                {artworks.map((artwork) => (
                  <RecommendationCard
                    key={artwork.id}
                    artwork={artwork}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* 加载更多指示器 */}
              {loadingMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center py-8"
                >
                  <Loading variant="spinner" size="md" text="加载更多..." />
                </motion.div>
              )}

              {/* 没有更多内容提示 */}
              {!hasMore && artworks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-gray-500">已经到底了，没有更多内容了</p>
                </motion.div>
              )}

              {/* 空状态 */}
              {!loading && artworks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="glass-card p-8 rounded-xl max-w-md mx-auto">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无推荐内容</h3>
                    <p className="text-gray-600 mb-4">请稍后再试或切换其他分类</p>
                    <Button
                      onClick={handleRefresh}
                      variant="primary"
                    >
                      刷新推荐
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}