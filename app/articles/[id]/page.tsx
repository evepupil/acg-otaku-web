import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Eye } from 'lucide-react'

import ShareButtons from '@/components/ShareButtons'
import WechatQRCode from '@/components/WechatQRCode'
import {
  getAllArticleSlugs,
  getArticleWithHtml,
  getRelatedArticles,
} from '@/lib/articles'

export async function generateStaticParams() {
  const slugs = getAllArticleSlugs()
  return slugs.map((slug) => ({
    id: slug,
  }))
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const article = await getArticleWithHtml(resolvedParams.id)

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg text-slate-400">文章未找到</p>
          <Link href="/articles" className="mt-3 inline-block text-emerald-600 hover:underline">
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  const relatedArticles = getRelatedArticles(article.slug, 3)
  const readMinutes = Math.max(3, Math.round(article.content.length / 500))

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_28%),linear-gradient(180deg,#fcfffd_0%,#f5fbf7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 pt-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <Link
              href="/articles"
              className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              返回文章列表
            </Link>

            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
              <div className="aspect-[16/8] overflow-hidden">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-8">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
                  {article.title}
                </h1>
                <p className="mt-4 text-lg leading-8 text-slate-600">{article.excerpt}</p>

                <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-6 text-sm text-slate-500">
                  <span>{article.author_name}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(article.published_at).toLocaleDateString('zh-CN')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {readMinutes} 分钟阅读
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {article.view_count.toLocaleString()} 次浏览
                  </span>
                </div>

                <div
                  className="prose prose-lg mt-10 max-w-none
                    prose-headings:text-slate-900 prose-headings:font-semibold
                    prose-p:text-slate-600 prose-p:leading-8
                    prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-2xl prose-img:shadow-lg
                    prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50/60 prose-blockquote:rounded-r-2xl
                    prose-code:text-emerald-700 prose-code:bg-emerald-50 prose-code:px-1 prose-code:rounded"
                  dangerouslySetInnerHTML={{ __html: article.htmlContent || '' }}
                />
              </div>
            </article>

            <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">相关文章</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/articles/${related.slug}`}
                    className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={related.featured_image}
                        alt={related.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="space-y-3 p-5">
                      <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs text-emerald-700">
                        {related.tags[0] || '文章'}
                      </span>
                      <h3 className="text-lg font-semibold tracking-tight text-slate-900 transition group-hover:text-emerald-700">
                        {related.title}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                        {related.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">分享文章</h2>
              <ShareButtons title={article.title} className="mt-4" />
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-xl font-semibold text-white">
                  {article.author_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{article.author_name}</h2>
                  <p className="text-sm text-slate-500">专栏作者</p>
                </div>
              </div>
            </section>

            <WechatQRCode />
          </aside>
        </div>
      </div>
    </div>
  )
}
