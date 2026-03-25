'use client'

import Image from 'next/image'

interface WechatQRCodeProps {
  className?: string
  compact?: boolean
}

export default function WechatQRCode({
  className = '',
  compact = false,
}: WechatQRCodeProps) {
  if (compact) {
    return (
      <div className={`flex items-center gap-3 rounded-xl bg-green-50 p-3 ${className}`}>
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-green-100 bg-white">
          <Image
            src="/wechat-qrcode-placeholder.svg"
            alt="公众号二维码"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-green-700">关注公众号</p>
          <p className="text-xs text-green-600">获取更多精彩内容</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center ${className}`}
    >
      <h3 className="mb-2 text-lg font-semibold text-gray-900">关注公众号</h3>
      <p className="mb-4 text-sm text-gray-500">扫码关注，获取每日精选推送</p>
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-xl border border-green-100 bg-white shadow-sm">
        <Image
          src="/wechat-qrcode-placeholder.svg"
          alt="公众号二维码"
          width={112}
          height={112}
          className="h-28 w-28 object-contain"
        />
      </div>
      <p className="mt-3 text-xs text-gray-400">微信扫一扫关注</p>
    </div>
  )
}
