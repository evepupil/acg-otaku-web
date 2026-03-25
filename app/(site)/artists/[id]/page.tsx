import Link from 'next/link'
import { ArrowLeft, Palette } from 'lucide-react'

import ArtistProfileCard from '@/components/ArtistProfileCard'
import ArtworkGrid from '@/components/ArtworkGrid'
import FeatureArticle from '@/components/FeatureArticle'
import { getArtistFeatureById } from '@/db/content'

export const dynamic = 'force-dynamic'

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const feature = await getArtistFeatureById(Number(resolvedParams.id))

  if (!feature || !feature.isPublished) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <Palette className="mx-auto h-14 w-14 text-slate-300" />
          <p className="mt-4 text-lg text-slate-400">未找到该画师专题</p>
          <Link href="/artists" className="mt-3 inline-block text-fuchsia-600 hover:underline">
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.08),_transparent_28%),linear-gradient(180deg,#ffffff_0%,#faf7ff_100%)]">
      <div className="mx-auto max-w-4xl px-4 py-8 pt-10 sm:px-6 lg:px-8">
        <Link
          href="/artists"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-fuchsia-700"
        >
          <ArrowLeft className="h-4 w-4" />
          返回画师鉴赏
        </Link>

        <ArtistProfileCard
          artistName={feature.artistName}
          artistBio={feature.artistBio}
          artistAvatar={feature.artistAvatar}
          pixivUrl={feature.pixivUrl}
          twitterUrl={feature.twitterUrl}
        />

        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-slate-900">
          {feature.featureTitle}
        </h1>

        {feature.featureContent && (
          <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
            <FeatureArticle content={feature.featureContent} />
          </div>
        )}

        {feature.artworks.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">代表作品</h2>
            <ArtworkGrid artworks={feature.artworks} columns={3} />
          </div>
        )}
      </div>
    </div>
  )
}
