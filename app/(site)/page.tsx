import Link from 'next/link'
import type { Metadata } from 'next'
import { CalendarDays, Hash, Palette, TrendingUp } from 'lucide-react'

import ImageCarousel from '@/components/ImageCarousel'
import { getPublishedDailyPicks } from '@/db/content'
import { homeMetadata } from '../metadata'
import type { Artwork } from '@/types'

export const metadata: Metadata = homeMetadata

const sections = [
  {
    title: '每日排行精选',
    description: '从 Pixiv 榜单里筛掉噪音，只保留值得停留的作品。',
    href: '/rankings',
    icon: TrendingUp,
    accent: 'from-emerald-500 to-teal-500',
    surface: 'from-emerald-50 to-white',
  },
  {
    title: '每日美图',
    description: '按日期回看每日策展，适合快速浏览当天最稳的一组图。',
    href: '/daily',
    icon: CalendarDays,
    accent: 'from-sky-500 to-cyan-500',
    surface: 'from-sky-50 to-white',
  },
  {
    title: '画师鉴赏',
    description: '不只看图，也看创作风格、标签走向和画师的稳定输出。',
    href: '/artists',
    icon: Palette,
    accent: 'from-fuchsia-500 to-pink-500',
    surface: 'from-fuchsia-50 to-white',
  },
  {
    title: '话题鉴赏',
    description: '把同一主题下的作品拢在一起，浏览时更有策展感。',
    href: '/topics',
    icon: Hash,
    accent: 'from-amber-500 to-orange-500',
    surface: 'from-amber-50 to-white',
  },
] as const

async function getFeaturedArtworks(): Promise<Artwork[]> {
  try {
    const { picks } = await getPublishedDailyPicks(1, 1)
    return picks[0]?.artworks?.slice(0, 5) ?? []
  } catch (error) {
    console.error('Failed to load featured artworks for home page:', error)
    return []
  }
}

export default async function HomePage() {
  const featuredArtworks = await getFeaturedArtworks()

  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_34%),linear-gradient(180deg,#f7fdf9_0%,#ffffff_42%,#f7faf7_100%)]">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-emerald-100/60 to-transparent" />
        <ImageCarousel
          images={featuredArtworks}
          autoPlayInterval={6500}
          showControls={featuredArtworks.length > 1}
          showIndicators={featuredArtworks.length > 1}
          height="min(88svh, 920px)"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="max-w-xl rounded-[2rem] border border-white/45 bg-white/15 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl">
            <p className="mb-3 inline-flex rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/85">
              Curated Daily Selection
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              不只是图站，更像一个更轻的二次元策展首页
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/78 sm:text-base">
              首页先给氛围，再给入口。首屏只保留最新精选，让进入站点这一步更顺、更快，也更像作品展示页。
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center text-white/72 md:flex">
          <span className="text-xs uppercase tracking-[0.28em]">Scroll</span>
          <span className="mt-3 h-10 w-6 rounded-full border border-white/40">
            <span className="mx-auto mt-2 block h-3 w-1 animate-[floatY_1.6s_ease-in-out_infinite] rounded-full bg-white/70" />
          </span>
        </div>
      </section>

      <section className="relative z-10 -mt-10 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-emerald-100/70 bg-white/88 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
            <div className="flex flex-col gap-3 border-b border-slate-200/70 pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">
                  Explore
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  四个入口，先把站点结构讲清楚
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                现在首页不再靠大段动画撑观感，而是把内容路线、色彩分区和点击目标做得更明确。
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {sections.map((section) => {
                const Icon = section.icon

                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={`group rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-br ${section.surface} p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${section.accent} text-white shadow-lg shadow-slate-300/20 transition duration-300 group-hover:scale-105`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400 transition duration-300 group-hover:text-slate-600">
                        Open
                      </span>
                    </div>

                    <h3 className="mt-10 text-2xl font-semibold tracking-tight text-slate-900">
                      {section.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {section.description}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
