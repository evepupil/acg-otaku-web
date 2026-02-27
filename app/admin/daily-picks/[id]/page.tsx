'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getImageUrl } from '@/lib/pixiv-proxy'
import type { Artwork } from '@/types'

interface PickArtwork extends Artwork {
  editorComment?: string
  sortOrder?: number
}

export default function EditDailyPickPage() {
  const { id } = useParams() as { id: string }
  const [pick, setPick] = useState<{
    id: number; pickDate: string; pickType: string; title: string; description: string;
    coverPid: string; isPublished: boolean; artworks: PickArtwork[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPid, setNewPid] = useState('')
  const [newComment, setNewComment] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchPick = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/daily-picks/${id}/artworks`)
      const data = await res.json()
      if (data.success) setPick(data.data)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchPick() }, [fetchPick])

  const handleSave = async () => {
    if (!pick) return
    setSaving(true)
    try {
      await fetch('/api/admin/daily-picks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pick.id,
          title: pick.title,
          description: pick.description,
          coverPid: pick.coverPid,
        }),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!pick) return
    await fetch('/api/admin/daily-picks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pick.id, isPublished: !pick.isPublished }),
    })
    setPick({ ...pick, isPublished: !pick.isPublished })
  }

  const handleAddArtwork = async () => {
    if (!newPid.trim()) return
    setAdding(true)
    try {
      await fetch(`/api/admin/daily-picks/${id}/artworks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid: newPid.trim(), sortOrder: (pick?.artworks.length || 0), editorComment: newComment || undefined }),
      })
      setNewPid('')
      setNewComment('')
      fetchPick()
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveArtwork = async (pid: string) => {
    await fetch(`/api/admin/daily-picks/${id}/artworks?pid=${pid}`, { method: 'DELETE' })
    fetchPick()
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
  if (!pick) return <div className="text-center py-20 text-gray-500">未找到该精选</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/daily-picks" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">编辑精选</h1>
          <p className="text-gray-500 mt-1">{pick.pickDate} · {pick.pickType === 'ranking_pick' ? '排行精选' : '每日美图'}</p>
        </div>
        <button onClick={handleTogglePublish}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${pick.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {pick.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {pick.isPublished ? '已发布' : '未发布'}
        </button>
      </div>

      {/* 基本信息 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input type="text" value={pick.title} onChange={(e) => setPick({ ...pick, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面PID</label>
            <input type="text" value={pick.coverPid} onChange={(e) => setPick({ ...pick, coverPid: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea value={pick.description} onChange={(e) => setPick({ ...pick, description: e.target.value })} rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm" />
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          保存
        </button>
      </div>

      {/* 作品列表 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">作品列表 ({pick.artworks.length})</h3>

        {/* 添加作品 */}
        <div className="flex gap-2">
          <input type="text" value={newPid} onChange={(e) => setNewPid(e.target.value)} placeholder="输入PID"
            className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="编辑评语（可选）"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          <button onClick={handleAddArtwork} disabled={adding || !newPid.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            添加
          </button>
        </div>

        {/* 作品网格 */}
        <div className="space-y-2">
          {pick.artworks.map((artwork) => (
            <div key={artwork.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab" />
              <img
                src={getImageUrl(String(artwork.id), 'thumb_mini', artwork.imagePath)}
                alt={artwork.title}
                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{artwork.title}</p>
                <p className="text-xs text-gray-500">{artwork.artist?.name} · PID: {artwork.id}</p>
                {artwork.editorComment && (
                  <p className="text-xs text-green-600 mt-0.5">{artwork.editorComment}</p>
                )}
              </div>
              <button onClick={() => handleRemoveArtwork(String(artwork.id))}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {pick.artworks.length === 0 && (
            <p className="text-center text-gray-400 py-8">暂无作品，在上方输入PID添加</p>
          )}
        </div>
      </div>
    </div>
  )
}
