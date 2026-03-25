import Link from 'next/link'
import { CalendarDays, ChevronLeft, ChevronRight, Search } from 'lucide-react'

import ArtworkGrid from '@/components/ArtworkGrid'
import { getDailyPickByDate } from '@/db/content'

export const dynamic = 'force-dynamic'

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getShiftedDate(date: string, offset: number) {
  const [year, month, day] = date.split('-').map(Number)
  const current = new Date(year, month - 1, day)
  current.setDate(current.getDate() + offset)
  return formatDate(current)
}

function normalizeDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return formatDate(new Date())
  }

  return value
}

export default async function DailyPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const today = formatDate(new Date())
  const date = normalizeDate(params.date)
  const pick = await getDailyPickByDate(date, 'daily_art')

  const previousDate = getShiftedDate(date, -1)
  const nextDate = getShiftedDate(date, 1)
  const hasNextDate = nextDate <= today

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_28%),linear-gradient(180deg,#fbfffc_0%,#f6fbf7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-emerald-100/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">
                Daily Selection
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                每日美图
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                按日期查看每天整理出的精选作品。
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <div className="flex items-center gap-3">
                <Link
                  href={`/daily?date=${previousDate}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                  aria-label="查看前一天"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>

                <div className="inline-flex min-w-44 items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800">
                  <CalendarDays className="h-4 w-4" />
                  <span>{date}</span>
                </div>

                {hasNextDate ? (
                  <Link
                    href={`/daily?date=${nextDate}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                    aria-label="查看后一天"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-300">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                )}
              </div>

              <form action="/daily" className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                  <input
                    type="date"
                    name="date"
                    defaultValue={date}
                    max={today}
                    className="bg-transparent text-slate-900 outline-none"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  <Search className="h-4 w-4" />
                  跳转日期
                </button>
              </form>
            </div>
          </div>
        </div>

        {pick ? (
          <div className="space-y-6">
            {(pick.title || pick.description) && (
              <div className="text-center">
                {pick.title && (
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {pick.title}
                  </h2>
                )}
                {pick.description && (
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                    {pick.description}
                  </p>
                )}
              </div>
            )}

            <ArtworkGrid artworks={pick.artworks} />
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-20 text-center shadow-sm">
            <CalendarDays className="mx-auto h-16 w-16 text-slate-300" />
            <h2 className="mt-6 text-2xl font-semibold text-slate-900">该日暂无精选内容</h2>
            <p className="mt-3 text-sm text-slate-500 md:text-base">
              你可以切到前一天，或者换一个日期继续看。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
