'use client'

import { useState } from 'react'
import { Link2, Share2, Check } from 'lucide-react'

interface ShareButtonsProps {
  url?: string
  title?: string
  className?: string
}

export default function ShareButtons({ url, title = '', className = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareWeibo = () => {
    const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`
    window.open(weiboUrl, '_blank', 'width=600,height=500')
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button onClick={handleCopyLink}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          copied ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}>
        {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
        {copied ? '已复制' : '复制链接'}
      </button>
      <button onClick={handleShareWeibo}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors">
        <Share2 className="w-3.5 h-3.5" />
        微博
      </button>
    </div>
  )
}
