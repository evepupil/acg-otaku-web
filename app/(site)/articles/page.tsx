import Link from 'next/link'
import { BookOpen, ChevronLeft, ChevronRight, Clock, Eye, Search } from 'lucide-react'

import { getArticleTagsWithCount, getFilteredArticles, type ArticleSortOption } from '@/lib/articles'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 9

function normalizePage(value?: string) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function normalizeSort(value?: string): ArticleSortOption {
  return value === 'views' ? 'views' : 'latest'
}

function buildArticlesHref(params: {
  page?: number
  search?: string
  tag?: string
  sort?: ArticleSortOption
}) {
  const searchParams = new URLSearchParams()

  if (params.page && params.page > 1) {
    searchParams.set('page', params.page.toString())
  }

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.tag) {
    searchParams.set('tag', params.tag)
  }

  if (params.sort && params.sort !== 'latest') {
    searchParams.set('sort', params.sort)
  }

  const query = searchParams.toString()
  return query ? `/articles?${query}` : '/articles'
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    search?: string
    tag?: string
    sort?: string
  }>
}) {
  const params = await searchParams
  const requestedPage = normalizePage(params.page)
  const search = params.search?.trim() || ''
  const tag = params.tag?.trim() || ''
  const sort = normalizeSort(params.sort)

  const { articles, pagination } = getFilteredArticles({
    search,
    tag,
    sort,
    page: requestedPage,
    limit: PAGE_SIZE,
  })
  const tags = getArticleTagsWithCount()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_28%),linear-gradient(180deg,#fbfffc_0%,#f4fbf6_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-emerald-100/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">
                Articles
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                文章
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                这里收录一些关于插画、审美和创作方法的短文，适合搭配作品一起看。
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <BookOpen className="h-4 w-4" />
              <span>
                第 {pagination.page} / {pagination.totalPages} 页
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <form action="/articles" className="flex flex-col gap-4 lg:flex-row">
              <label className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                <Search className="h-4 w-4 text-emerald-600" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="搜索标题、摘要或标签"
                  className="w-full bg-transparent text-slate-900 outline-none"
                />
              </label>

              <input type="hidden" name="tag" value={tag} />

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                <span className="text-slate-900">排序</span>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="bg-transparent text-slate-900 outline-none"
                >
                  <option value="latest">最新发布</option>
                  <option value="views">浏览最多</option>
                </select>
              </label>

              <button
                type="submit"
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                筛选文章
              </button>
            </form>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildArticlesHref({ search, sort })}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    !tag ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  全部
                </Link>
                {tags.slice(0, 12).map((item) => (
                  <Link
                    key={item.tag}
                    href={buildArticlesHref({ search, tag: item.tag, sort })}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      tag === item.tag
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {item.tag} · {item.count}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-20 text-center shadow-sm">
            <BookOpen className="mx-auto h-16 w-16 text-slate-300" />
            <h2 className="mt-6 text-2xl font-semibold text-slate-900">
              {search || tag ? '没有匹配的文章' : '暂无文章内容'}
            </h2>
            <p className="mt-3 text-sm text-slate-500 md:text-base">
              {search || tag ? '可以换个关键词，或者清掉当前标签再看。' : '文章会在准备好后显示在这里。'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(article.published_at).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {article.view_count.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900 transition group-hover:text-emerald-700">
                        {article.title}
                      </h2>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                        >
                          #{item}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href={buildArticlesHref({
                    page: Math.max(1, pagination.page - 1),
                    search,
                    tag,
                    sort,
                  })}
                  className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                    pagination.page > 1
                      ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950'
                      : 'pointer-events-none border-slate-200 bg-slate-100 text-slate-300'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Link>

                {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={buildArticlesHref({ page: pageNumber, search, tag, sort })}
                    className={`inline-flex h-11 min-w-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition ${
                      pageNumber === pagination.page
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ))}

                <Link
                  href={buildArticlesHref({
                    page: Math.min(pagination.totalPages, pagination.page + 1),
                    search,
                    tag,
                    sort,
                  })}
                  className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                    pagination.page < pagination.totalPages
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
