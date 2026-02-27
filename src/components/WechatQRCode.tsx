'use client'

interface WechatQRCodeProps {
  className?: string
  compact?: boolean
}

export default function WechatQRCode({ className = '', compact = false }: WechatQRCodeProps) {
  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-green-50 rounded-xl ${className}`}>
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-green-100">
          <img src="/images/wechat-qrcode.png" alt="公众号二维码" className="w-10 h-10 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
        <div>
          <p className="text-sm font-medium text-green-700">关注公众号</p>
          <p className="text-xs text-green-600">获取更多精彩内容</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-6 text-center ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">关注公众号</h3>
      <p className="text-sm text-gray-500 mb-4">扫码关注，获取每日精选推送</p>
      <div className="w-32 h-32 bg-white rounded-xl mx-auto flex items-center justify-center border border-green-100 shadow-sm">
        <img src="/images/wechat-qrcode.png" alt="公众号二维码"
          className="w-28 h-28 object-contain"
          onError={(e) => {
            const el = e.target as HTMLImageElement
            el.style.display = 'none'
            el.parentElement!.innerHTML = '<span class="text-xs text-gray-400">请放置二维码<br/>public/images/<br/>wechat-qrcode.png</span>'
          }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-3">微信扫一扫关注</p>
    </div>
  )
}
