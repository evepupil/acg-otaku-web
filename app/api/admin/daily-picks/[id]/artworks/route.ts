import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { addDailyPickArtwork, removeDailyPickArtwork, getDailyPickById } from '@/lib/turso'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  const { id } = await params
  try {
    const pick = await getDailyPickById(parseInt(id))
    if (!pick) return NextResponse.json({ success: false, error: '未找到' }, { status: 404 })
    return NextResponse.json({ success: true, data: pick })
  } catch (error) {
    console.error('获取每日精选详情失败:', error)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  const { id } = await params
  try {
    const { pid, sortOrder, editorComment } = await request.json()
    if (!pid) return NextResponse.json({ success: false, error: '缺少PID' }, { status: 400 })

    await addDailyPickArtwork(parseInt(id), pid, sortOrder || 0, editorComment)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('添加作品到精选失败:', error)
    return NextResponse.json({ success: false, error: '添加失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  const { id } = await params
  const pid = new URL(request.url).searchParams.get('pid')
  if (!pid) return NextResponse.json({ success: false, error: '缺少PID' }, { status: 400 })

  try {
    await removeDailyPickArtwork(parseInt(id), pid)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('移除作品失败:', error)
    return NextResponse.json({ success: false, error: '移除失败' }, { status: 500 })
  }
}
