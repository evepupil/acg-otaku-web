'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PixivPreview {
  pid: string
  title: string
  authorName: string
  tags: string[]
  viewCount: number
  likeCount: number
  bookmarkCount: number
}

export default function AddArtworkPage() {
  const router = useRouter()
  const [pidInput, setPidInput] = useState('')
  const [downloadImages, setDownloadImages] = useState(true)
  const [preview, setPreview] = useState<PixivPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [batchMode, setBatchMode] = useState(false)
  const [batchPids, setBatchPids] = useState('')
  const [batchResults, setBatchResults] = useState<Array<{ pid: string; success: boolean; error?: string }>>([])

  // 单个预览
  const handlePreview = async () => {
    const pid = pidInput.trim()
    if (!pid) return
    setError('')
    setLoading(true)
    setPreview(null)

    try {
      const res = await fetch(`/api/admin/artwork/preview?pid=${pid}`)
      const data = await res.json()
      if (data.success) {
        setPreview(data.data)
      } else {
        setError(data.error || '获取预览失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  // 单个添加
  const handleSubmit = async () => {
    const pid = pidInput.trim()
    if (!pid) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/admin/artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, downloadImages }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/admin/artworks')
      } else {
        setError(data.error || '添加失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setSubmitting(false)
    }
  }

  // 批量添加
  const handleBatchSubmit = async () => {
    const pids = batchPids.split(/[\n,\s]+/).map(s => s.trim()).filter(Boolean)
    if (pids.length === 0) return
    setSubmitting(true)
    setError('')
    setBatchResults([])

    try {
      const res = await fetch('/api/admin/artwork/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pids, downloadImages }),
      })
      const data = await res.json()
      if (data.success) {
        setBatchResults(data.data.results)
      } else {
        setError(data.error || '批量添加失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/artworks" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">添加作品</h1>
          <p className="text-gray-500 mt-1">通过Pixiv PID添加作品到数据库</p>
        </div>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => setBatchMode(false)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!batchMode ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          单个添加
        </button>
        <button
          onClick={() => setBatchMode(true)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${batchMode ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          批量添加
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        {!batchMode ? (
          <>
            {/* 单个模式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pixiv PID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pidInput}
                  onChange={(e) => setPidInput(e.target.value)}
                  placeholder="例如: 12345678"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
                />
                <button
                  onClick={handlePreview}
                  disabled={loading || !pidInput.trim()}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '预览'}
                </button>
              </div>
            </div>

            {/* 预览 */}
            {preview && (
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="font-medium text-gray-900">{preview.title}</p>
                <p className="text-sm text-gray-500">作者: {preview.authorName}</p>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>浏览 {preview.viewCount.toLocaleString()}</span>
                  <span>收藏 {preview.bookmarkCount.toLocaleString()}</span>
                  <span>点赞 {preview.likeCount.toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {preview.tags.slice(0, 10).map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs bg-white rounded-full border">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !pidInput.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              添加作品
            </button>
          </>
        ) : (
          <>
            {/* 批量模式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pixiv PID列表</label>
              <textarea
                value={batchPids}
                onChange={(e) => setBatchPids(e.target.value)}
                placeholder="每行一个PID，或用逗号/空格分隔&#10;例如:&#10;12345678&#10;23456789&#10;34567890"
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">
                已输入 {batchPids.split(/[\n,\s]+/).filter(Boolean).length} 个PID
              </p>
            </div>

            <button
              onClick={handleBatchSubmit}
              disabled={submitting || !batchPids.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              批量添加
            </button>

            {/* 批量结果 */}
            {batchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  结果: {batchResults.filter(r => r.success).length}/{batchResults.length} 成功
                </p>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {batchResults.map((r, i) => (
                    <div key={i} className={`px-3 py-1.5 rounded-lg text-xs ${r.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      PID {r.pid}: {r.success ? '成功' : r.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 下载选项 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={downloadImages}
            onChange={(e) => setDownloadImages(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
          />
          <Download className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">下载图片到B2存储</span>
        </label>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</div>
        )}
      </div>
    </div>
  )
}
