import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowRight,
  CalendarDays,
  Hash,
  Palette,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import CuratedArtworkCard from '@/components/CuratedArtworkCard'
import { getArtistFeatures, getPublishedDailyPicks, getTopicFeatures } from '@/db/content'
import { getImageUrl } from '@/lib/pixiv-proxy'
import { homeMetadata } from '../metadata'

export const metadata: Metadata = homeMetadata

const shortcutItems = [
  {
    title: '排行精选',
    description: '按日期回看已经整理好的排行作品。',
    href: '/rankings',
    icon: TrendingUp,
    accent: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  },
  {
    title: '每日美图',
    description: '查看当天发布的精选作品。',
    href: '/daily',
    icon: CalendarDays,
    accent: 'text-sky-700 bg-sky-50 border-sky-100',
  },
  {
    title: '画师专题',
    description: '集中浏览画师介绍和代表作。',
    href: '/artists',
    icon: Palette,
    accent: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-100',
  },
  {
    title: '话题专题',
    description: '按主题整理角色、风格和题材。',
    href: '/topics',
    icon: Hash,
    accent: 'text-amber-700 bg-amber-50 border-amber-100',
  },
  {
    title: '搜图工具',
    description: '上传图片后找来源和相近作品。',
    href: '/search',
    icon: Search,
    accent: 'text-cyan-700 bg-cyan-50 border-cyan-100',
  },
] as const

function formatDisplayDate(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  }).format(parsed)
}

export default async function HomePage() {
  const [
    { picks: dailyPicks },
    { picks: rankingPicks },
    { features: artistFeatures },
    { features: topicFeatures },
  ] = await Promise.all([
    getPublishedDailyPicks(1, 1, 'daily_art'),
    getPublishedDailyPicks(1, 6, 'ranking_pick'),
    getArtistFeatures(1, 4, true),
    getTopicFeatures(1, 4, true),
  ])

  const featuredDailyPick = dailyPicks[0] ?? null
  const featuredArtworks = featuredDailyPick?.artworks.slice(0, 6) ?? []
  const heroArtworks = featuredDailyPick?.artworks.slice(0, 3) ?? []
  const latestUpdates = [featuredDailyPick, ...rankingPicks]
    .filter((pick): pick is NonNullable<typeof pick> => Boolean(pick))
    .filter((pick, index, picks) => picks.findIndex((item) => item.id === pick.id) === index)
    .slice(0, 4)
  const rankingHighlights = rankingPicks.slice(0, 3)
  const topicTags = Array.from(new Set(topicFeatures.flatMap((feature) => feature.tags))).slice(0, 8)
  const heroDescription =
    featuredDailyPick?.description ||
    '收录每日精选、排行整理、画师专题和话题专题，把值得反复回看的作品集中放在首页。'

  return (
    <div className="pb-20">
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_28%),linear-gradient(180deg,#f8fbfc_0%,#f3f5f7_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                今日精选
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.9rem]">
                每天收一份二次元好图清单。
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                {heroDescription}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={featuredDailyPick ? `/daily/${featuredDailyPick.pickDate}` : '/daily'}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  查看今日精选
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/rankings"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                >
                  浏览排行精选
                </Link>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">最新精选</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {featuredDailyPick ? featuredDailyPick.pickDate : '待更新'}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">本期作品</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {featuredDailyPick ? `${featuredDailyPick.artworks.length} 张` : '--'}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">专题入口</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {artistFeatures.length + topicFeatures.length} 组
                  </p>
                </div>
              </div>

              {topicTags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {topicTags.map((tag) => (
                    <Link
                      key={tag}
                      href="/topics"
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-3">
              {heroArtworks.length > 0 ? (
                <>
                  <Link
                    href={`/artwork/${heroArtworks[0].id}`}
                    className="relative min-h-[16rem] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
                  >
                    <Image
                      src={getImageUrl(heroArtworks[0].id, 'regular', heroArtworks[0].imagePath)}
                      alt={heroArtworks[0].title}
                      fill
                      priority
                      sizes="(min-width: 1024px) 36vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/72 via-slate-950/12 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/70">今日封面</p>
                      <h2 className="mt-2 text-xl font-semibold">{heroArtworks[0].title}</h2>
                      <p className="mt-1 text-sm text-white/75">{heroArtworks[0].artist.name}</p>
                    </div>
                  </Link>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {heroArtworks.slice(1).map((artwork) => (
                      <Link
                        key={artwork.id}
                        href={`/artwork/${artwork.id}`}
                        className="relative min-h-[9.5rem] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
                      >
                        <Image
                          src={getImageUrl(artwork.id, 'small', artwork.imagePath)}
                          alt={artwork.title}
                          fill
                          sizes="(min-width: 1024px) 18vw, 50vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/68 via-slate-950/8 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                          <p className="truncate text-sm font-medium">{artwork.title}</p>
                          <p className="mt-1 truncate text-xs text-white/70">{artwork.artist.name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
                  暂时还没有已发布的每日精选内容。
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {shortcutItems.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
              >
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${item.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-600">
                  精选作品
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  今日精选作品
                </h2>
              </div>
              <Link
                href={featuredDailyPick ? `/daily/${featuredDailyPick.pickDate}` : '/daily'}
                className="text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
              >
                查看全部
              </Link>
            </div>

            <div className="mt-6">
              {featuredArtworks.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {featuredArtworks.map((artwork) => (
                    <CuratedArtworkCard key={artwork.id} artwork={artwork} showComment={false} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
                  暂时还没有可展示的精选作品。
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                    最近发布
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    最近发布
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {latestUpdates.length > 0 ? (
                  latestUpdates.map((pick) => (
                    <Link
                      key={pick.id}
                      href={pick.pickType === 'daily_art' ? `/daily/${pick.pickDate}` : `/rankings/${pick.pickDate}`}
                      className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
                    >
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {pick.pickType === 'daily_art' ? '每日精选' : '排行精选'}
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-slate-900">
                          {pick.title || `${pick.pickDate} 更新`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">
                          {formatDisplayDate(pick.pickDate)}
                        </p>
                        <p className="text-xs text-slate-400">{pick.artworks.length} 张</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-[1.25rem] border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                    暂时还没有已发布的更新。
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-600">
                    排行回看
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    最近排行回看
                  </h2>
                </div>
                <Link
                  href="/rankings"
                  className="text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
                >
                  更多日期
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {rankingHighlights.length > 0 ? (
                  rankingHighlights.map((pick) => (
                    <Link
                      key={pick.id}
                      href={`/rankings/${pick.pickDate}`}
                      className="flex gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300 hover:bg-white"
                    >
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1rem] bg-slate-200">
                        {pick.coverPid ? (
                          <Image
                            src={getImageUrl(pick.coverPid, 'small')}
                            alt={pick.title || pick.pickDate}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">
                          {pick.pickDate}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                          {pick.title || '排行精选'}
                        </h3>
                        <p className="mt-2 text-xs text-slate-500">
                          已整理 {pick.artworks.length} 张作品
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-[1.25rem] border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                    暂时还没有已发布的排行整理。
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/search"
              className="block rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f2fbff_100%)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                <Search className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                需要找图？
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                直接上传图片，查看相近作品和来源信息。
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-700">
                进入搜图
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-fuchsia-600">
                  画师专题
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  画师专题
                </h2>
              </div>
              <Link
                href="/artists"
                className="text-sm font-medium text-fuchsia-700 transition hover:text-fuchsia-800"
              >
                查看全部
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {artistFeatures.length > 0 ? (
                artistFeatures.map((feature) => (
                  <Link
                    key={feature.id}
                    href={`/artists/${feature.id}`}
                    className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-[1.25rem] bg-slate-200">
                      {feature.coverPid ? (
                        <Image
                          src={getImageUrl(feature.coverPid, 'small')}
                          alt={feature.featureTitle}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-500">
                        {feature.artistName}
                      </p>
                      <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900">
                        {feature.featureTitle}
                      </h3>
                      {feature.artistBio && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {feature.artistBio}
                        </p>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">
                  暂时还没有已发布的画师专题。
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-600">
                  话题专题
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  话题专题
                </h2>
              </div>
              <Link
                href="/topics"
                className="text-sm font-medium text-amber-700 transition hover:text-amber-800"
              >
                查看全部
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {topicFeatures.length > 0 ? (
                topicFeatures.map((feature) => (
                  <Link
                    key={feature.id}
                    href={`/topics/${feature.id}`}
                    className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                  >
                    <div className="relative aspect-[16/10] bg-slate-200">
                      {feature.coverPid ? (
                        <Image
                          src={getImageUrl(feature.coverPid, 'small')}
                          alt={feature.topicName}
                          fill
                          sizes="(min-width: 1024px) 20vw, 50vw"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="space-y-3 p-4">
                      <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-900">
                        {feature.topicName}
                      </h3>
                      {feature.topicDescription && (
                        <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                          {feature.topicDescription}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {feature.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500 sm:col-span-2">
                  暂时还没有已发布的话题专题。
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
