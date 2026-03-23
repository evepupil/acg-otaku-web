'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import DataTable from '@/components/admin/DataTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface TopicRow {
  id: number; topicName: string; topicSlug: string; isPublished: boolean
  tags: string[]
  [key: string]: unknown
}

export default function TopicsPage() {
  const [features, setFeatures] = useState<TopicRow[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newTags, setNewTags] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchFeatures = useCallback(async (p: number = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/topic-features?page=${p}&limit=20`)
      const data = await res.json()
      if (data.success) {
        setFeatures(data.data.features)
        setTotal(data.data.pagination.total)
        setPage(p)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFeatures() }, [fetchFeatures])

  const handleCreate = async () => {
    if (!newName || !newSlug) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/topic-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName: newName, topicSlug: newSlug, tags: newTags }),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreate(false)
        setNewName('')
        setNewSlug('')
        setNewTags('')
        fetchFeatures()
      }
    } finally {
      setCreating(false)
    }
  }

  const handleTogglePublish = async (id: number, isPublished: boolean) => {
    await fetch('/api/admin/topic-features', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isPublished: !isPublished }),
    })
    fetchFeatures(page)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/topic-features?id=${deleteId}`, { method: 'DELETE' })
      setDeleteId(null)
      fetchFeatures(page)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'topicName', title: '话题', render: (item: TopicRow) => (
      <Link href={`/admin/topics/${item.id}`} className="text-green-600 hover:underline font-medium">{item.topicName}</Link>
    )},
    { key: 'topicSlug', title: 'Slug', render: (item: TopicRow) => (
      <span className="font-mono text-xs text-gray-500">{item.topicSlug}</span>
    )},
    { key: 'tags', title: '标签', render: (item: TopicRow) => (
      <div className="flex flex-wrap gap-1">
        {item.tags?.slice(0, 3).map((tag, i) => (
          <span key={i} className="px-1.5 py-0.5 text-xs bg-orange-50 text-orange-700 rounded">{tag}</span>
        ))}
      </div>
    )},
    { key: 'status', title: '状态', width: '80px', render: (item: TopicRow) => (
      <button onClick={() => handleTogglePublish(item.id, item.isPublished)} className="p-1.5 rounded-lg hover:bg-gray-100">
        {item.isPublished ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
      </button>
    )},
    { key: 'actions', title: '操作', width: '120px', render: (item: TopicRow) => (
      <div className="flex gap-1">
        <Link href={`/admin/topics/${item.id}`} className="px-2 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200">编辑</Link>
        <button onClick={() => setDeleteId(item.id)} className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">话题专题</h1>
          <p className="text-gray-500 mt-1">管理话题鉴赏专题</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-amber-700 transition-all">
          <Plus className="w-4 h-4" />
          新建话题
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">新建话题专题</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">话题名称</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例：赛博朋克"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL标识)</label>
              <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="例：cyberpunk"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标签 (逗号分隔)</label>
              <input type="text" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="例：赛博朋克,科幻,未来"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={creating}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
              {creating ? '创建中...' : '创建'}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">
              取消
            </button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={features} page={page}
        totalPages={Math.ceil(total / 20)} total={total} onPageChange={fetchFeatures} loading={loading} />

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="删除话题专题" message="确认删除此话题专题？" confirmText="删除" loading={deleting} />
    </div>
  )
}
