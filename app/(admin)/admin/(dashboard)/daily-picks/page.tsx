'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Eye, EyeOff, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import DataTable from '@/components/admin/DataTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface DailyPickRow {
  id: number
  pickDate: string
  pickType: string
  title: string
  isPublished: boolean
  [key: string]: unknown
}

export default function DailyPicksPage() {
  const [picks, setPicks] = useState<DailyPickRow[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 创建表单
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newType, setNewType] = useState('daily_art')
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchPicks = useCallback(async (p: number = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/daily-picks?page=${p}&limit=20`)
      const data = await res.json()
      if (data.success) {
        setPicks(data.data.picks)
        setTotal(data.data.pagination.total)
        setPage(p)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPicks() }, [fetchPicks])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/admin/daily-picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickDate: newDate, pickType: newType, title: newTitle }),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreate(false)
        setNewTitle('')
        fetchPicks()
      }
    } finally {
      setCreating(false)
    }
  }

  const handleTogglePublish = async (id: number, isPublished: boolean) => {
    await fetch('/api/admin/daily-picks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isPublished: !isPublished }),
    })
    fetchPicks(page)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/daily-picks?id=${deleteId}`, { method: 'DELETE' })
      setDeleteId(null)
      fetchPicks(page)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'pickDate', title: '日期', width: '120px', render: (item: DailyPickRow) => (
      <span className="font-mono text-sm">{item.pickDate}</span>
    )},
    { key: 'pickType', title: '类型', width: '120px', render: (item: DailyPickRow) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.pickType === 'ranking_pick' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
        {item.pickType === 'ranking_pick' ? '排行精选' : '每日美图'}
      </span>
    )},
    { key: 'title', title: '标题', render: (item: DailyPickRow) => (
      <Link href={`/admin/daily-picks/${item.id}`} className="text-green-600 hover:underline font-medium">
        {item.title || '(未命名)'}
      </Link>
    )},
    { key: 'status', title: '状态', width: '80px', render: (item: DailyPickRow) => (
      <button onClick={() => handleTogglePublish(item.id, item.isPublished)} className="p-1.5 rounded-lg hover:bg-gray-100">
        {item.isPublished ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
      </button>
    )},
    { key: 'actions', title: '操作', width: '120px', render: (item: DailyPickRow) => (
      <div className="flex gap-1">
        <Link href={`/admin/daily-picks/${item.id}`} className="px-2 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200">编辑</Link>
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
          <h1 className="text-2xl font-bold text-gray-900">每日精选</h1>
          <p className="text-gray-500 mt-1">管理排行精选和每日美图</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          新建精选
        </button>
      </div>

      {/* 创建面板 */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">新建每日精选</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm">
                <option value="daily_art">每日美图</option>
                <option value="ranking_pick">排行精选</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="可选"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={creating}
              className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50">
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
        data={picks}
        page={page}
        totalPages={Math.ceil(total / 20)}
        total={total}
        onPageChange={fetchPicks}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="删除精选"
        message="确认删除此每日精选？关联的作品记录也会被删除。"
        confirmText="删除"
        loading={deleting}
      />
    </div>
  )
}
