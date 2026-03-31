'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Filter, Plus, RefreshCw, Search, Star, X } from 'lucide-react'
import Link from 'next/link'
import { getImageUrl } from '@/lib/pixiv-proxy'
import type { Artwork, Pagination } from '@/types'

type TabType = 'review' | 'favorites'

const TAG_HISTORY_KEY = 'admin_material_tag_history_v1'

function defaultPickDate() {
  return new Date().toISOString().slice(0, 10)
}

function slugifyTopic(input: string) {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug
}

export default function ArtworksPage() {
  const [activeTab, setActiveTab] = useState<TabType>('review')

  const [candidateTag, setCandidateTag] = useState('')
  const [candidateTopN, setCandidateTopN] = useState(200)
  const [candidateLimit, setCandidateLimit] = useState(30)
  const [candidateLoading, setCandidateLoading] = useState(false)
  const [candidateError, setCandidateError] = useState('')
  const [candidates, setCandidates] = useState<Artwork[]>([])
  const [selectedReviewPids, setSelectedReviewPids] = useState<string[]>([])

  const [favorites, setFavorites] = useState<Artwork[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [favoritesError, setFavoritesError] = useState('')
  const [favoritePagination, setFavoritePagination] = useState<Pagination>({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
  })
  const [favoriteSearch, setFavoriteSearch] = useState('')
  const [favoriteTag, setFavoriteTag] = useState('')
  const [favoriteArtistId, setFavoriteArtistId] = useState('')
  const [selectedFavoritePids, setSelectedFavoritePids] = useState<string[]>([])
  const [tagHistory, setTagHistory] = useState<string[]>([])

  const [dailyPickDate, setDailyPickDate] = useState(defaultPickDate())
  const [dailyTitle, setDailyTitle] = useState('')
  const [dailyDescription, setDailyDescription] = useState('')
  const [creatingDaily, setCreatingDaily] = useState(false)

  const [topicName, setTopicName] = useState('')
  const [topicSlug, setTopicSlug] = useState('')
  const [topicTags, setTopicTags] = useState('')
  const [topicDescription, setTopicDescription] = useState('')
  const [creatingTopic, setCreatingTopic] = useState(false)

  const [actionLoadingPid, setActionLoadingPid] = useState<string | null>(null)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [globalMessage, setGlobalMessage] = useState('')

  const selectedFavoriteCount = selectedFavoritePids.length

  const loadTagHistory = useCallback(() => {
    try {
      const raw = localStorage.getItem(TAG_HISTORY_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setTagHistory(parsed.filter((item) => typeof item === 'string').slice(0, 12))
      }
    } catch {
      // ignore localStorage parse failures
    }
  }, [])

  const saveTagHistory = useCallback((tagValue: string) => {
    const normalized = tagValue.trim()
    if (!normalized) return

    setTagHistory((prev) => {
      const next = [normalized, ...prev.filter((item) => item !== normalized)].slice(0, 12)
      try {
        localStorage.setItem(TAG_HISTORY_KEY, JSON.stringify(next))
      } catch {
        // ignore write failures
      }
      return next
    })
  }, [])

  useEffect(() => {
    loadTagHistory()
  }, [loadTagHistory])

  const fetchCandidates = useCallback(async () => {
    setCandidateLoading(true)
    setCandidateError('')
    try {
      const params = new URLSearchParams({
        limit: String(candidateLimit),
        topN: String(candidateTopN),
        excludePublished: 'true',
      })
      if (candidateTag.trim()) params.set('tag', candidateTag.trim())

      const res = await fetch(`/api/admin/review/candidates?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setCandidates(data.data.artworks || [])
        setSelectedReviewPids([])
        if (candidateTag.trim()) saveTagHistory(candidateTag.trim())
      } else {
        setCandidateError(data.error || '获取评审候选失败')
      }
    } catch {
      setCandidateError('获取评审候选失败')
    } finally {
      setCandidateLoading(false)
    }
  }, [candidateLimit, candidateTag, candidateTopN, saveTagHistory])

  const fetchFavorites = useCallback(async (page = 1) => {
    setFavoritesLoading(true)
    setFavoritesError('')
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(favoritePagination.limit || 24),
        excludePublished: 'true',
      })
      if (favoriteSearch.trim()) params.set('search', favoriteSearch.trim())
      if (favoriteTag.trim()) params.set('tag', favoriteTag.trim())
      if (favoriteArtistId.trim()) params.set('artistId', favoriteArtistId.trim())

      const res = await fetch(`/api/admin/review/favorites?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setFavorites(data.data.artworks || [])
        setFavoritePagination(data.data.pagination)
        if (favoriteTag.trim()) saveTagHistory(favoriteTag.trim())
      } else {
        setFavoritesError(data.error || '获取收藏素材失败')
      }
    } catch {
      setFavoritesError('获取收藏素材失败')
    } finally {
      setFavoritesLoading(false)
    }
  }, [favoriteArtistId, favoritePagination.limit, favoriteSearch, favoriteTag, saveTagHistory])

  useEffect(() => {
    if (activeTab === 'review') {
      fetchCandidates()
    }
  }, [activeTab, fetchCandidates])

  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavorites(1)
    }
  }, [activeTab, fetchFavorites])

  const sendReviewAction = useCallback(async (pid: string, action: 'favorite' | 'reject' | 'skip') => {
    setActionLoadingPid(pid)
    try {
      const res = await fetch('/api/admin/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, action }),
      })
      const data = await res.json()
      if (!data.success) {
        setGlobalMessage(data.error || '写入评审动作失败')
        return false
      }

      setCandidates((prev) => prev.filter((item) => String(item.id) !== pid))
      setSelectedReviewPids((prev) => prev.filter((item) => item !== pid))
      if (action === 'favorite') {
        setGlobalMessage(`已收藏 PID ${pid}`)
      }
      return true
    } catch {
      setGlobalMessage('写入评审动作失败')
      return false
    } finally {
      setActionLoadingPid(null)
    }
  }, [])

  const handleBulkFavorite = useCallback(async () => {
    if (selectedReviewPids.length === 0) return
    setBulkActionLoading(true)
    let success = 0
    for (const pid of selectedReviewPids) {
      const ok = await sendReviewAction(pid, 'favorite')
      if (ok) success += 1
    }
    setBulkActionLoading(false)
    setGlobalMessage(`批量收藏完成: ${success}/${selectedReviewPids.length}`)
  }, [selectedReviewPids, sendReviewAction])

  const handleCreateDaily = async () => {
    if (selectedFavoritePids.length === 0) {
      setGlobalMessage('请先勾选收藏素材')
      return
    }
    setCreatingDaily(true)
    try {
      const res = await fetch('/api/admin/review/create-curation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'daily',
          pids: selectedFavoritePids,
          pickDate: dailyPickDate,
          title: dailyTitle || undefined,
          description: dailyDescription || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        window.location.href = data.data.editUrl
        return
      }
      setGlobalMessage(data.error || '创建每日美图失败')
    } finally {
      setCreatingDaily(false)
    }
  }

  const handleCreateTopic = async () => {
    if (selectedFavoritePids.length === 0) {
      setGlobalMessage('请先勾选收藏素材')
      return
    }
    if (!topicName.trim()) {
      setGlobalMessage('请填写话题名称')
      return
    }
    setCreatingTopic(true)
    try {
      const res = await fetch('/api/admin/review/create-curation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'topic',
          pids: selectedFavoritePids,
          topicName: topicName.trim(),
          topicSlug: topicSlug.trim() || slugifyTopic(topicName),
          tags: topicTags || undefined,
          topicDescription: topicDescription || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        window.location.href = data.data.editUrl
        return
      }
      setGlobalMessage(data.error || '创建话题专题失败')
    } finally {
      setCreatingTopic(false)
    }
  }

  const toggleReviewSelect = (pid: string) => {
    setSelectedReviewPids((prev) =>
      prev.includes(pid) ? prev.filter((item) => item !== pid) : [...prev, pid]
    )
  }

  const toggleFavoriteSelect = (pid: string) => {
    setSelectedFavoritePids((prev) =>
      prev.includes(pid) ? prev.filter((item) => item !== pid) : [...prev, pid]
    )
  }

  const allReviewSelected = useMemo(
    () => candidates.length > 0 && candidates.every((item) => selectedReviewPids.includes(String(item.id))),
    [candidates, selectedReviewPids]
  )

  const allFavoritesSelected = useMemo(
    () => favorites.length > 0 && favorites.every((item) => selectedFavoritePids.includes(String(item.id))),
    [favorites, selectedFavoritePids]
  )

  const toggleSelectAllReview = () => {
    if (allReviewSelected) {
      setSelectedReviewPids([])
    } else {
      setSelectedReviewPids(candidates.map((item) => String(item.id)))
    }
  }

  const toggleSelectAllFavorites = () => {
    if (allFavoritesSelected) {
      setSelectedFavoritePids([])
    } else {
      setSelectedFavoritePids(favorites.map((item) => String(item.id)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">作品评审与素材库</h1>
          <p className="text-gray-500 mt-1">先在评审池收藏，再从素材库勾选后一键创建栏目</p>
        </div>
        <Link
          href="/admin/artworks/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          手动导入作品
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-2 inline-flex gap-2">
        <button
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            activeTab === 'review' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          评审池
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            activeTab === 'favorites' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          素材库（已收藏）
        </button>
      </div>

      {globalMessage && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-200">
          {globalMessage}
        </div>
      )}

      {activeTab === 'review' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="按标签筛选（可选）"
                value={candidateTag}
                onChange={(e) => setCandidateTag(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
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
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                刷新候选
              </button>
              <button
                onClick={toggleSelectAllReview}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
              >
                {allReviewSelected ? '取消全选' : '全选当前页'}
              </button>
              <button
                onClick={handleBulkFavorite}
                disabled={bulkActionLoading || selectedReviewPids.length === 0}
                className="px-3 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                {bulkActionLoading ? '收藏中...' : `批量收藏 (${selectedReviewPids.length})`}
              </button>
            </div>
            {candidateError && <p className="mt-3 text-sm text-red-600">{candidateError}</p>}
            {tagHistory.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tagHistory.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCandidateTag(item)}
                    className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    #{item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {candidateLoading ? (
              <p className="col-span-full text-center text-gray-500 py-12">加载评审候选中...</p>
            ) : candidates.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-12">暂无可评审候选，点击“刷新候选”再试</p>
            ) : (
              candidates.map((item) => {
                const pid = String(item.id)
                const selected = selectedReviewPids.includes(pid)
                const isActionLoading = actionLoadingPid === pid
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border bg-white overflow-hidden ${
                      selected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
                    }`}
                  >
                    <button type="button" onClick={() => toggleReviewSelect(pid)} className="w-full text-left">
                      <img
                        src={getImageUrl(pid, 'thumb_mini', item.imagePath)}
                        alt={item.title}
                        className="w-full aspect-square object-cover"
                      />
                    </button>
                    <div className="p-2 space-y-1">
                      <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 truncate">PID: {item.id}</p>
                      <p className="text-xs text-gray-500 truncate">{item.artist?.name}</p>
                    </div>
                    <div className="grid grid-cols-3 border-t border-gray-100">
                      <button
                        disabled={isActionLoading}
                        onClick={() => sendReviewAction(pid, 'favorite')}
                        className="py-2 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                        title="收藏"
                      >
                        <Star className="w-3.5 h-3.5 mx-auto" />
                      </button>
                      <button
                        disabled={isActionLoading}
                        onClick={() => sendReviewAction(pid, 'skip')}
                        className="py-2 text-xs text-sky-700 hover:bg-sky-50 disabled:opacity-50"
                        title="跳过"
                      >
                        <Filter className="w-3.5 h-3.5 mx-auto" />
                      </button>
                      <button
                        disabled={isActionLoading}
                        onClick={() => sendReviewAction(pid, 'reject')}
                        className="py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                        title="不合适"
                      >
                        <X className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={favoriteSearch}
                  onChange={(e) => setFavoriteSearch(e.target.value)}
                  placeholder="搜索 PID/标题/作者/标签"
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <input
                type="text"
                value={favoriteTag}
                onChange={(e) => setFavoriteTag(e.target.value)}
                placeholder="标签过滤"
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <input
                type="text"
                value={favoriteArtistId}
                onChange={(e) => setFavoriteArtistId(e.target.value)}
                placeholder="画师 ID"
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <button
                onClick={() => fetchFavorites(1)}
                disabled={favoritesLoading}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
              >
                筛选
              </button>
              <button
                onClick={toggleSelectAllFavorites}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
              >
                {allFavoritesSelected ? '取消全选' : '全选当前页'}
              </button>
            </div>

            {tagHistory.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tagHistory.map((item) => (
                  <button
                    key={item}
                    onClick={() => setFavoriteTag(item)}
                    className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    #{item}
                  </button>
                ))}
              </div>
            )}
            {favoritesError && <p className="text-sm text-red-600">{favoritesError}</p>}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm text-gray-600">
              已选 <span className="font-semibold text-gray-900">{selectedFavoriteCount}</span> 张素材，可直接创建栏目。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favoritesLoading ? (
              <p className="col-span-full text-center text-gray-500 py-12">加载收藏素材中...</p>
            ) : favorites.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-12">暂无收藏素材</p>
            ) : (
              favorites.map((item) => {
                const pid = String(item.id)
                const selected = selectedFavoritePids.includes(pid)
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => toggleFavoriteSelect(pid)}
                    className={`rounded-xl border bg-white overflow-hidden text-left ${
                      selected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={getImageUrl(pid, 'thumb_mini', item.imagePath)}
                      alt={item.title}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 truncate">PID: {item.id}</p>
                      <p className="text-xs text-gray-500 truncate">{item.artist?.name}</p>
                      {selected && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-700">
                          <Check className="w-3 h-3" /> 已勾选
                        </span>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {favoritePagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
              <span className="text-sm text-gray-500">
                共 {favoritePagination.total} 条，{favoritePagination.page}/{favoritePagination.totalPages} 页
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchFavorites(Math.max(1, favoritePagination.page - 1))}
                  disabled={favoritePagination.page <= 1}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm disabled:opacity-40"
                >
                  上一页
                </button>
                <button
                  onClick={() => fetchFavorites(Math.min(favoritePagination.totalPages, favoritePagination.page + 1))}
                  disabled={favoritePagination.page >= favoritePagination.totalPages}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm disabled:opacity-40"
                >
                  下一页
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">从选中素材创建每日精选</h3>
              <input
                type="date"
                value={dailyPickDate}
                onChange={(e) => setDailyPickDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <input
                type="text"
                value={dailyTitle}
                onChange={(e) => setDailyTitle(e.target.value)}
                placeholder="标题（可选）"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <textarea
                value={dailyDescription}
                onChange={(e) => setDailyDescription(e.target.value)}
                placeholder="描述（可选）"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <button
                onClick={handleCreateDaily}
                disabled={creatingDaily || selectedFavoriteCount === 0}
                className="w-full px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {creatingDaily ? '创建中...' : `创建每日精选 (${selectedFavoriteCount})`}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">从选中素材创建话题专题</h3>
              <input
                type="text"
                value={topicName}
                onChange={(e) => {
                  setTopicName(e.target.value)
                  if (!topicSlug) setTopicSlug(slugifyTopic(e.target.value))
                }}
                placeholder="话题名称（必填）"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <input
                type="text"
                value={topicSlug}
                onChange={(e) => setTopicSlug(e.target.value)}
                placeholder="topic-slug（可自动生成）"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <input
                type="text"
                value={topicTags}
                onChange={(e) => setTopicTags(e.target.value)}
                placeholder="标签（逗号分隔）"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <textarea
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                placeholder="话题描述（可选）"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <button
                onClick={handleCreateTopic}
                disabled={creatingTopic || selectedFavoriteCount === 0}
                className="w-full px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
              >
                {creatingTopic ? '创建中...' : `创建话题专题 (${selectedFavoriteCount})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
