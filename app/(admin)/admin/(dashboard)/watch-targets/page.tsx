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

const TARGET_TYPE_OPTIONS: Array<{ value: WatchTargetType; label: string }> = [
  { value: 'tag', label: '\u6807\u7b7e Tag' },
  { value: 'artist', label: '\u753b\u5e08 Artist ID' },
]

const BIZ_TYPE_OPTIONS = [
  'avatar',
  'wallpaper',
  'topic',
  'artist',
  'general',
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

export default function WatchTargetsPage() {
  const [items, setItems] = useState<WatchTargetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [runningAll, setRunningAll] = useState(false)
  const [runningTargetId, setRunningTargetId] = useState<number | null>(null)
  const [deletingTargetId, setDeletingTargetId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>(createEmptyForm())

  const editing = useMemo(() => typeof form.id === 'number', [form.id])

  const fetchTargets = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)

    setError('')

    try {
      const res = await fetch('/api/admin/watch-targets', { cache: 'no-store' })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to load watch targets')
        return
      }

      setItems(data.data.items || [])
    } catch {
      setError('Failed to load watch targets')
    } finally {
      if (showRefreshing) setRefreshing(false)
      else setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTargets()
  }, [fetchTargets])

  const resetForm = useCallback(() => {
    setForm(createEmptyForm())
  }, [])

  const handleSubmit = useCallback(async () => {
    const targetValue = form.targetValue.trim()
    const bizType = form.bizType.trim()

    if (!targetValue || !bizType) {
      setError('Target value and biz type are required')
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
        setError(data.error || 'Failed to save watch target')
        return
      }

      setMessage(editing ? 'Watch target updated' : 'Watch target created')
      resetForm()
      await fetchTargets(true)
    } catch {
      setError('Failed to save watch target')
    } finally {
      setSubmitting(false)
    }
  }, [editing, fetchTargets, form, resetForm])

  const handleDelete = useCallback(async (id: number) => {
    const confirmed = window.confirm('Delete this watch target?')
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
        setError(data.error || 'Failed to delete watch target')
        return
      }

      if (form.id === id) resetForm()
      setMessage(`Watch target #${id} deleted`)
      await fetchTargets(true)
    } catch {
      setError('Failed to delete watch target')
    } finally {
      setDeletingTargetId(null)
    }
  }, [fetchTargets, form.id, resetForm])

  const handleCollect = useCallback(async (targetIds?: number[]) => {
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
        setError(data.error || 'Failed to start collection')
        return
      }

      setMessage(data.data.message || 'Collection started')
      await fetchTargets(true)
    } catch {
      setError('Failed to start collection')
    } finally {
      if (isSingle) setRunningTargetId(null)
      else setRunningAll(false)
    }
  }, [fetchTargets])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">\u76d1\u63a7\u6e90 / Watch Targets</h1>
          <p className="mt-1 text-sm text-gray-500">
            \u7ba1\u7406 tag / artist \u6293\u53d6\u76ee\u6807\uff0c\u5e76\u624b\u52a8\u89e6\u53d1 collect-watch-targets\u3002
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchTargets(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => handleCollect()}
            disabled={loading || runningAll}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {runningAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Enabled Targets
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
              {editing ? '\u7f16\u8f91 Watch Target' : '\u65b0\u5efa Watch Target'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              avatar / wallpaper / topic / artist \u90fd\u7528\u540c\u4e00\u5957\u914d\u7f6e\u3002
            </p>
          </div>
          {editing && (
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">Target Type</span>
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
            <span className="font-medium text-gray-700">
              {form.targetType === 'artist' ? 'Artist ID' : 'Tag'}
            </span>
            <input
              value={form.targetValue}
              onChange={(event) => setForm((prev) => ({ ...prev, targetValue: event.target.value }))}
              placeholder={form.targetType === 'artist' ? '122139903' : '\u4f8b\u5982\uff1a\u5934\u50cf'}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">Biz Type</span>
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
            Enabled
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-gray-700">Priority</span>
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
            <span className="font-medium text-gray-700">Window Days</span>
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
            <span className="font-medium text-gray-700">Preview Quota</span>
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
              {editing ? 'Save changes' : 'Create target'}
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
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              \u5df2\u6709 Targets <span className="text-gray-400">({items.length})</span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              \u9ed8\u8ba4\u4f1a\u6309 priority \u6392\u5e8f\uff0c\u624b\u52a8 Run \u53ef\u4ee5\u5355\u72ec\u89e6\u53d1\u67d0\u6761\u76ee\u6807\u3002
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading watch targets...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
            No watch targets yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-3 py-3 font-medium">ID</th>
                  <th className="px-3 py-3 font-medium">Target</th>
                  <th className="px-3 py-3 font-medium">Biz</th>
                  <th className="px-3 py-3 font-medium">Priority</th>
                  <th className="px-3 py-3 font-medium">Window</th>
                  <th className="px-3 py-3 font-medium">Quota</th>
                  <th className="px-3 py-3 font-medium">Last Run</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium text-right">Actions</th>
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
                          {item.enabled ? 'enabled' : 'disabled'}
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
                            Run
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
                            Edit
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
                            Delete
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
