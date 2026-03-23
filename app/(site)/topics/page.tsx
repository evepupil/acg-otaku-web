import Link from 'next/link'
import { ChevronLeft, ChevronRight, Hash } from 'lucide-react'

import { getImageUrl } from '@/lib/pixiv-proxy'
import { getTopicFeatures } from '@/lib/turso'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

function parsePage(value?: string) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function getPageHref(page: number) {
  return page <= 1 ? '/topics' : `/topics?page=${page}`
}

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const initialData = await getTopicFeatures(requestedPage, PAGE_SIZE, true)
  const totalPages = Math.max(1, Math.ceil(initialData.total / PAGE_SIZE))
  const safePage = Math.min(requestedPage, totalPages)
  const { features } =
    safePage === requestedPage
      ? initialData
      : await getTopicFeatures(safePage, PAGE_SIZE, true)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.08),_transparent_28%),linear-gradient(180deg,#fffdf9_0%,#fff7ed_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-amber-100/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-600">
                Topic Features
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                话题鉴赏
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                话题页也改成了服务端分页，进入时直接看到卡片，不再等浏览器先把列表数据补回来。
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              <Hash className="h-4 w-4" />
              <span>
                第 {safePage} / {totalPages} 页
              </span>
            </div>
          </div>
        </div>

        {features.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-20 text-center shadow-sm">
            <Hash className="mx-auto h-16 w-16 text-slate-300" />
            <h2 className="mt-6 text-2xl font-semibold text-slate-900">暂无话题专题</h2>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Link
                  key={feature.id}
                  href={`/topics/${feature.id}`}
                  className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {feature.coverPid ? (
                      <img
                        src={getImageUrl(feature.coverPid, 'small')}
                        alt={feature.topicName}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200">
                        <Hash className="h-12 w-12 text-amber-400" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  </div>

                  <div className="space-y-3 p-5">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900 transition group-hover:text-amber-700">
                      {feature.topicName}
                    </h2>
                    {feature.topicDescription && (
                      <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                        {feature.topicDescription}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {feature.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                        {feature.artworks?.length || 0} 件作品
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
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
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-700'
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
