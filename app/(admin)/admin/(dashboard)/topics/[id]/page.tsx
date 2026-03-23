'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getImageUrl } from '@/lib/pixiv-proxy'
import type { Artwork } from '@/types'

interface FeatureArtwork extends Artwork { editorComment?: string; sortOrder?: number }

interface TopicFeatureData {
  id: number; topicName: string; topicSlug: string; topicDescription: string
  featureContent: string; coverPid: string; tags: string[]; isPublished: boolean; artworks: FeatureArtwork[]
}

export default function EditTopicFeaturePage() {
  const { id } = useParams() as { id: string }
  const [feature, setFeature] = useState<TopicFeatureData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPid, setNewPid] = useState('')
  const [newComment, setNewComment] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchFeature = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/topic-features/${id}/artworks`)
      const data = await res.json()
      if (data.success) setFeature(data.data)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchFeature() }, [fetchFeature])

  const handleSave = async () => {
    if (!feature) return
    setSaving(true)
    try {
      await fetch('/api/admin/topic-features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: feature.id, topicName: feature.topicName, topicDescription: feature.topicDescription,
          featureContent: feature.featureContent, coverPid: feature.coverPid, tags: feature.tags.join(','),
        }),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!feature) return
    await fetch('/api/admin/topic-features', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: feature.id, isPublished: !feature.isPublished }),
    })
    setFeature({ ...feature, isPublished: !feature.isPublished })
  }

  const handleAddArtwork = async () => {
    if (!newPid.trim()) return
    setAdding(true)
    try {
      await fetch(`/api/admin/topic-features/${id}/artworks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid: newPid.trim(), sortOrder: feature?.artworks.length || 0, editorComment: newComment || undefined }),
      })
      setNewPid('')
      setNewComment('')
      fetchFeature()
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveArtwork = async (pid: string) => {
    await fetch(`/api/admin/topic-features/${id}/artworks?pid=${pid}`, { method: 'DELETE' })
    fetchFeature()
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
  if (!feature) return <div className="text-center py-20 text-gray-500">未找到该专题</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/topics" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">编辑话题专题</h1>
          <p className="text-gray-500 mt-1">{feature.topicName}</p>
        </div>
        <button onClick={handleTogglePublish}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${feature.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {feature.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {feature.isPublished ? '已发布' : '未发布'}
        </button>
      </div>

      {/* 基本信息 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">话题信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">话题名称</label>
            <input type="text" value={feature.topicName} onChange={(e) => setFeature({ ...feature, topicName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面PID</label>
            <input type="text" value={feature.coverPid} onChange={(e) => setFeature({ ...feature, coverPid: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">话题描述</label>
          <textarea value={feature.topicDescription} onChange={(e) => setFeature({ ...feature, topicDescription: e.target.value })} rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标签 (逗号分隔)</label>
          <input type="text" value={feature.tags.join(',')} onChange={(e) => setFeature({ ...feature, tags: e.target.value.split(',').filter(Boolean) })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
        </div>
      </div>

      {/* 鉴赏文章 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">鉴赏文章 (Markdown)</h3>
        <textarea value={feature.featureContent} onChange={(e) => setFeature({ ...feature, featureContent: e.target.value })}
          rows={12} placeholder="撰写话题鉴赏文章..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-mono" />
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          保存
        </button>
      </div>

      {/* 相关作品 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">相关作品 ({feature.artworks.length})</h3>
        <div className="flex gap-2">
          <input type="text" value={newPid} onChange={(e) => setNewPid(e.target.value)} placeholder="PID"
            className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="评语（可选）"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          <button onClick={handleAddArtwork} disabled={adding || !newPid.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            添加
          </button>
        </div>
        <div className="space-y-2">
          {feature.artworks.map((artwork) => (
            <div key={artwork.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <img src={getImageUrl(String(artwork.id), 'thumb_mini', artwork.imagePath)} alt={artwork.title}
                className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{artwork.title}</p>
                <p className="text-xs text-gray-500">PID: {artwork.id}</p>
                {artwork.editorComment && <p className="text-xs text-orange-600 mt-0.5">{artwork.editorComment}</p>}
              </div>
              <button onClick={() => handleRemoveArtwork(String(artwork.id))}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {feature.artworks.length === 0 && <p className="text-center text-gray-400 py-8">暂无作品</p>}
        </div>
      </div>
    </div>
  )
}
