'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Eye, EyeOff, Loader2, Shuffle } from 'lucide-react'
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
    id: number
    pickDate: string
    pickType: string
    title: string
    description: string
    coverPid: string
    isPublished: boolean
    artworks: PickArtwork[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPid, setNewPid] = useState('')
  const [newComment, setNewComment] = useState('')
  const [adding, setAdding] = useState(false)

  const [candidateTopN, setCandidateTopN] = useState(200)
  const [candidateLimit, setCandidateLimit] = useState(30)
  const [candidates, setCandidates] = useState<Artwork[]>([])
  const [selectedCandidatePids, setSelectedCandidatePids] = useState<string[]>([])
  const [candidateLoading, setCandidateLoading] = useState(false)
  const [candidateAdding, setCandidateAdding] = useState(false)
  const [candidateError, setCandidateError] = useState('')

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

  const existingPids = useMemo(
    () => new Set((pick?.artworks || []).map((item) => String(item.id))),
    [pick?.artworks]
  )

  const visibleCandidates = useMemo(
    () => candidates.filter((item) => !existingPids.has(String(item.id))),
    [candidates, existingPids]
  )

  useEffect(() => {
    setSelectedCandidatePids((prev) => prev.filter((pid) => !existingPids.has(pid)))
  }, [existingPids])

  const fetchCandidates = useCallback(async () => {
    setCandidateLoading(true)
    setCandidateError('')
    try {
      const params = new URLSearchParams({
        topN: String(candidateTopN),
        limit: String(candidateLimit),
        excludePublished: 'true',
      })
      const res = await fetch(`/api/admin/candidates/daily?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setCandidates(data.data.artworks || [])
        return
      }
      setCandidateError(data.error || '获取候选失败')
    } catch {
      setCandidateError('获取候选失败')
    } finally {
      setCandidateLoading(false)
    }
  }, [candidateLimit, candidateTopN])

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
        body: JSON.stringify({
          pid: newPid.trim(),
          sortOrder: (pick?.artworks.length || 0),
          editorComment: newComment || undefined,
        }),
      })
      setNewPid('')
      setNewComment('')
      await fetchPick()
    } finally {
      setAdding(false)
    }
  }

  const handleBatchAddCandidates = async () => {
    if (!pick || selectedCandidatePids.length === 0) return

    setCandidateAdding(true)
    setCandidateError('')
    let failed = 0
    const startOrder = pick.artworks.length

    try {
      for (let i = 0; i < selectedCandidatePids.length; i += 1) {
        const pid = selectedCandidatePids[i]
        const res = await fetch(`/api/admin/daily-picks/${id}/artworks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pid, sortOrder: startOrder + i }),
        })
        if (!res.ok) failed += 1
      }

      await fetchPick()
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
    await fetch(`/api/admin/daily-picks/${id}/artworks?pid=${pid}`, { method: 'DELETE' })
    await fetchPick()
  }

  const toggleCandidate = (pid: string) => {
    setSelectedCandidatePids((prev) =>
      prev.includes(pid) ? prev.filter((item) => item !== pid) : [...prev, pid]
    )
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
  if (!pick) return <div className="text-center py-20 text-gray-500">未找到该精选</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/daily-picks" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">编辑精选</h1>
          <p className="text-gray-500 mt-1">{pick.pickDate} · {pick.pickType === 'ranking_pick' ? '榜单精选' : '每日美图'}</p>
        </div>
        <button
          onClick={handleTogglePublish}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${pick.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}
        >
          {pick.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {pick.isPublished ? '已发布' : '未发布'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input
              type="text"
              value={pick.title}
              onChange={(e) => setPick({ ...pick, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面 PID</label>
            <input
              type="text"
              value={pick.coverPid}
              onChange={(e) => setPick({ ...pick, coverPid: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea
            value={pick.description}
            onChange={(e) => setPick({ ...pick, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          保存
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">随机 TopN 候选池</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={candidateTopN}
              onChange={(e) => setCandidateTopN(Math.max(1, Number(e.target.value) || 1))}
              className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm"
            />
            <input
              type="number"
              min={1}
              value={candidateLimit}
              onChange={(e) => setCandidateLimit(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm"
            />
            <button
              onClick={fetchCandidates}
              disabled={candidateLoading}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {candidateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
              刷新候选
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">规则: 从 TopN 中随机抽取，自动排除已发布作品</p>
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
                  className={`text-left rounded-xl border overflow-hidden transition ${selected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300'}`}
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
        <h3 className="font-semibold text-gray-900">作品列表 ({pick.artworks.length})</h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={newPid}
            onChange={(e) => setNewPid(e.target.value)}
            placeholder="输入 PID"
            className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="编辑评语（可选）"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
          <button
            onClick={handleAddArtwork}
            disabled={adding || !newPid.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            添加
          </button>
        </div>

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
              <button
                onClick={() => handleRemoveArtwork(String(artwork.id))}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {pick.artworks.length === 0 && (
            <p className="text-center text-gray-400 py-8">暂无作品，在上方输入 PID 添加</p>
          )}
        </div>
      </div>
    </div>
  )
}
