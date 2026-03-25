import { NextRequest, NextResponse } from 'next/server'

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

function isPrivateIpv4(hostname: string) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return false
  }

  const [a, b] = hostname.split('.').map(Number)

  if (a === 10 || a === 127) {
    return true
  }

  if (a === 192 && b === 168) {
    return true
  }

  if (a === 172 && b >= 16 && b <= 31) {
    return true
  }

  return false
}

function isBlockedHostname(hostname: string) {
  const normalized = hostname.toLowerCase()

  if (BLOCKED_HOSTS.has(normalized)) {
    return true
  }

  if (normalized.endsWith('.local')) {
    return true
  }

  return isPrivateIpv4(normalized)
}

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get('src')

  if (!src) {
    return NextResponse.json({ error: 'Missing src parameter' }, { status: 400 })
  }

  let targetUrl: URL

  try {
    targetUrl = new URL(src)
  } catch {
    return NextResponse.json({ error: 'Invalid src parameter' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return NextResponse.json({ error: 'Unsupported protocol' }, { status: 400 })
  }

  if (isBlockedHostname(targetUrl.hostname)) {
    return NextResponse.json({ error: 'Blocked hostname' }, { status: 400 })
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: {
        'user-agent': 'ACGOtakuImageProxy/1.0',
        accept: 'image/*,*/*;q=0.8',
      },
      cache: 'force-cache',
      redirect: 'follow',
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream image fetch failed' }, { status: 502 })
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'

    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Upstream response is not an image' }, { status: 400 })
    }

    const buffer = await upstream.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('Image proxy fetch failed:', error)

    return NextResponse.json({ error: 'Image proxy request failed' }, { status: 500 })
  }
}
