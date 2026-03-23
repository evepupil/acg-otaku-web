'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import DataTable from '@/components/admin/DataTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { getImageUrl } from '@/lib/pixiv-proxy'
import type { Artwork, Pagination } from '@/types'

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchArtworks = useCallback(async (page: number = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/artwork?${params}`)
      const data = await res.json()
      if (data.success) {
        setArtworks(data.data.artworks)
        setPagination(data.data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchArtworks()
  }, [fetchArtworks])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/artwork?pid=${deleteTarget}`, { method: 'DELETE' })
      setDeleteTarget(null)
      fetchArtworks(pagination.page)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'id',
      title: 'PID',
      width: '100px',
      render: (item: Artwork) => (
        <span className="font-mono text-xs">{item.id}</span>
      )
    },
    {
      key: 'image',
      title: '封面',
      width: '80px',
      render: (item: Artwork) => (
        <img
          src={getImageUrl(String(item.id), 'thumb_mini', item.imagePath)}
          alt={item.title}
          className="w-12 h-12 object-cover rounded-lg"
        />
      )
    },
    {
      key: 'title',
      title: '标题',
      render: (item: Artwork) => (
        <div>
          <p className="font-medium text-gray-900 truncate max-w-[200px]">{item.title}</p>
          <p className="text-xs text-gray-500">{item.artist?.name}</p>
        </div>
      )
    },
    {
      key: 'tags',
      title: '标签',
      render: (item: Artwork) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {item.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">{tag}</span>
          ))}
          {item.tags.length > 3 && <span className="text-xs text-gray-400">+{item.tags.length - 3}</span>}
        </div>
      )
    },
    {
      key: 'stats',
      title: '数据',
      render: (item: Artwork) => (
        <div className="text-xs text-gray-500 space-y-0.5">
          <div>浏览 {item.stats?.views?.toLocaleString()}</div>
          <div>收藏 {item.stats?.bookmarks?.toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'actions',
      title: '操作',
      width: '80px',
      render: (item: Artwork) => (
        <button
          onClick={() => setDeleteTarget(String(item.id))}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">作品管理</h1>
          <p className="text-gray-500 mt-1">管理所有已收录的作品</p>
        </div>
        <Link
          href="/admin/artworks/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          添加作品
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索PID、标题、作者、标签..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchArtworks(1)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
          />
        </div>
        <button
          onClick={() => fetchArtworks(1)}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          搜索
        </button>
      </div>

      <DataTable
        columns={columns}
        data={artworks}
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={fetchArtworks}
        loading={loading}
        emptyText="暂无作品，点击右上角添加"
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="删除作品"
        message={`确认删除作品 ${deleteTarget}？此操作不可撤销。`}
        confirmText="删除"
        loading={deleting}
      />
    </div>
  )
}
