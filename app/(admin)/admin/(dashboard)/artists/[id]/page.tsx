'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { getImageUrl } from '@/lib/pixiv-proxy'
import type { Artwork } from '@/types'

interface FeatureArtwork extends Artwork {
  editorComment?: string
  sortOrder?: number
}

interface ArtistFeatureData {
  id: number
  artistId: string
  artistName: string
  artistAvatar: string
  artistBio: string
  featureTitle: string
  featureContent: string
  coverPid: string
  pixivUrl: string
  twitterUrl: string
  isPublished: boolean
  artworks: FeatureArtwork[]
}

export default function EditArtistFeaturePage() {
  const { id } = useParams() as { id: string }
  const [feature, setFeature] = useState<ArtistFeatureData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPid, setNewPid] = useState('')
  const [newComment, setNewComment] = useState('')
  const [adding, setAdding] = useState(false)

  const [candidateArtistId, setCandidateArtistId] = useState('')
  const [crawlBeforeQuery, setCrawlBeforeQuery] = useState(true)
  const [candidateTopN, setCandidateTopN] = useState(200)
  const [candidateLimit, setCandidateLimit] = useState(30)
  const [candidates, setCandidates] = useState<Artwork[]>([])
  const [selectedCandidatePids, setSelectedCandidatePids] = useState<string[]>([])
  const [candidateLoading, setCandidateLoading] = useState(false)
  const [candidateAdding, setCandidateAdding] = useState(false)
  const [candidateError, setCandidateError] = useState('')
  const [crawlerMessage, setCrawlerMessage] = useState('')

  const fetchFeature = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/artist-features/${id}/artworks`)
      const data = await res.json()
      if (data.success) {
        setFeature(data.data)
        setCandidateArtistId(data.data.artistId || '')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchFeature() }, [fetchFeature])

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
    if (!candidateArtistId.trim()) {
      setCandidateError('请先输入画师 ID')
      return
    }

    setCandidateLoading(true)
    setCandidateError('')
    setCrawlerMessage('')

    try {
      const res = await fetch('/api/admin/candidates/artist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: candidateArtistId.trim(),
          topN: candidateTopN,
          limit: candidateLimit,
          excludePublished: true,
          crawlBeforeQuery,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCandidates(data.data.artworks || [])
        if (data.data.crawler?.message) {
          setCrawlerMessage(data.data.crawler.message)
        }
        return
      }
      setCandidateError(data.error || '获取候选失败')
    } catch {
      setCandidateError('获取候选失败')
    } finally {
      setCandidateLoading(false)
    }
  }, [candidateArtistId, candidateLimit, candidateTopN, crawlBeforeQuery])

  const handleSave = async () => {
    if (!feature) return
    setSaving(true)
    try {
      await fetch('/api/admin/artist-features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: feature.id,
          artistName: feature.artistName,
          artistBio: feature.artistBio,
          featureTitle: feature.featureTitle,
          featureContent: feature.featureContent,
          coverPid: feature.coverPid,
          pixivUrl: feature.pixivUrl,
          twitterUrl: feature.twitterUrl,
        }),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!feature) return
    await fetch('/api/admin/artist-features', {
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
      await fetch(`/api/admin/artist-features/${id}/artworks`, {
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
        const res = await fetch(`/api/admin/artist-features/${id}/artworks`, {
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
    await fetch(`/api/admin/artist-features/${id}/artworks?pid=${pid}`, { method: 'DELETE' })
    await fetchFeature()
  }

  const toggleCandidate = (pid: string) => {
    setSelectedCandidatePids((prev) =>
      prev.includes(pid) ? prev.filter((item) => item !== pid) : [...prev, pid]
    )
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
  if (!feature) return <div className="text-center py-20 text-gray-500">未找到该专题</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/artists" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">编辑画师专题</h1>
          <p className="text-gray-500 mt-1">{feature.artistName}</p>
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
        <h3 className="font-semibold text-gray-900">画师信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">画师名称</label>
            <input
              type="text"
              value={feature.artistName}
              onChange={(e) => setFeature({ ...feature, artistName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">专题标题</label>
            <input
              type="text"
              value={feature.featureTitle}
              onChange={(e) => setFeature({ ...feature, featureTitle: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pixiv 主页</label>
            <input
              type="text"
              value={feature.pixivUrl}
              onChange={(e) => setFeature({ ...feature, pixivUrl: e.target.value })}
              placeholder="https://www.pixiv.net/users/..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
            <input
              type="text"
              value={feature.twitterUrl}
              onChange={(e) => setFeature({ ...feature, twitterUrl: e.target.value })}
              placeholder="https://twitter.com/..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">画师简介</label>
          <textarea
            value={feature.artistBio}
            onChange={(e) => setFeature({ ...feature, artistBio: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">封面 PID</label>
          <input
            type="text"
            value={feature.coverPid}
            onChange={(e) => setFeature({ ...feature, coverPid: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">候选池 (画师 ID 抓取 + 随机 TopN)</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            type="text"
            value={candidateArtistId}
            onChange={(e) => setCandidateArtistId(e.target.value)}
            placeholder="画师 ID"
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
            className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {candidateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            拉取候选
          </button>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={crawlBeforeQuery}
            onChange={(e) => setCrawlBeforeQuery(e.target.checked)}
            className="rounded border-gray-300"
          />
          拉取前先触发爬虫
        </label>

        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">规则: 自动排除已发布作品，仅保留可审核候选</p>
          <button
            onClick={handleBatchAddCandidates}
            disabled={candidateAdding || selectedCandidatePids.length === 0}
            className="px-3 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {candidateAdding ? '添加中...' : `批量加入已选 (${selectedCandidatePids.length})`}
          </button>
        </div>

        {crawlerMessage && <p className="text-xs text-indigo-600">{crawlerMessage}</p>}
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
                  className={`text-left rounded-xl border overflow-hidden transition ${selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300'}`}
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
          placeholder="撰写画师鉴赏文章，支持 Markdown..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-mono"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          保存
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">代表作品 ({feature.artworks.length})</h3>
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
            className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
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
                {artwork.editorComment && <p className="text-xs text-purple-600 mt-0.5">{artwork.editorComment}</p>}
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
