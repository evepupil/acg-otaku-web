import Link from 'next/link'

const footerSections = [
  {
    title: '浏览',
    links: [
      { href: '/', label: '首页' },
      { href: '/rankings', label: '排行精选' },
      { href: '/daily', label: '每日美图' },
      { href: '/artists', label: '画师专题' },
      { href: '/topics', label: '话题专题' },
    ],
  },
  {
    title: '工具',
    links: [{ href: '/search', label: '搜图' }],
  },
] as const

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-[linear-gradient(180deg,#fcfcfd_0%,#f4f7f8_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,0.8fr))]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#059669,#34d399)] text-lg font-semibold text-white shadow-[0_12px_32px_rgba(5,150,105,0.2)]">
                萌
              </span>
              <div>
                <p className="text-lg font-semibold text-slate-900">ACG萌图宅</p>
                <p className="text-sm text-slate-500">Curated anime illustration archive</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-600">
              收录每日精选、排行整理、画师专题、话题归档与搜图工具。
            </p>
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
          <p>&copy; {currentYear} ACG萌图宅 All rights reserved.</p>
          <p>每日更新精选内容。</p>
        </div>
      </div>
    </footer>
  )
}
