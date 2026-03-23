import Link from 'next/link'
import { ArrowLeft, Hash } from 'lucide-react'

import ArtworkGrid from '@/components/ArtworkGrid'
import FeatureArticle from '@/components/FeatureArticle'
import { getTopicFeatureById } from '@/lib/turso'

export const dynamic = 'force-dynamic'

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const feature = await getTopicFeatureById(Number(resolvedParams.id))

  if (!feature || !feature.isPublished) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <Hash className="mx-auto h-14 w-14 text-slate-300" />
          <p className="mt-4 text-lg text-slate-400">未找到该话题专题</p>
          <Link href="/topics" className="mt-3 inline-block text-amber-600 hover:underline">
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.08),_transparent_28%),linear-gradient(180deg,#fffdf9_0%,#fff7ed_100%)]">
      <div className="mx-auto max-w-4xl px-4 py-8 pt-10 sm:px-6 lg:px-8">
        <Link
          href="/topics"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-amber-700"
        >
          <ArrowLeft className="h-4 w-4" />
          返回话题鉴赏
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{feature.topicName}</h1>
        {feature.topicDescription && (
          <p className="mt-3 text-base leading-7 text-slate-600">{feature.topicDescription}</p>
        )}

        {feature.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {feature.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-sm text-amber-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {feature.featureContent && (
          <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
            <FeatureArticle content={feature.featureContent} />
          </div>
        )}

        {feature.artworks.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">相关作品</h2>
            <ArtworkGrid artworks={feature.artworks} columns={3} />
          </div>
        )}
      </div>
    </div>
  )
}
