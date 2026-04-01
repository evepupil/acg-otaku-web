'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, Eye, EyeOff, Loader2, Shuffle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { getImageUrl } from '@/lib/pixiv-proxy'
import type { Artwork } from '@/types'

interface FeatureArtwork extends Artwork {
  editorComment?: string
  sortOrder?: number
}

interface TopicFeatureData {
  id: number
  topicName: string
  topicSlug: string
  topicDescription: string
  featureContent: string
  coverPid: string
  tags: string[]
  isPublished: boolean
  artworks: FeatureArtwork[]
}

const TOPIC_HISTORY_KEY = 'admin_topic_history_v1'

export default function EditTopicFeaturePage() {
  const { id } = useParams() as { id: string }
  const [feature, setFeature] = useState<TopicFeatureData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [newPid, setNewPid] = useState('')
  const [newComment, setNewComment] = useState('')
  const [adding, setAdding] = useState(false)

  const [topicKeyword, setTopicKeyword] = useState('')
  const [topicHistory, setTopicHistory] = useState<string[]>([])
  const [candidateTopN, setCandidateTopN] = useState(200)
  const [candidateLimit, setCandidateLimit] = useState(30)
  const [candidates, setCandidates] = useState<Artwork[]>([])
  const [selectedCandidatePids, setSelectedCandidatePids] = useState<string[]>([])
  const [candidateLoading, setCandidateLoading] = useState(false)
  const [candidateAdding, setCandidateAdding] = useState(false)
  const [candidateError, setCandidateError] = useState('')

  const loadTopicHistory = useCallback(() => {
    try {
      const raw = localStorage.getItem(TOPIC_HISTORY_KEY)
      if (!raw) return
      const list = JSON.parse(raw)
      if (Array.isArray(list)) {
        setTopicHistory(list.filter((item) => typeof item === 'string').slice(0, 12))
      }
    } catch {
      // ignore invalid local data
    }
  }, [])

  const saveTopicHistory = useCallback((keyword: string) => {
    const normalized = keyword.trim()
    if (!normalized) return

    setTopicHistory((prev) => {
      const next = [normalized, ...prev.filter((item) => item !== normalized)].slice(0, 12)
      try {
        localStorage.setItem(TOPIC_HISTORY_KEY, JSON.stringify(next))
      } catch {
        // ignore write failure
      }
      return next
    })
  }, [])

  const fetchFeature = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/topic-features/${id}/artworks`)
      const data = await res.json()
      if (data.success) {
        setFeature(data.data)
        setTopicKeyword(data.data.topicName || '')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchFeature() }, [fetchFeature])
  useEffect(() => { loadTopicHistory() }, [loadTopicHistory])

  const existingPids = useMemo(
    () => new Set((feature?.artworks || []).map((item) => String(item.id))),
    [feature?.artworks]
  )

  const visibleCandidates = useMemo(
    () => candidates.filter((item) => !existingPids.has(String(item.id))),
    [candidates, existingPids]
  )

  useEffect(() => {
    setSelectedCandidatePids((prev) => prev.filter((pid) => !existingPids.has(pid)))
  }, [existingPids])

  const fetchCandidates = useCallback(async () => {
    if (!feature) return

    setCandidateLoading(true)
    setCandidateError('')
    try {
      const query = new URLSearchParams({
        topN: String(candidateTopN),
        limit: String(candidateLimit),
        excludePublished: 'true',
        topicName: topicKeyword.trim() || feature.topicName || '',
        tags: feature.tags.join(','),
      })
      const res = await fetch(`/api/admin/candidates/topic?${query.toString()}`)
      const data = await res.json()
      if (data.success) {
        setCandidates(data.data.artworks || [])
        saveTopicHistory(topicKeyword || feature.topicName || '')
        return
      }
      setCandidateError(data.error || '获取候选失败')
    } catch {
      setCandidateError('获取候选失败')
    } finally {
      setCandidateLoading(false)
    }
  }, [candidateLimit, candidateTopN, feature, saveTopicHistory, topicKeyword])

  const handleSave = async () => {
    if (!feature) return
    setSaving(true)
    try {
      await fetch('/api/admin/topic-features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: feature.id,
          topicName: feature.topicName,
          topicDescription: feature.topicDescription,
          featureContent: feature.featureContent,
          coverPid: feature.coverPid,
          tags: feature.tags.join(','),
        }),
      })
      saveTopicHistory(feature.topicName)
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

  const handleRegenerateContent = async () => {
    if (!feature || feature.artworks.length === 0) return

    setRegenerating(true)
    setActionMessage('')
    setActionError('')

    try {
      const res = await fetch('/api/admin/curation/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'topic', id: feature.id }),
      })
      const data = await res.json()

      if (data.success) {
        setFeature(data.data)
        setActionMessage('已重新生成当前专题的文案和短评')
        saveTopicHistory(data.data.topicName || feature.topicName)
        return
      }

      setActionError(data.error || '重新生成失败')
    } catch {
      setActionError('重新生成失败')
    } finally {
      setRegenerating(false)
    }
  }

  const handleAddArtwork = async () => {
    if (!newPid.trim()) return
    setAdding(true)
    try {
      await fetch(`/api/admin/topic-features/${id}/artworks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pid: newPid.trim(),
          sortOrder: feature?.artworks.length || 0,
          editorComment: newComment || undefined,
        }),
      })
      setNewPid('')
      setNewComment('')
      await fetchFeature()
    } finally {
      setAdding(false)
    }
  }

  const handleBatchAddCandidates = async () => {
    if (!feature || selectedCandidatePids.length === 0) return

    setCandidateAdding(true)
    setCandidateError('')
    let failed = 0
    const startOrder = feature.artworks.length

    try {
      for (let i = 0; i < selectedCandidatePids.length; i += 1) {
        const pid = selectedCandidatePids[i]
        const res = await fetch(`/api/admin/topic-features/${id}/artworks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pid, sortOrder: startOrder + i }),
        })
        if (!res.ok) failed += 1
      }

      await fetchFeature()
      await fetchCandidates()
      setSelectedCandidatePids([])

      if (failed > 0) {
        setCandidateError(`已添加 ${selectedCandidatePids.length - failed} 个，失败 ${failed} 个（可能已发布或重复）`)
      }
    } finally {
      setCandidateAdding(false)
    }
  }

  const handleRemoveArtwork = async (pid: string) => {
    await fetch(`/api/admin/topic-features/${id}/artworks?pid=${pid}`, { method: 'DELETE' })
    await fetchFeature()
  }

  const toggleCandidate = (pid: string) => {
    setSelectedCandidatePids((prev) =>
      prev.includes(pid) ? prev.filter((item) => item !== pid) : [...prev, pid]
    )
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
  if (!feature) return <div className="text-center py-20 text-gray-500">未找到该专题</div>

  return (
    <div className="space-y-6 max-w-5xl">
      {actionMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link href="/admin/topics" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">编辑话题专题</h1>
          <p className="text-gray-500 mt-1">{feature.topicName}</p>
        </div>
        <button
          onClick={handleTogglePublish}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${feature.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}
        >
          {feature.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {feature.isPublished ? '已发布' : '未发布'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">话题信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">话题名称</label>
            <input
              type="text"
              value={feature.topicName}
              onChange={(e) => setFeature({ ...feature, topicName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面 PID</label>
            <input
              type="text"
              value={feature.coverPid}
              onChange={(e) => setFeature({ ...feature, coverPid: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">话题描述</label>
          <textarea
            value={feature.topicDescription}
            onChange={(e) => setFeature({ ...feature, topicDescription: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标签 (逗号分隔)</label>
          <input
            type="text"
            value={feature.tags.join(',')}
            onChange={(e) => setFeature({ ...feature, tags: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">候选池 (话题标签随机筛选)</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            type="text"
            value={topicKeyword}
            onChange={(e) => setTopicKeyword(e.target.value)}
            placeholder="话题关键词"
            className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
          <input
            type="number"
            min={1}
            value={candidateTopN}
            onChange={(e) => setCandidateTopN(Math.max(1, Number(e.target.value) || 1))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
          <input
            type="number"
            min={1}
            value={candidateLimit}
            onChange={(e) => setCandidateLimit(Math.max(1, Number(e.target.value) || 1))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
          <button
            onClick={fetchCandidates}
            disabled={candidateLoading}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
          >
            {candidateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
            刷新候选
          </button>
        </div>

        {topicHistory.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topicHistory.map((item) => (
              <button
                key={item}
                onClick={() => setTopicKeyword(item)}
                className="px-2 py-1 text-xs rounded-full bg-orange-50 text-orange-700 hover:bg-orange-100"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">规则: 按标签过滤后从 TopN 随机抽取，排除已发布作品</p>
          <button
            onClick={handleBatchAddCandidates}
            disabled={candidateAdding || selectedCandidatePids.length === 0}
            className="px-3 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {candidateAdding ? '添加中...' : `批量加入已选 (${selectedCandidatePids.length})`}
          </button>
        </div>

        {candidateError && <p className="text-sm text-red-600">{candidateError}</p>}

        {visibleCandidates.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {visibleCandidates.map((item) => {
              const pid = String(item.id)
              const selected = selectedCandidatePids.includes(pid)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleCandidate(pid)}
                  className={`text-left rounded-xl border overflow-hidden transition ${selected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'}`}
                >
                  <img
                    src={getImageUrl(String(item.id), 'thumb_mini', item.imagePath)}
                    alt={item.title}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">PID: {item.id}</p>
                    <p className="text-xs text-gray-500 truncate">{item.artist?.name}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">鉴赏文章 (Markdown)</h3>
        <textarea
          value={feature.featureContent}
          onChange={(e) => setFeature({ ...feature, featureContent: e.target.value })}
          rows={12}
          placeholder="撰写话题鉴赏文章..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-mono"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRegenerateContent}
            disabled={regenerating || feature.artworks.length === 0}
            className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50"
          >
            {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            重新生成文案
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">相关作品 ({feature.artworks.length})</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPid}
            onChange={(e) => setNewPid(e.target.value)}
            placeholder="PID"
            className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="评语（可选）"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
          <button
            onClick={handleAddArtwork}
            disabled={adding || !newPid.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            添加
          </button>
        </div>
        <div className="space-y-2">
          {feature.artworks.map((artwork) => (
            <div key={artwork.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <img
                src={getImageUrl(String(artwork.id), 'thumb_mini', artwork.imagePath)}
                alt={artwork.title}
                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{artwork.title}</p>
                <p className="text-xs text-gray-500">PID: {artwork.id}</p>
                {artwork.editorComment && <p className="text-xs text-orange-600 mt-0.5">{artwork.editorComment}</p>}
              </div>
              <button
                onClick={() => handleRemoveArtwork(String(artwork.id))}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
              >
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
