'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Loader2 } from 'lucide-react'
import ArtworkGrid from '@/components/ArtworkGrid'
import type { DailyPick } from '@/types'

export default function DailyPage() {
  const [pick, setPick] = useState<DailyPick | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/daily-picks?date=${date}&type=daily_art`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setPick(data.data)
        else setPick(null)
      })
      .catch(() => setPick(null))
      .finally(() => setLoading(false))
  }, [date])

  const changeDate = (offset: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + offset)
    setDate(d.toISOString().split('T')[0])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <CalendarDays className="inline-block w-8 h-8 mr-2 text-green-600" />
            每日美图
          </h1>
          <p className="text-gray-500 mt-2">每天精选优质ACG插画作品</p>
        </div>

        {/* 日期选择器 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button onClick={() => changeDate(-1)}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 px-6 py-2.5 bg-white rounded-xl border border-gray-200">
            <CalendarDays className="w-4 h-4 text-green-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-none outline-none text-gray-900 font-medium bg-transparent"
            />
          </div>
          <button onClick={() => changeDate(1)}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            disabled={date >= new Date().toISOString().split('T')[0]}>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 内容 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : pick ? (
          <div className="space-y-6">
            {pick.title && (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">{pick.title}</h2>
                {pick.description && <p className="text-gray-500 mt-1">{pick.description}</p>}
              </div>
            )}
            <ArtworkGrid artworks={pick.artworks} />
          </div>
        ) : (
          <div className="text-center py-20">
            <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">该日暂无精选内容</p>
            <p className="text-gray-300 text-sm mt-1">试试其他日期</p>
          </div>
        )}
      </div>
    </div>
  )
}
