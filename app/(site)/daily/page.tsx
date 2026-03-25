import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { redirect } from 'next/navigation'

import { getPublishedDailyPicks } from '@/db/content'
import { getImageUrl } from '@/lib/pixiv-proxy'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

function parsePage(value?: string) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function isDateParam(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

function getPageHref(page: number) {
  return page <= 1 ? '/daily' : `/daily?page=${page}`
}

export default async function DailyPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; date?: string }>
}) {
  const params = await searchParams

  // Legacy compatibility: /daily?date=YYYY-MM-DD -> /daily/YYYY-MM-DD
  if (isDateParam(params.date)) {
    redirect(`/daily/${params.date}`)
  }

  const requestedPage = parsePage(params.page)
  const initialData = await getPublishedDailyPicks(requestedPage, PAGE_SIZE, 'daily_art')
  const totalPages = Math.max(1, Math.ceil(initialData.total / PAGE_SIZE))
  const safePage = Math.min(requestedPage, totalPages)
  const { picks } =
    safePage === requestedPage
      ? initialData
      : await getPublishedDailyPicks(safePage, PAGE_SIZE, 'daily_art')

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_28%),linear-gradient(180deg,#fbfffc_0%,#f6fbf7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-emerald-100/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">
                Daily Selection
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                每日美图
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                先浏览每日美图列表，再点进某一期查看完整图片集合。
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CalendarDays className="h-4 w-4" />
              <span>
                第 {safePage} / {totalPages} 页
              </span>
            </div>
          </div>
        </div>

        {picks.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-20 text-center shadow-sm">
            <CalendarDays className="mx-auto h-16 w-16 text-slate-300" />
            <h2 className="mt-6 text-2xl font-semibold text-slate-900">暂无每日美图</h2>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {picks.map((pick) => {
                const firstArtwork = pick.artworks?.[0]
                const coverPid = pick.coverPid || (firstArtwork ? String(firstArtwork.id) : '')
                const coverPath = firstArtwork?.imagePath
                return (
                  <Link
                    key={pick.id}
                    href={`/daily/${pick.pickDate}`}
                    className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {coverPid ? (
                        <Image
                          src={getImageUrl(coverPid, 'small', coverPath)}
                          alt={pick.title || pick.pickDate}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-green-200">
                          <CalendarDays className="h-12 w-12 text-emerald-500" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-sm font-medium text-white/90">{pick.pickDate}</p>
                      </div>
                    </div>

                    <div className="space-y-3 p-5">
                      <h2 className="line-clamp-2 text-xl font-semibold tracking-tight text-slate-900 transition group-hover:text-emerald-700">
                        {pick.title || `${pick.pickDate} 每日美图`}
                      </h2>
                      {pick.description && (
                        <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                          {pick.description}
                        </p>
                      )}
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        {pick.artworks?.length || 0} 张作品
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href={getPageHref(Math.max(1, safePage - 1))}
                  className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                    safePage > 1
                      ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950'
                      : 'pointer-events-none border-slate-200 bg-slate-100 text-slate-300'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Link>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={getPageHref(pageNumber)}
                    className={`inline-flex h-11 min-w-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition ${
                      pageNumber === safePage
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ))}

                <Link
                  href={getPageHref(Math.min(totalPages, safePage + 1))}
                  className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                    safePage < totalPages
                      ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950'
                      : 'pointer-events-none border-slate-200 bg-slate-100 text-slate-300'
                  }`}
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
