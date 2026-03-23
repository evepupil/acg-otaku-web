'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import DataTable from '@/components/admin/DataTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface ArtistRow {
  id: number
  artistName: string
  featureTitle: string
  isPublished: boolean
  createdAt: string
  [key: string]: unknown
}

export default function ArtistsPage() {
  const [features, setFeatures] = useState<ArtistRow[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [newArtistId, setNewArtistId] = useState('')
  const [newArtistName, setNewArtistName] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchFeatures = useCallback(async (p: number = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/artist-features?page=${p}&limit=20`)
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
    if (!newArtistId || !newArtistName || !newTitle) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/artist-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId: newArtistId, artistName: newArtistName, featureTitle: newTitle }),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreate(false)
        setNewArtistId('')
        setNewArtistName('')
        setNewTitle('')
        fetchFeatures()
      }
    } finally {
      setCreating(false)
    }
  }

  const handleTogglePublish = async (id: number, isPublished: boolean) => {
    await fetch('/api/admin/artist-features', {
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
      await fetch(`/api/admin/artist-features?id=${deleteId}`, { method: 'DELETE' })
      setDeleteId(null)
      fetchFeatures(page)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'artistName', title: '画师', render: (item: ArtistRow) => (
      <span className="font-medium">{item.artistName}</span>
    )},
    { key: 'featureTitle', title: '专题标题', render: (item: ArtistRow) => (
      <Link href={`/admin/artists/${item.id}`} className="text-green-600 hover:underline">
        {item.featureTitle}
      </Link>
    )},
    { key: 'status', title: '状态', width: '80px', render: (item: ArtistRow) => (
      <button onClick={() => handleTogglePublish(item.id, item.isPublished)} className="p-1.5 rounded-lg hover:bg-gray-100">
        {item.isPublished ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
      </button>
    )},
    { key: 'actions', title: '操作', width: '120px', render: (item: ArtistRow) => (
      <div className="flex gap-1">
        <Link href={`/admin/artists/${item.id}`} className="px-2 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200">编辑</Link>
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
          <h1 className="text-2xl font-bold text-gray-900">画师专题</h1>
          <p className="text-gray-500 mt-1">管理画师鉴赏专题</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl text-sm font-medium hover:from-purple-600 hover:to-violet-700 transition-all">
          <Plus className="w-4 h-4" />
          新建专题
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">新建画师专题</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">画师ID (Pixiv)</label>
              <input type="text" value={newArtistId} onChange={(e) => setNewArtistId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">画师名称</label>
              <input type="text" value={newArtistName} onChange={(e) => setNewArtistName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">专题标题</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={creating}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
              {creating ? '创建中...' : '创建'}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">
              取消
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={features}
        page={page}
        totalPages={Math.ceil(total / 20)}
        total={total}
        onPageChange={fetchFeatures}
        loading={loading}
      />

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="删除画师专题" message="确认删除此画师专题？" confirmText="删除" loading={deleting} />
    </div>
  )
}
