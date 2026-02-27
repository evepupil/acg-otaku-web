import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { fetchPixivIllustInfo } from '@/lib/pixiv-api'

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  const pid = new URL(request.url).searchParams.get('pid')
  if (!pid) {
    return NextResponse.json({ success: false, error: '请提供PID' }, { status: 400 })
  }

  try {
    const info = await fetchPixivIllustInfo(pid)
    if (!info) {
      return NextResponse.json({ success: false, error: '无法获取Pixiv插画信息' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        pid: info.pid,
        title: info.title,
        authorName: info.authorName,
        tags: info.tags,
        viewCount: info.viewCount,
        likeCount: info.likeCount,
        bookmarkCount: info.bookmarkCount,
      }
    })
  } catch (error) {
    console.error('预览失败:', error)
    return NextResponse.json({ success: false, error: '获取预览信息失败' }, { status: 500 })
  }
}
