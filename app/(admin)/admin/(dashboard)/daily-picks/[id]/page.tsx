'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Shuffle,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

import { getImageUrl } from '@/lib/pixiv-proxy'
import type { Artwork } from '@/types'

interface PickArtwork extends Artwork {
  editorComment?: string
  sortOrder?: number
}

interface DailyPickData {
  id: number
  pickDate: string
  pickType: string
  title: string
  description: string
  coverPid: string
  isPublished: boolean
  artworks: PickArtwork[]
}

export default function EditDailyPickPage() {
  const { id } = useParams() as { id: string }
  const [pick, setPick] = useState<DailyPickData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
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
      if (data.success) {
        setPick(data.data)
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPick()
  }, [fetchPick])

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
    setActionMessage('')
    setActionError('')

    try {
      const res = await fetch('/api/admin/daily-picks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pick.id,
          title: pick.title,
          description: pick.description,
          coverPid: pick.coverPid,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setActionError(data.error || '保存失败')
        return
      }
      setActionMessage('已保存当前每日美图信息')
    } catch {
      setActionError('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerateContent = async () => {
    if (!pick || pick.artworks.length === 0) return

    setRegenerating(true)
    setActionMessage('')
    setActionError('')

    try {
      const res = await fetch('/api/admin/curation/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'daily', id: pick.id }),
      })
      const data = await res.json()

      if (data.success) {
        setPick(data.data)
        setActionMessage('已重新生成当前每日美图的文案和短评')
        return
      }

      setActionError(data.error || '重新生成失败')
    } catch {
      setActionError('重新生成失败')
    } finally {
      setRegenerating(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!pick) return

    const nextPublished = !pick.isPublished
    await fetch('/api/admin/daily-picks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pick.id, isPublished: nextPublished }),
    })
    setPick({ ...pick, isPublished: nextPublished })
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
          sortOrder: pick?.artworks.length || 0,
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
        setCandidateError(
          `已添加 ${selectedCandidatePids.length - failed} 个，失败 ${failed} 个（可能已发布或重复）`
        )
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!pick) {
    return <div className="py-20 text-center text-gray-500">未找到该每日美图记录</div>
  }

  return (
    <div className="max-w-5xl space-y-6">
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
        <Link href="/admin/daily-picks" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">编辑每日美图</h1>
          <p className="mt-1 text-gray-500">
            {pick.pickDate} · {pick.pickType === 'ranking_pick' ? '榜单精选' : '每日美图'}
          </p>
        </div>
        <button
          onClick={handleTogglePublish}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
            pick.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {pick.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {pick.isPublished ? '已发布' : '未发布'}
        </button>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
        <h3 className="font-semibold text-gray-900">基本信息</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">标题</label>
            <input
              type="text"
              value={pick.title}
              onChange={(event) => setPick({ ...pick, title: event.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">封面 PID</label>
            <input
              type="text"
              value={pick.coverPid}
              onChange={(event) => setPick({ ...pick, coverPid: event.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">描述</label>
          <textarea
            value={pick.description}
            onChange={(event) => setPick({ ...pick, description: event.target.value })}
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRegenerateContent}
            disabled={regenerating || pick.artworks.length === 0}
            className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            重新生成文案
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">随机 TopN 候选池</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={candidateTopN}
              onChange={(event) => setCandidateTopN(Math.max(1, Number(event.target.value) || 1))}
              className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={1}
              value={candidateLimit}
              onChange={(event) => setCandidateLimit(Math.max(1, Number(event.target.value) || 1))}
              className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <button
              onClick={fetchCandidates}
              disabled={candidateLoading}
              className="flex items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {candidateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
              刷新候选
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">规则: 从 TopN 中随机抽取，并自动排除已发布作品</p>
          <button
            onClick={handleBatchAddCandidates}
            disabled={candidateAdding || selectedCandidatePids.length === 0}
            className="rounded-xl bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {candidateAdding ? '添加中...' : `批量加入已选 (${selectedCandidatePids.length})`}
          </button>
        </div>

        {candidateError && <p className="text-sm text-red-600">{candidateError}</p>}

        {visibleCandidates.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {visibleCandidates.map((item) => {
              const pid = String(item.id)
              const selected = selectedCandidatePids.includes(pid)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleCandidate(pid)}
                  className={`overflow-hidden rounded-xl border text-left transition ${
                    selected
                      ? 'border-green-500 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <img
                    src={getImageUrl(String(item.id), 'thumb_mini', item.imagePath)}
                    alt={item.title}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="p-2">
                    <p className="truncate text-xs font-medium text-gray-900">{item.title}</p>
                    <p className="truncate text-xs text-gray-500">PID: {item.id}</p>
                    <p className="truncate text-xs text-gray-500">{item.artist?.name}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
        <h3 className="font-semibold text-gray-900">作品列表 ({pick.artworks.length})</h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={newPid}
            onChange={(event) => setNewPid(event.target.value)}
            placeholder="输入 PID"
            className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="编辑评语（可选）"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            onClick={handleAddArtwork}
            disabled={adding || !newPid.trim()}
            className="flex items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            添加
          </button>
        </div>

        <div className="space-y-2">
          {pick.artworks.map((artwork) => (
            <div key={artwork.id} className="flex items-center gap-4 rounded-xl bg-gray-50 p-3">
              <GripVertical className="h-4 w-4 flex-shrink-0 cursor-grab text-gray-300" />
              <img
                src={getImageUrl(String(artwork.id), 'thumb_mini', artwork.imagePath)}
                alt={artwork.title}
                className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{artwork.title}</p>
                <p className="text-xs text-gray-500">
                  {artwork.artist?.name} · PID: {artwork.id}
                </p>
                {artwork.editorComment && (
                  <p className="mt-0.5 text-xs text-green-600">{artwork.editorComment}</p>
                )}
              </div>
              <button
                onClick={() => handleRemoveArtwork(String(artwork.id))}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {pick.artworks.length === 0 && (
            <p className="py-8 text-center text-gray-400">暂无作品，在上方输入 PID 添加</p>
          )}
        </div>
      </div>
    </div>
  )
}
