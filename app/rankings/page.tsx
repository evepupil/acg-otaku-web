/**
 * 排行榜页面组件 - 展示每日/每周/每月热门插画排行榜
 * 支持时间维度切换和分页浏览
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, TrendingUp, Eye, Heart, Clock, Filter } from 'lucide-react'
import Navigation from '../../src/components/Navigation'
import Footer from '../../src/components/Footer'
import Button from '@/components/Button'
import Loading from '@/components/Loading'
import { getRankingArtworks, Artwork } from '../../src/data/mockData'
import type { Artwork } from '@/types'

// 排行榜时间周期类型
type RankingPeriod = 'daily' | 'weekly' | 'monthly'

// 分页响应类型
type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * 时间维度选项
 */
const PERIOD_OPTIONS: { value: RankingPeriod; label: string; icon: React.ReactNode }[] = [
  { value: 'daily', label: '每日', icon: <Calendar className="w-4 h-4" /> },
  { value: 'weekly', label: '每周', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'monthly', label: '每月', icon: <Clock className="w-4 h-4" /> }
]

/**
 * 排行榜作品卡片组件
 */
function RankingCard({ artwork, rank }: { artwork: Artwork; rank: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300"
    >
      <div className="relative">
        {/* 排名标识 */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg
            ${rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-gray-400 to-gray-600'}
          `}>
            {rank}
          </div>
        </div>
        
        {/* 作品图片 */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* 悬浮信息 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end">
            <div className="w-full p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center space-x-4 text-white text-sm">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{artwork.stats.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{artwork.stats.likes.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 作品信息 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
            {artwork.title}
          </h3>
          
          {/* 排名和作者信息 */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-green-600">No. {rank}</span>
            </div>
            <div className="flex items-center space-x-2">
              <img
                src={artwork.artist.avatar}
                alt={artwork.artist.name}
                className="w-5 h-5 rounded-full"
              />
              <span className="hover:text-green-600 transition-colors cursor-pointer">
                @{artwork.artist.name} PID {artwork.id}
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
 * 排行榜页面组件
 */
export default function RankingsPage() {
  const [period, setPeriod] = useState<RankingPeriod>('daily')
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)

  /**
   * 获取排行榜数据
   */
  const fetchRankings = async (selectedPeriod: RankingPeriod, selectedPage: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        `/api/rankings?period=${selectedPeriod}&page=${selectedPage}&limit=20`
      )
      
      if (!response.ok) {
        throw new Error('获取排行榜数据失败')
      }
      
      const data: PaginatedResponse<Artwork> = await response.json()
      setArtworks(data.data)
      setTotalPages(data.pagination.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理时间维度切换
   */
  const handlePeriodChange = (newPeriod: RankingPeriod) => {
    setPeriod(newPeriod)
    setPage(1)
    fetchRankings(newPeriod, 1)
  }

  /**
   * 处理分页
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchRankings(period, newPage)
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 初始化数据
  useEffect(() => {
    fetchRankings(period)
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
              热门排行榜
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            发现最受欢迎的插画作品，探索艺术创作的热门趋势
          </p>
        </motion.div>

        {/* 时间维度选择器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-card p-2 rounded-xl">
            <div className="flex space-x-2">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePeriodChange(option.value)}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2
                    ${period === option.value
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-white/50'
                    }
                  `}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 排行榜内容 */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <Loading variant="spinner" size="lg" text="加载排行榜数据..." />
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
                  onClick={() => fetchRankings(period, page)}
                  variant="primary"
                >
                  重试
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`rankings-${period}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* 排行榜网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {artworks.map((artwork, index) => (
                  <RankingCard
                    key={artwork.id}
                    artwork={artwork}
                    rank={(page - 1) * 20 + index + 1}
                  />
                ))}
              </div>

              {/* 分页控件 */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        variant="outline"
                        size="sm"
                      >
                        上一页
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`
                                w-10 h-10 rounded-lg font-medium transition-all duration-200
                                ${page === pageNum
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                                  : 'text-gray-600 hover:text-emerald-600 hover:bg-white/50'
                                }
                              `}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>
                      
                      <Button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        variant="outline"
                        size="sm"
                      >
                        下一页
                      </Button>
                    </div>
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