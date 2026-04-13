'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Filter, Plus, RefreshCw, Search, Star, X } from 'lucide-react'
import Link from 'next/link'
import { getAvailableImageSizes, getImageUrl, type ImageSize } from '@/lib/pixiv-proxy'
import type { Artwork, Pagination } from '@/types'

type TabType = 'review' | 'favorites'
type DownloadStatusFilter = 'any' | 'preview' | 'regular' | 'original'
type CandidatePool = 'general' | 'ranking' | 'daily' | 'artist' | 'topic' | 'avatar' | 'wallpaper'
type AdminArtwork = Artwork & {
  candidateScore?: number
  candidateSourceType?: string
  candidateSourceKey?: string
  candidateBizType?: string
  candidateDownloadStage?: 'none' | 'preview' | 'full'
}
const DOWNLOAD_STATUS_SIZES: ImageSize[] = ['thumb_mini', 'small', 'regular', 'original']
const DOWNLOAD_STATUS_LABELS: Record<ImageSize, string> = {
  thumb_mini: 'mini',
  small: 'small',
  regular: 'regular',
  original: 'original',
}

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

function getDownloadBadgeClass(size: ImageSize, active: boolean) {
  if (!active) {
    return 'bg-gray-100 text-gray-400'
  }

  if (size === 'original') {
    return 'bg-emerald-100 text-emerald-700'
  }

  if (size === 'regular') {
    return 'bg-sky-100 text-sky-700'
  }

  return 'bg-amber-100 text-amber-700'
}

export default function ArtworksPage() {
  const [activeTab, setActiveTab] = useState<TabType>('review')

  const [candidateTag, setCandidateTag] = useState('')
  const [candidatePool, setCandidatePool] = useState<CandidatePool>('general')
  const [candidateArtistId, setCandidateArtistId] = useState('')
  const [candidateTopN, setCandidateTopN] = useState(200)
  const [candidateLimit, setCandidateLimit] = useState(30)
  const [candidateOnlyDownloaded, setCandidateOnlyDownloaded] = useState(true)
  const [candidateDownloadStatus, setCandidateDownloadStatus] = useState<DownloadStatusFilter>('any')
  const [candidateLoading, setCandidateLoading] = useState(false)
  const [candidateError, setCandidateError] = useState('')
  const [candidates, setCandidates] = useState<AdminArtwork[]>([])
  const [selectedReviewPids, setSelectedReviewPids] = useState<string[]>([])

  const [favorites, setFavorites] = useState<AdminArtwork[]>([])
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
  const [favoriteDownloadStatus, setFavoriteDownloadStatus] = useState<DownloadStatusFilter>('any')
  const [favoriteSortBy, setFavoriteSortBy] = useState<'reviewed_desc' | 'pid_desc'>('reviewed_desc')
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
  const [crawlerActionLoading, setCrawlerActionLoading] = useState<'refresh-candidate-score' | 'run-backfill-preview' | null>(null)
  const [candidateScoreRefreshLimit, setCandidateScoreRefreshLimit] = useState(200)
  const [backfillPreviewLimit, setBackfillPreviewLimit] = useState(30)
  const [backfillPreviewMinAgeDays, setBackfillPreviewMinAgeDays] = useState(30)
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
        pool: candidatePool,
        limit: String(candidateLimit),
        topN: String(candidateTopN),
        excludePublished: 'true',
        onlyDownloaded: candidateOnlyDownloaded ? 'true' : 'false',
        downloadStatus: candidateDownloadStatus,
      })
      if (candidateTag.trim()) params.set('tag', candidateTag.trim())
      if (candidatePool === 'artist' && candidateArtistId.trim()) params.set('artistId', candidateArtistId.trim())

      const res = await fetch(`/api/admin/review/candidates?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setCandidates(data.data.artworks || [])
        setSelectedReviewPids([])
        if (candidateTag.trim() && candidatePool !== 'artist' && candidatePool !== 'ranking' && candidatePool !== 'daily') {
          saveTagHistory(candidateTag.trim())
        }
      } else {
        setCandidateError(data.error || '获取评审候选失败')
      }
    } catch {
      setCandidateError('获取评审候选失败')
    } finally {
      setCandidateLoading(false)
    }
  }, [
    candidateArtistId,
    candidateDownloadStatus,
    candidateLimit,
    candidateOnlyDownloaded,
    candidatePool,
    candidateTag,
    candidateTopN,
    saveTagHistory,
  ])

  const fetchFavorites = useCallback(async (page = 1) => {
    setFavoritesLoading(true)
    setFavoritesError('')
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(favoritePagination.limit || 24),
        excludePublished: 'true',
        downloadStatus: favoriteDownloadStatus,
      })
      if (favoriteSearch.trim()) params.set('search', favoriteSearch.trim())
      if (favoriteTag.trim()) params.set('tag', favoriteTag.trim())
      if (favoriteArtistId.trim()) params.set('artistId', favoriteArtistId.trim())
      params.set('sortBy', favoriteSortBy)

      const res = await fetch(`/api/admin/review/favorites?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setFavorites(data.data.artworks || [])
        setFavoritePagination(data.data.pagination)
        if (favoriteTag.trim()) saveTagHistory(favoriteTag.trim())
      } else {
        setFavoritesError(data.error || '鑾峰彇鏀惰棌绱犳潗澶辫触')
      }
    } catch {
      setFavoritesError('鑾峰彇鏀惰棌绱犳潗澶辫触')
    } finally {
      setFavoritesLoading(false)
    }
  }, [favoriteArtistId, favoriteDownloadStatus, favoritePagination.limit, favoriteSearch, favoriteSortBy, favoriteTag, saveTagHistory])

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

  const handleRefreshCandidateScore = useCallback(async () => {
    setCrawlerActionLoading('refresh-candidate-score')
    setGlobalMessage('')
    try {
      const res = await fetch('/api/admin/review/crawler-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refresh-candidate-score',
          limit: candidateScoreRefreshLimit,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setGlobalMessage(data.error || '鍒锋柊绯荤粺璇勫垎澶辫触')
        return
      }

      setGlobalMessage(`系统评分刷新完成：更新 ${data.data.updatedCount} 条记录`)
      await fetchCandidates()
      if (activeTab === 'favorites') {
        await fetchFavorites(favoritePagination.page || 1)
      }
    } catch {
      setGlobalMessage('鍒锋柊绯荤粺璇勫垎澶辫触')
    } finally {
      setCrawlerActionLoading(null)
    }
  }, [activeTab, candidateScoreRefreshLimit, favoritePagination.page, fetchCandidates, fetchFavorites])

  const handleRunBackfillPreview = useCallback(async () => {
    setCrawlerActionLoading('run-backfill-preview')
    setGlobalMessage('')
    try {
      const res = await fetch('/api/admin/review/crawler-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run-backfill-preview',
          limit: backfillPreviewLimit,
          minAgeDays: backfillPreviewMinAgeDays,
          dryRun: false,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setGlobalMessage(data.error || '触发补预览失败')
        return
      }

      const result = data.data
      setGlobalMessage(
        `补预览已启动：候选 ${result.candidateCount}，入队 ${result.enqueuedCount}，执行 ${result.claimedCount}`
      )
      await fetchCandidates()
    } catch {
      setGlobalMessage('触发补预览失败')
    } finally {
      setCrawlerActionLoading(null)
    }
  }, [backfillPreviewLimit, backfillPreviewMinAgeDays, fetchCandidates])

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
        setGlobalMessage(data.error || '鍐欏叆璇勫鍔ㄤ綔澶辫触')
        return false
      }

      setCandidates((prev) => prev.filter((item) => String(item.id) !== pid))
      setSelectedReviewPids((prev) => prev.filter((item) => item !== pid))
      if (action === 'favorite') {
        const archiveMessage =
          typeof data?.data?.archiveMessage === 'string' ? data.data.archiveMessage : ''
        setGlobalMessage(archiveMessage || `宸叉敹钘?PID ${pid}`)
      }
      return true
    } catch {
      setGlobalMessage('鍐欏叆璇勫鍔ㄤ綔澶辫触')
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
    setGlobalMessage(`鎵归噺鏀惰棌瀹屾垚: ${success}/${selectedReviewPids.length}`)
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
      setGlobalMessage(data.error || '鍒涘缓姣忔棩缇庡浘澶辫触')
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
      setGlobalMessage(data.error || '鍒涘缓璇濋涓撻澶辫触')
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
          <h1 className="text-2xl font-bold text-gray-900">浣滃搧璇勫涓庣礌鏉愬簱</h1>
          <p className="text-gray-500 mt-1">先在评审池收藏，再从素材库里勾选，直接创建栏目。</p>
        </div>
        <Link
          href="/admin/artworks/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          鎵嬪姩瀵煎叆浣滃搧
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-2 inline-flex gap-2">
        <button
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            activeTab === 'review' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          璇勫姹?
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            activeTab === 'favorites' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          绱犳潗搴擄紙宸叉敹钘忥級
        </button>
      </div>

      {globalMessage && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-200">
          {globalMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Crawler 鎵嬪姩浠诲姟</h2>
          <p className="mt-1 text-xs text-gray-500">
            璇勫姹犱細浼樺厛鍙傝€?`candidate_score`銆傝繖閲屽彲浠ユ墜鍔ㄥ埛鏂拌瘎鍒嗭紝鎴栧湪鍏抽棴鑷姩琛ヨ€佸浘鐨勫墠鎻愪笅锛屼复鏃惰ˉ涓€鎵硅€佸浘棰勮銆?          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="number"
            min={1}
            max={2000}
            value={candidateScoreRefreshLimit}
            onChange={(e) => setCandidateScoreRefreshLimit(Math.max(1, Number(e.target.value) || 1))}
            className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm"
            title="鍒锋柊璇勫垎鏁伴噺"
          />
          <button
            onClick={handleRefreshCandidateScore}
            disabled={crawlerActionLoading !== null}
            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {crawlerActionLoading === 'refresh-candidate-score' ? '鍒锋柊涓?..' : '鍒锋柊绯荤粺璇勫垎'}
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <input
            type="number"
            min={1}
            max={500}
            value={backfillPreviewLimit}
            onChange={(e) => setBackfillPreviewLimit(Math.max(1, Number(e.target.value) || 1))}
            className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm"
            title="补预览数量"
          />
          <input
            type="number"
            min={1}
            max={3650}
            value={backfillPreviewMinAgeDays}
            onChange={(e) => setBackfillPreviewMinAgeDays(Math.max(1, Number(e.target.value) || 1))}
            className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm"
            title="鏈€灏忚€佸浘澶╂暟"
          />
          <button
            onClick={handleRunBackfillPreview}
            disabled={crawlerActionLoading !== null}
            className="px-3 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
          >
            {crawlerActionLoading === 'run-backfill-preview' ? '鎵ц涓?..' : '鎵嬪姩琛ヨ€佸浘棰勮'}
          </button>
        </div>
      </div>

      {activeTab === 'review' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={candidatePool}
                onChange={(e) => setCandidatePool(e.target.value as CandidatePool)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
              >
                <option value="general">通用评审池</option>
                <option value="ranking">榜单池</option>
                <option value="daily">每日美图池</option>
                <option value="topic">话题池</option>
                <option value="avatar">头像池</option>
                <option value="wallpaper">壁纸池</option>
                <option value="artist">画师池</option>
              </select>
              <input
                type="text"
                placeholder={
                  candidatePool === 'artist'
                    ? '可选标签补充过滤'
                    : candidatePool === 'topic'
                      ? '话题标签，可填多个'
                      : candidatePool === 'avatar'
                        ? '头像标签补充过滤'
                        : candidatePool === 'wallpaper'
                          ? '壁纸标签补充过滤'
                          : '按标签筛选（可选）'
                }
                value={candidateTag}
                onChange={(e) => setCandidateTag(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              {candidatePool === 'artist' && (
                <input
                  type="text"
                  placeholder="画师 ID（可选）"
                  value={candidateArtistId}
                  onChange={(e) => setCandidateArtistId(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              )}
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
              <select
                value={candidateDownloadStatus}
                onChange={(e) => setCandidateDownloadStatus(e.target.value as DownloadStatusFilter)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
              >
                <option value="any">全部下载状态</option>
                <option value="preview">浠?preview</option>
                <option value="regular">宸叉湁 regular</option>
                <option value="original">宸叉湁 original</option>
              </select>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-gray-50">
                <input
                  type="checkbox"
                  checked={candidateOnlyDownloaded}
                  onChange={(e) => setCandidateOnlyDownloaded(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>仅看已下载素材</span>
              </label>
              <button
                onClick={fetchCandidates}
                disabled={candidateLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                鍒锋柊鍊欓€?
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
              <p className="col-span-full text-center text-gray-500 py-12">鍔犺浇璇勫鍊欓€変腑...</p>
            ) : candidates.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-12">暂无可审核候选，点击“刷新候选”再试</p>
            ) : (
              candidates.map((item) => {
                const pid = String(item.id)
                const selected = selectedReviewPids.includes(pid)
                const isActionLoading = actionLoadingPid === pid
                const availableSizes = new Set(getAvailableImageSizes(item.imagePath))
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
                      <p className="text-[11px] text-emerald-700 truncate">
                        绯荤粺璇勫垎: {typeof item.candidateScore === 'number' ? item.candidateScore.toFixed(1) : '--'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        来源: {item.candidateSourceType || item.candidateBizType || '--'}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {DOWNLOAD_STATUS_SIZES.map((size) => {
                          const active = availableSizes.has(size)
                          return (
                            <span
                              key={size}
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getDownloadBadgeClass(size, active)}`}
                            >
                              {DOWNLOAD_STATUS_LABELS[size]}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-t border-gray-100">
                      <button
                        disabled={isActionLoading}
                        onClick={() => sendReviewAction(pid, 'favorite')}
                        className="py-2 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                        title="鏀惰棌"
                      >
                        <Star className="w-3.5 h-3.5 mx-auto" />
                      </button>
                      <button
                        disabled={isActionLoading}
                        onClick={() => sendReviewAction(pid, 'skip')}
                        className="py-2 text-xs text-sky-700 hover:bg-sky-50 disabled:opacity-50"
                        title="璺宠繃"
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
                  placeholder="鎼滅储 PID/鏍囬/浣滆€?鏍囩"
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <input
                type="text"
                value={favoriteTag}
                onChange={(e) => setFavoriteTag(e.target.value)}
                placeholder="鏍囩杩囨护"
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <input
                type="text"
                value={favoriteArtistId}
                onChange={(e) => setFavoriteArtistId(e.target.value)}
                placeholder="鐢诲笀 ID"
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <select
                value={favoriteDownloadStatus}
                onChange={(e) => setFavoriteDownloadStatus(e.target.value as DownloadStatusFilter)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
              >
                <option value="any">全部下载状态</option>
                <option value="preview">浠?preview</option>
                <option value="regular">宸叉湁 regular</option>
                <option value="original">宸叉湁 original</option>
              </select>
              <select
                value={favoriteSortBy}
                onChange={(e) => setFavoriteSortBy(e.target.value as 'reviewed_desc' | 'pid_desc')}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
              >
                <option value="reviewed_desc">按收藏时间</option>
                <option value="pid_desc">按 PID 从新到旧</option>
              </select>
              <button
                onClick={() => fetchFavorites(1)}
                disabled={favoritesLoading}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
              >
                绛涢€?
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
              宸查€?<span className="font-semibold text-gray-900">{selectedFavoriteCount}</span> 寮犵礌鏉愶紝鍙洿鎺ュ垱寤烘爮鐩€?
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favoritesLoading ? (
              <p className="col-span-full text-center text-gray-500 py-12">鍔犺浇鏀惰棌绱犳潗涓?..</p>
            ) : favorites.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-12">鏆傛棤鏀惰棌绱犳潗</p>
            ) : (
              favorites.map((item) => {
                const pid = String(item.id)
                const selected = selectedFavoritePids.includes(pid)
                const availableSizes = new Set(getAvailableImageSizes(item.imagePath))
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
                      <p className="text-[11px] text-emerald-700 truncate">
                        绯荤粺璇勫垎: {typeof item.candidateScore === 'number' ? item.candidateScore.toFixed(1) : '--'}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {DOWNLOAD_STATUS_SIZES.map((size) => {
                          const active = availableSizes.has(size)
                          return (
                            <span
                              key={size}
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getDownloadBadgeClass(size, active)}`}
                            >
                              {DOWNLOAD_STATUS_LABELS[size]}
                            </span>
                          )
                        })}
                      </div>
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
                鍏?{favoritePagination.total} 鏉★紝{favoritePagination.page}/{favoritePagination.totalPages} 椤?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchFavorites(Math.max(1, favoritePagination.page - 1))}
                  disabled={favoritePagination.page <= 1}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm disabled:opacity-40"
                >
                  涓婁竴椤?
                </button>
                <button
                  onClick={() => fetchFavorites(Math.min(favoritePagination.totalPages, favoritePagination.page + 1))}
                  disabled={favoritePagination.page >= favoritePagination.totalPages}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm disabled:opacity-40"
                >
                  涓嬩竴椤?
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
                placeholder="鏍囬锛堝彲閫夛級"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <textarea
                value={dailyDescription}
                onChange={(e) => setDailyDescription(e.target.value)}
                placeholder="鎻忚堪锛堝彲閫夛級"
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
                placeholder="璇濋鍚嶇О锛堝繀濉級"
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
                placeholder="璇濋鎻忚堪锛堝彲閫夛級"
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



