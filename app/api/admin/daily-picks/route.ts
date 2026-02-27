import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getDailyPicks, createDailyPick, updateDailyPick, deleteDailyPick } from '@/lib/turso'

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const pickType = searchParams.get('pickType') || undefined

  try {
    const { picks, total } = await getDailyPicks(page, limit, pickType)
    return NextResponse.json({
      success: true,
      data: { picks, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
    })
  } catch (error) {
    console.error('获取每日精选列表失败:', error)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const body = await request.json()
    const { pickDate, pickType, title, description, coverPid } = body

    if (!pickDate || !pickType) {
      return NextResponse.json({ success: false, error: '请填写日期和类型' }, { status: 400 })
    }

    const id = await createDailyPick({ pickDate, pickType, title, description, coverPid })
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('创建每日精选失败:', error)
    return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 })

    await updateDailyPick(id, data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新每日精选失败:', error)
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 })

  try {
    await deleteDailyPick(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除每日精选失败:', error)
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 })
  }
}
