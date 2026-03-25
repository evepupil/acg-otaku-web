import Link from 'next/link'
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { notFound } from 'next/navigation'

import ArtworkGrid from '@/components/ArtworkGrid'
import { getDailyPickByDate, getPublishedDailyPickSummaries } from '@/db/content'

export const dynamic = 'force-dynamic'

function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
}

export default async function DailyDetailPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const resolved = await params
  const date = resolved.date

  if (!isValidDate(date)) {
    notFound()
  }

  const [pick, { picks: summaries }] = await Promise.all([
    getDailyPickByDate(date, 'daily_art'),
    getPublishedDailyPickSummaries(1, 366, 'daily_art'),
  ])

  if (!pick) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <CalendarDays className="mx-auto h-14 w-14 text-slate-300" />
          <p className="mt-4 text-lg text-slate-400">未找到该日期的每日美图</p>
          <Link href="/daily" className="mt-3 inline-block text-emerald-600 hover:underline">
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  const currentIndex = summaries.findIndex((item) => item.pickDate === date)
  const previous = currentIndex >= 0 ? summaries[currentIndex + 1] : null
  const next = currentIndex > 0 ? summaries[currentIndex - 1] : null

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_28%),linear-gradient(180deg,#fbfffc_0%,#f6fbf7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Link
            href="/daily"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            返回每日列表
          </Link>

          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <CalendarDays className="h-4 w-4" />
            {pick.pickDate}
          </div>

          <div className="ml-auto inline-flex items-center gap-2">
            {previous ? (
              <Link
                href={`/daily/${previous.pickDate}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                aria-label="查看前一期"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-300">
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}

            {next ? (
              <Link
                href={`/daily/${next.pickDate}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                aria-label="查看后一期"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-300">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {pick.title || `${pick.pickDate} 每日美图`}
          </h1>
          {pick.description && (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              {pick.description}
            </p>
          )}
        </div>

        <ArtworkGrid artworks={pick.artworks} />
      </div>
    </div>
  )
}
