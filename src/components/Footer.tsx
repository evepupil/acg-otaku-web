import Link from 'next/link'
import { Github, Mail, Twitter } from 'lucide-react'

const footerSections = [
  {
    title: '浏览',
    links: [
      { href: '/', label: '首页' },
      { href: '/rankings', label: '每日排行精选' },
      { href: '/daily', label: '每日美图' },
      { href: '/artists', label: '画师鉴赏' },
      { href: '/topics', label: '话题鉴赏' },
    ],
  },
  {
    title: '内容',
    links: [
      { href: '/articles', label: '文章' },
      { href: '/search', label: '搜图' },
    ],
  },
] as const

const socialLinks = [
  { href: 'https://github.com', label: 'GitHub', icon: Github },
  { href: 'https://twitter.com', label: 'Twitter', icon: Twitter },
  { href: 'mailto:contact@example.com', label: 'Email', icon: Mail },
] as const

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_32%),linear-gradient(180deg,#fcfffd_0%,#f6fbf7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,0.8fr))]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#059669,#34d399)] text-lg font-semibold text-white shadow-[0_12px_32px_rgba(5,150,105,0.24)]">
                萌
              </span>
              <div>
                <p className="text-lg font-semibold text-slate-900">ACG萌图宅</p>
                <p className="text-sm text-slate-500">Curated anime illustration archive</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-600">
              这个页脚也做了收敛：少一点无效动画，多一点结构感和留白，让底部信息区真正像站点收束，而不是再来一轮视觉噪音。
            </p>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                {section.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition hover:text-slate-950"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} ACG萌图宅. All rights reserved.</p>
          <p>界面收敛后，页面切换和滚动都会更干净。</p>
        </div>
      </div>
    </footer>
  )
}
