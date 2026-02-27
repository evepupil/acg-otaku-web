'use client'

import { useState, useEffect } from 'react'
import { Image, CalendarDays, Palette, Hash } from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import type { AdminStats } from '@/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">内容运营概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="作品总数"
          value={stats?.totalArtworks || 0}
          icon={Image}
          color="green"
        />
        <StatsCard
          title="每日精选"
          value={stats?.totalDailyPicks || 0}
          subtitle={`已发布 ${stats?.publishedDailyPicks || 0}`}
          icon={CalendarDays}
          color="blue"
        />
        <StatsCard
          title="画师专题"
          value={stats?.totalArtistFeatures || 0}
          subtitle={`已发布 ${stats?.publishedArtistFeatures || 0}`}
          icon={Palette}
          color="purple"
        />
        <StatsCard
          title="话题专题"
          value={stats?.totalTopicFeatures || 0}
          subtitle={`已发布 ${stats?.publishedTopicFeatures || 0}`}
          icon={Hash}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/admin/artworks/add" className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <Image className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">添加作品</span>
            </a>
            <a href="/admin/daily-picks" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">新建每日精选</span>
            </a>
            <a href="/admin/artists" className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <Palette className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">新建画师专题</span>
            </a>
            <a href="/admin/topics" className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
              <Hash className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">新建话题专题</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">使用指南</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>1. 通过<strong>作品管理</strong>添加Pixiv作品（输入PID自动获取信息）</p>
            <p>2. 在<strong>每日精选</strong>中创建排行精选或每日美图合集</p>
            <p>3. 创建<strong>画师专题</strong>，撰写画师鉴赏文章并关联代表作品</p>
            <p>4. 创建<strong>话题专题</strong>，围绕主题组织相关作品并撰写鉴赏</p>
            <p>5. 编辑完成后点击<strong>发布</strong>，内容即可在前台展示</p>
          </div>
        </div>
      </div>
    </div>
  )
}
