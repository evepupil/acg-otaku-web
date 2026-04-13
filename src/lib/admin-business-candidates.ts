import {
  getCandidateArtworksByPids,
  getPublishedArtworkPidSet,
  type CandidateArtwork,
} from '@/db/curation'
import {
  getCrawlerBusinessCandidates,
  type CrawlerBusinessCandidateItem,
  type CrawlerBusinessCandidatePool,
  type CrawlerBusinessDownloadStatus,
} from '@/lib/crawler-client'

export interface AdminBusinessCandidateArtwork extends CandidateArtwork {
  candidateScore?: number
  candidateSourceType?: string
  candidateSourceKey?: string
  candidateSourceRecentAt?: string
  candidatePriority?: number
  candidateDownloadStage?: 'none' | 'preview' | 'full'
  candidateBizType?: string
  candidateLastSourceType?: string
}

interface GetAdminBusinessCandidateArtworksOptions {
  pool: CrawlerBusinessCandidatePool
  limit?: number
  topN?: number
  excludePublished?: boolean
  onlyDownloaded?: boolean
  downloadStatus?: CrawlerBusinessDownloadStatus
  artistId?: string
  tags?: string[]
}

function mergeCandidateMeta(
  artwork: CandidateArtwork,
  candidate: CrawlerBusinessCandidateItem | undefined
): AdminBusinessCandidateArtwork {
  if (!candidate) {
    return artwork
  }

  return {
    ...artwork,
    candidateScore: candidate.candidateScore,
    candidateSourceType: candidate.sourceType,
    candidateSourceKey: candidate.sourceKey,
    candidateSourceRecentAt: candidate.sourceRecentAt,
    candidatePriority: candidate.priority,
    candidateDownloadStage: candidate.downloadStage,
    candidateBizType: candidate.bizType,
    candidateLastSourceType: candidate.lastSourceType,
  }
}

export async function getAdminBusinessCandidateArtworks(
  options: GetAdminBusinessCandidateArtworksOptions
) {
  const result = await getCrawlerBusinessCandidates({
    pool: options.pool,
    limit: options.limit,
    topN: options.topN,
    excludePublished: options.excludePublished,
    onlyDownloaded: options.onlyDownloaded,
    downloadStatus: options.downloadStatus,
    artistId: options.artistId,
    tags: options.tags,
  })

  const orderedPids = result.items.map((item) => item.pid)
  const [artworks, publishedSet] = await Promise.all([
    getCandidateArtworksByPids(orderedPids),
    options.excludePublished === false ? Promise.resolve(new Set<string>()) : getPublishedArtworkPidSet(),
  ])
  const metaMap = new Map(result.items.map((item) => [item.pid, item]))

  return artworks
    .filter((item) => !publishedSet.has(String(item.id)))
    .map((item) => mergeCandidateMeta(item, metaMap.get(String(item.id))))
}
