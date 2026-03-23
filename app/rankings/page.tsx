import Link from 'next/link'
import { CalendarDays, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'

import ArtworkGrid from '@/components/ArtworkGrid'
import {
  getDailyPickByDate,
  getPublishedDailyPickSummaries,
} from '@/lib/turso'

export const dynamic = 'force-dynamic'

function normalizeDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return ''
  }

  return value
}

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const { picks } = await getPublishedDailyPickSummaries(1, 180, 'ranking_pick')

  const requestedDate = normalizeDate(params.date)
  const fallbackDate = picks[0]?.pickDate || ''
  const currentDate = picks.some((pick) => pick.pickDate === requestedDate)
    ? requestedDate
    : fallbackDate

  const currentIndex = picks.findIndex((pick) => pick.pickDate === currentDate)
  const previousPick = currentIndex >= 0 ? picks[currentIndex + 1] : null
  const nextPick = currentIndex > 0 ? picks[currentIndex - 1] : null
  const currentPick = currentDate
    ? await getDailyPickByDate(currentDate, 'ranking_pick')
    : null

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.1),_transparent_30%),linear-gradient(180deg,#f8fdf9_0%,#ffffff_42%,#f6fbf7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-emerald-100/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">
                Ranking Curation
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                每日排行精选
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                这页也改成了服务端首屏，日期列表只读取摘要，真正查看某一天时再取对应作品，不再每次进来都先跑整页动画和请求链。
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <div className="flex items-center gap-3">
                {previousPick ? (
                  <Link
                    href={`/rankings?date=${previousPick.pickDate}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                    aria-label="查看更早的排行精选"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                ) : (
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-300">
                    <ChevronLeft className="h-5 w-5" />
                  </span>
                )}

                <div className="inline-flex min-w-44 items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800">
                  <CalendarDays className="h-4 w-4" />
                  <span>{currentDate || '暂无已发布日期'}</span>
                </div>

                {nextPick ? (
                  <Link
                    href={`/rankings?date=${nextPick.pickDate}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                    aria-label="查看更新的排行精选"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-300">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                )}
              </div>

              {picks.length > 0 && (
                <form action="/rankings" className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <select
                      name="date"
                      defaultValue={currentDate}
                      className="bg-transparent pr-2 text-slate-900 outline-none"
                    >
                      {picks.map((pick) => (
                        <option key={pick.id} value={pick.pickDate}>
                          {pick.pickDate} {pick.title ? `· ${pick.title}` : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    查看日期
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {currentPick ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {currentPick.title || '排行精选'}
              </h2>
              {currentPick.description && (
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                  {currentPick.description}
                </p>
              )}
            </div>

            <ArtworkGrid artworks={currentPick.artworks} />
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-20 text-center shadow-sm">
            <TrendingUp className="mx-auto h-16 w-16 text-slate-300" />
            <h2 className="mt-6 text-2xl font-semibold text-slate-900">暂无已发布的排行精选</h2>
            <p className="mt-3 text-sm text-slate-500 md:text-base">
              这里会在发布后直接以服务端首屏内容展示出来。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
