/**
 * 排行榜精选页面 - 展示人工精选的Pixiv排行作品
 * 支持按日期浏览
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp, Filter } from 'lucide-react'
import Button from '@/components/Button'
import Loading from '@/components/Loading'
import ArtworkGrid from '@/components/ArtworkGrid'
import type { Artwork } from '@/types'

export default function RankingsPage() {
  const [artworks, setArtworks] = useState<(Artwork & { editorComment?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [availableDates, setAvailableDates] = useState<{ pickDate: string; title: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchRankings = async (selectedDate?: string) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedDate) params.set('date', selectedDate)

      const response = await fetch(`/api/rankings?${params}`)
      if (!response.ok) throw new Error('获取排行榜数据失败')

      const data = await response.json()
      setArtworks(data.data.rankings || [])
      setDate(data.data.date || '')
      setTitle(data.data.title || '')
      setDescription(data.data.description || '')
      if (data.data.picks) {
        setAvailableDates(data.data.picks)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const changeDate = (offset: number) => {
    const currentIndex = availableDates.findIndex(d => d.pickDate === date)
    const newIndex = currentIndex + offset
    if (newIndex >= 0 && newIndex < availableDates.length) {
      fetchRankings(availableDates[newIndex].pickDate)
    }
  }

  useEffect(() => {
    fetchRankings()
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
              <TrendingUp className="inline-block w-10 h-10 mr-2" />
              每日排行精选
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            从Pixiv排行榜中精心挑选的优质作品
          </p>
        </motion.div>

        {/* 日期选择器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <button
            onClick={() => changeDate(1)}
            disabled={!availableDates.length || availableDates.findIndex(d => d.pickDate === date) >= availableDates.length - 1}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 px-6 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <CalendarDays className="w-4 h-4 text-green-600" />
            <span className="text-gray-900 font-medium">{date || '最新'}</span>
          </div>
          <button
            onClick={() => changeDate(-1)}
            disabled={!availableDates.length || availableDates.findIndex(d => d.pickDate === date) <= 0}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </motion.div>

        {/* 标题和描述 */}
        {title && (
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-gray-500 mt-1">{description}</p>}
          </div>
        )}

        {/* 内容 */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex justify-center py-20">
              <Loading variant="spinner" size="lg" text="加载排行榜数据..." />
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20">
              <div className="glass-card p-8 rounded-xl max-w-md mx-auto">
                <div className="text-red-500 mb-4"><Filter className="w-12 h-12 mx-auto" /></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => fetchRankings()} variant="primary">重试</Button>
              </div>
            </motion.div>
          ) : artworks.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">暂无排行精选</p>
              <p className="text-gray-300 text-sm mt-1">管理员还未发布该日期的排行精选</p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ArtworkGrid artworks={artworks} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
