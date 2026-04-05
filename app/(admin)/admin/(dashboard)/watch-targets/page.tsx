'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, PencilLine, Play, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react'

type WatchTargetType = 'tag' | 'artist'

interface WatchTargetItem {
  id: number
  target_type: WatchTargetType
  target_value: string
  biz_type: string
  priority: number
  window_days: number
  daily_preview_quota: number
  enabled: boolean
  last_run_at: string | null
  updated_at: string | null
}

interface FormState {
  id?: number
  targetType: WatchTargetType
  targetValue: string
  bizType: string
  priority: number
  windowDays: number
  dailyPreviewQuota: number
  enabled: boolean
}

interface BatchFormState {
  targetType: WatchTargetType
  bizType: string
  priority: number
  windowDays: number
  dailyPreviewQuota: number
  enabled: boolean
  valuesText: string
  runAfterImport: boolean
  perTargetLimit: number
}

interface WatchTargetPreset {
  key: string
  label: string
  description: string
  form: BatchFormState
}

const BATCH_DRAFT_KEY = 'admin_watch_target_batch_draft_v1'

const TARGET_TYPE_OPTIONS: Array<{ value: WatchTargetType; label: string }> = [
  { value: 'tag', label: '标签 Tag' },
  { value: 'artist', label: '画师 Artist ID' },
]

const BIZ_TYPE_OPTIONS = ['avatar', 'wallpaper', 'topic', 'artist', 'general']

const WATCH_TARGET_PRESETS: WatchTargetPreset[] = [
  {
    key: 'avatar-core',
    label: '头像基础池',
    description: '适合先建立头像类预览池，优先级最高。',
    form: {
      targetType: 'tag',
      bizType: 'avatar',
      priority: 950,
      windowDays: 7,
      dailyPreviewQuota: 80,
      enabled: true,
      runAfterImport: true,
      perTargetLimit: 20,
      valuesText: ['头像', 'アイコン', '顔アップ', 'オリジナル'].join('\n'),
    },
  },
  {
    key: 'wallpaper-core',
    label: '壁纸基础池',
    description: '偏壁纸和大场景方向，适合后续做桌面图栏目。',
    form: {
      targetType: 'tag',
      bizType: 'wallpaper',
      priority: 930,
      windowDays: 7,
      dailyPreviewQuota: 80,
      enabled: true,
      runAfterImport: true,
      perTargetLimit: 20,
      valuesText: ['壁纸', '壁紙', '風景', '空', '夜景'].join('\n'),
    },
  },
  {
    key: 'topic-core',
    label: '话题常用池',
    description: '每日美图和专题常用话题，适合长期滚动积累素材。',
    form: {
      targetType: 'tag',
      bizType: 'topic',
      priority: 760,
      windowDays: 7,
      dailyPreviewQuota: 50,
      enabled: true,
      runAfterImport: false,
      perTargetLimit: 20,
      valuesText: ['女孩子', '少女', '制服', 'JK', 'オリジナル', '原神'].join('\n'),
    },
  },
  {
    key: 'artist-core',
    label: '画师观察池',
    description: '先放一批已验证过能抓到作品的画师 ID。',
    form: {
      targetType: 'artist',
      bizType: 'artist',
      priority: 680,
      windowDays: 14,
      dailyPreviewQuota: 30,
      enabled: true,
      runAfterImport: false,
      perTargetLimit: 20,
      valuesText: ['122139903', '326152', '170291', '490219', '163536', '1980643'].join('\n'),
    },
  },
]

function createEmptyForm(): FormState {
  return {
    targetType: 'tag',
    targetValue: '',
    bizType: 'topic',
    priority: 700,
    windowDays: 7,
    dailyPreviewQuota: 50,
    enabled: true,
  }
}

function createEmptyBatchForm(): BatchFormState {
  return {
    targetType: 'tag',
    bizType: 'topic',
    priority: 700,
    windowDays: 7,
    dailyPreviewQuota: 50,
    enabled: true,
    valuesText: '',
    runAfterImport: false,
    perTargetLimit: 20,
  }
}

function toFormState(item: WatchTargetItem): FormState {
  return {
    id: item.id,
    targetType: item.target_type,
    targetValue: item.target_value,
    bizType: item.biz_type,
    priority: item.priority,
    windowDays: item.window_days,
    dailyPreviewQuota: item.daily_preview_quota,
    enabled: item.enabled,
  }
}

function formatTimestamp(value: string | null) {
  if (!value) return '-'
  return value.replace('T', ' ').replace(/\.\d+Z$/, ' UTC')
}

function parseBatchValues(valuesText: string, targetType: WatchTargetType) {
  const rawItems = valuesText
    .split(/[\n,，;；]+/)
    .map((value) => value.trim())
    .filter(Boolean)

  const normalized = rawItems
    .map((value) => {
      if (targetType === 'artist') {
        const match = value.match(/\d+/)
        return match ? match[0] : ''
      }
      return value
    })
    .filter(Boolean)

  return Array.from(new Set(normalized))
}

export default function WatchTargetsPage() {
  const [items, setItems] = useState<WatchTargetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [batchSubmitting, setBatchSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [runningAll, setRunningAll] = useState(false)
  const [runningTargetId, setRunningTargetId] = useState<number | null>(null)
  const [deletingTargetId, setDeletingTargetId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>(createEmptyForm())
  const [batchForm, setBatchForm] = useState<BatchFormState>(createEmptyBatchForm())

  const editing = useMemo(() => typeof form.id === 'number', [form.id])
  const batchValues = useMemo(
    () => parseBatchValues(batchForm.valuesText, batchForm.targetType),
    [batchForm.targetType, batchForm.valuesText]
  )

  const fetchTargets = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)

    setError('')

    try {
      const res = await fetch('/api/admin/watch-targets', { cache: 'no-store' })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || '获取监控源失败')
        return
      }

      setItems(data.data.items || [])
    } catch {
      setError('获取监控源失败')
    } finally {
      if (showRefreshing) setRefreshing(false)
      else setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTargets()
  }, [fetchTargets])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BATCH_DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw) as Partial<BatchFormState>
      setBatchForm((prev) => ({
        ...prev,
        ...draft,
      }))
    } catch {
      // ignore draft restore failures
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(BATCH_DRAFT_KEY, JSON.stringify(batchForm))
    } catch {
      // ignore draft persist failures
    }
  }, [batchForm])

  const resetForm = useCallback(() => {
    setForm(createEmptyForm())
  }, [])

  const resetBatchForm = useCallback(() => {
    setBatchForm(createEmptyBatchForm())
  }, [])

  const handleSubmit = useCallback(async () => {
    const targetValue = form.targetValue.trim()
    const bizType = form.bizType.trim()

    if (!targetValue || !bizType) {
      setError('目标值和业务类型不能为空')
      return
    }

    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/admin/watch-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          id: form.id,
          targetType: form.targetType,
          targetValue,
          bizType,
          priority: form.priority,
          windowDays: form.windowDays,
          dailyPreviewQuota: form.dailyPreviewQuota,
          enabled: form.enabled,
        }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || '保存监控源失败')
        return
      }

      setMessage(editing ? '监控源已更新' : '监控源已创建')
      resetForm()
      await fetchTargets(true)
    } catch {
      setError('保存监控源失败')
    } finally {
      setSubmitting(false)
    }
  }, [editing, fetchTargets, form, resetForm])

  const handleBatchSubmit = useCallback(async () => {
    const bizType = batchForm.bizType.trim()
    if (!bizType) {
      setError('批量导入时必须填写业务类型')
      return
    }

    if (batchValues.length === 0) {
      setError('请至少填写一个标签或画师 ID')
      return
    }

    setBatchSubmitting(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/admin/watch-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch-upsert',
          items: batchValues.map((value) => ({
            targetType: batchForm.targetType,
            targetValue: value,
            bizType,
            priority: batchForm.priority,
            windowDays: batchForm.windowDays,
            dailyPreviewQuota: batchForm.dailyPreviewQuota,
            enabled: batchForm.enabled,
          })),
          runAfterImport: batchForm.runAfterImport,
          perTargetLimit: batchForm.perTargetLimit,
        }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || '批量导入监控源失败')
        return
      }

      const collectMessage = data.data.collectResult?.message
      setMessage(
        collectMessage
          ? `已导入 ${data.data.count} 条监控源。${collectMessage}`
          : `已导入 ${data.data.count} 条监控源。`
      )
      await fetchTargets(true)
    } catch {
      setError('批量导入监控源失败')
    } finally {
      setBatchSubmitting(false)
    }
  }, [batchForm, batchValues, fetchTargets])

  const handleDelete = useCallback(
    async (id: number) => {
      const confirmed = window.confirm('确认删除这条监控源吗？')
      if (!confirmed) return

      setDeletingTargetId(id)
      setError('')
      setMessage('')

      try {
        const res = await fetch('/api/admin/watch-targets', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
        const data = await res.json()

        if (!data.success) {
          setError(data.error || '删除监控源失败')
          return
        }

        if (form.id === id) resetForm()
        setMessage(`已删除监控源 #${id}`)
        await fetchTargets(true)
      } catch {
        setError('删除监控源失败')
      } finally {
        setDeletingTargetId(null)
      }
    },
    [fetchTargets, form.id, resetForm]
  )

  const handleCollect = useCallback(
    async (targetIds?: number[]) => {
      const isSingle = Array.isArray(targetIds) && targetIds.length === 1
      if (isSingle) setRunningTargetId(targetIds[0])
      else setRunningAll(true)

      setError('')
      setMessage('')

      try {
        const res = await fetch('/api/admin/watch-targets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'collect',
            targetIds,
            limitTargets: isSingle ? 1 : undefined,
          }),
        })
        const data = await res.json()

        if (!data.success) {
          setError(data.error || '触发抓取失败')
          return
        }

        setMessage(data.data.message || '已开始抓取')
        await fetchTargets(true)
      } catch {
        setError('触发抓取失败')
      } finally {
        if (isSingle) setRunningTargetId(null)
        else setRunningAll(false)
      }
    },
    [fetchTargets]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">监控源</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理标签与画师监控目标，并可手动触发 `collect-watch-targets` 抓取任务。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchTargets(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <button
            onClick={() => handleCollect()}
            disabled={loading || runningAll}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {runningAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            抓取已启用目标
          </button>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {error || message}
        </div>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? '编辑监控源' : '新建监控源'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              适合逐条精细维护。批量初始化请使用下方的批量导入区域。
            </p>
          </div>
          {editing && (
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              取消编辑
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">目标类型</span>
            <select
              value={form.targetType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  targetType: event.target.value as WatchTargetType,
                  bizType: event.target.value === 'artist' ? 'artist' : prev.bizType,
                }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              {TARGET_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">{form.targetType === 'artist' ? '画师 ID' : '标签'}</span>
            <input
              value={form.targetValue}
              onChange={(event) => setForm((prev) => ({ ...prev, targetValue: event.target.value }))}
              placeholder={form.targetType === 'artist' ? '122139903' : '例如：头像'}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">业务类型</span>
            <input
              list="watch-target-biz-types"
              value={form.bizType}
              onChange={(event) => setForm((prev) => ({ ...prev, bizType: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) => setForm((prev) => ({ ...prev, enabled: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            启用
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">优先级</span>
            <input
              type="number"
              min={0}
              max={1000}
              value={form.priority}
              onChange={(event) => setForm((prev) => ({ ...prev, priority: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">时间窗口天数</span>
            <input
              type="number"
              min={1}
              max={90}
              value={form.windowDays}
              onChange={(event) => setForm((prev) => ({ ...prev, windowDays: Number(event.target.value) || 1 }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">预览配额</span>
            <input
              type="number"
              min={1}
              max={500}
              value={form.dailyPreviewQuota}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dailyPreviewQuota: Number(event.target.value) || 1 }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <div className="flex items-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editing ? (
                <Save className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editing ? '保存修改' : '创建监控源'}
            </button>
          </div>
        </div>

        <datalist id="watch-target-biz-types">
          {BIZ_TYPE_OPTIONS.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">批量导入</h2>
          <p className="mt-1 text-sm text-gray-500">
            一次性导入一批话题标签或画师 ID。已存在项会自动更新，不会重复插入。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {WATCH_TARGET_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => {
                setBatchForm(preset.form)
                setMessage(`已套用预设：${preset.label}`)
                setError('')
              }}
              className="rounded-2xl border border-gray-200 p-4 text-left transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="font-medium text-gray-900">{preset.label}</div>
              <p className="mt-1 text-sm text-gray-500">{preset.description}</p>
              <p className="mt-3 text-xs text-gray-400">
                {preset.form.targetType} / {preset.form.bizType} / {parseBatchValues(preset.form.valuesText, preset.form.targetType).length} 项
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">目标类型</span>
            <select
              value={batchForm.targetType}
              onChange={(event) =>
                setBatchForm((prev) => ({
                  ...prev,
                  targetType: event.target.value as WatchTargetType,
                  bizType: event.target.value === 'artist' ? 'artist' : prev.bizType,
                }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              {TARGET_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">业务类型</span>
            <input
              list="watch-target-biz-types"
              value={batchForm.bizType}
              onChange={(event) => setBatchForm((prev) => ({ ...prev, bizType: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">优先级</span>
            <input
              type="number"
              min={0}
              max={1000}
              value={batchForm.priority}
              onChange={(event) =>
                setBatchForm((prev) => ({ ...prev, priority: Number(event.target.value) || 0 }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">时间窗口天数</span>
            <input
              type="number"
              min={1}
              max={90}
              value={batchForm.windowDays}
              onChange={(event) =>
                setBatchForm((prev) => ({ ...prev, windowDays: Number(event.target.value) || 1 }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">预览配额</span>
            <input
              type="number"
              min={1}
              max={500}
              value={batchForm.dailyPreviewQuota}
              onChange={(event) =>
                setBatchForm((prev) => ({ ...prev, dailyPreviewQuota: Number(event.target.value) || 1 }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">单目标抓取上限</span>
            <input
              type="number"
              min={1}
              max={200}
              value={batchForm.perTargetLimit}
              onChange={(event) =>
                setBatchForm((prev) => ({ ...prev, perTargetLimit: Number(event.target.value) || 1 }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={batchForm.enabled}
              onChange={(event) => setBatchForm((prev) => ({ ...prev, enabled: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            启用
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={batchForm.runAfterImport}
              onChange={(event) =>
                setBatchForm((prev) => ({ ...prev, runAfterImport: event.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            导入后立即抓取
          </label>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{batchForm.targetType === 'artist' ? '画师 ID 列表' : '标签列表'}</span>
            <span className="text-xs text-gray-400">支持换行、英文逗号、中文逗号、分号分隔</span>
          </div>
          <textarea
            value={batchForm.valuesText}
            onChange={(event) => setBatchForm((prev) => ({ ...prev, valuesText: event.target.value }))}
            rows={8}
            placeholder={batchForm.targetType === 'artist' ? '122139903\n326152\n170291' : '头像\n壁纸\n女孩子'}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">本次将处理 {batchValues.length} 条监控源</p>
            <p className="mt-1 text-xs text-gray-500">
              预览：{batchValues.slice(0, 8).join(' / ') || '暂无'}
              {batchValues.length > 8 ? ` ... +${batchValues.length - 8}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetBatchForm}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
            >
              <X className="h-4 w-4" />
              清空草稿
            </button>
            <button
              type="button"
              onClick={handleBatchSubmit}
              disabled={batchSubmitting || batchValues.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {batchSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              批量导入
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              已有监控源 <span className="text-gray-400">({items.length})</span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              这里展示当前已配置的监控源，按爬虫侧优先级排序。你可以单独触发某一条抓取。
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在加载监控源...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
                    暂无监控源。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-3 py-3 font-medium">ID</th>
                  <th className="px-3 py-3 font-medium">目标</th>
                  <th className="px-3 py-3 font-medium">业务</th>
                  <th className="px-3 py-3 font-medium">优先级</th>
                  <th className="px-3 py-3 font-medium">窗口</th>
                  <th className="px-3 py-3 font-medium">配额</th>
                  <th className="px-3 py-3 font-medium">上次运行</th>
                  <th className="px-3 py-3 font-medium">状态</th>
                  <th className="px-3 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const isRunning = runningTargetId === item.id
                  const isDeleting = deletingTargetId === item.id

                  return (
                    <tr key={item.id} className="align-top">
                      <td className="px-3 py-4 font-mono text-xs text-gray-500">{item.id}</td>
                      <td className="px-3 py-4">
                        <div className="font-medium text-gray-900">{item.target_value}</div>
                        <div className="mt-1 text-xs text-gray-500">{item.target_type}</div>
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {item.biz_type}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-gray-700">{item.priority}</td>
                      <td className="px-3 py-4 text-gray-700">{item.window_days}d</td>
                      <td className="px-3 py-4 text-gray-700">{item.daily_preview_quota}</td>
                      <td className="px-3 py-4 text-xs text-gray-500">{formatTimestamp(item.last_run_at)}</td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.enabled
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {item.enabled ? '已启用' : '已停用'}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleCollect([item.id])}
                            disabled={isRunning || runningAll}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isRunning ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                            抓取
                          </button>
                          <button
                            onClick={() => {
                              setForm(toFormState(item))
                              setError('')
                              setMessage('')
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
