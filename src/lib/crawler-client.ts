import 'server-only'

import { env } from '@/env'

const DEFAULT_ARTIST_CRAWL_ACTIONS = ['crawl-artist-by-id', 'crawl-artist', 'artist-crawl']

export type CrawlerWatchTargetType = 'tag' | 'artist'
export type CrawlerBusinessCandidatePool = 'ranking' | 'daily' | 'artist' | 'topic' | 'avatar' | 'wallpaper'
export type CrawlerBusinessDownloadStatus = 'any' | 'preview' | 'regular' | 'original'

export interface CrawlerWatchTarget {
  id: number
  target_type: CrawlerWatchTargetType
  target_value: string
  biz_type: string
  priority: number
  window_days: number
  daily_preview_quota: number
  enabled: boolean
  last_run_at: string | null
  meta: string | null
  created_at: string | null
  updated_at: string | null
}

export interface UpsertCrawlerWatchTargetInput {
  id?: number
  targetType: CrawlerWatchTargetType
  targetValue: string
  bizType: string
  priority: number
  windowDays: number
  dailyPreviewQuota: number
  enabled: boolean
}

interface CrawlerWatchTargetListResponse {
  success: boolean
  count: number
  items: CrawlerWatchTarget[]
  timestamp?: string
}

interface CrawlerWatchTargetUpsertResponse {
  success: boolean
  item: CrawlerWatchTarget
  timestamp?: string
}

interface CrawlerWatchTargetDeleteResponse {
  success: boolean
  id: number
  timestamp?: string
}

export interface CollectCrawlerWatchTargetsResult {
  success: boolean
  message: string
  taskId?: string
  targetCount: number
  limitTargets?: number
  perTargetLimit?: number
  targets: Array<{
    id: number
    targetType: CrawlerWatchTargetType
    targetValue: string
    bizType: string
    priority: number
    dailyPreviewQuota: number
  }>
  timestamp?: string
}

export interface TriggerArtistCrawlResult {
  attempted: boolean
  success: boolean
  message: string
  action?: string
}

export interface TriggerArtworkArchiveResult {
  attempted: boolean
  success: boolean
  message: string
  requestedSizes: string[]
  enqueuedCount?: number
  skippedCount?: number
}

export interface RefreshCrawlerCandidateScoreResult {
  success: boolean
  limit: number
  updatedCount: number
  pidCount: number
  timestamp?: string
}

export interface RunCrawlerBackfillPreviewResult {
  success: boolean
  taskId?: string
  dryRun: boolean
  limit: number
  minPopularity: number
  minAgeDays: number
  sizes: string[]
  candidateCount: number
  enqueuedCount: number
  claimedCount: number
  candidatePreview: Array<{
    pid: string
    priority: number
    candidateScore: number
    sourceType: string
    sourceRecentAt?: string
    popularity: number
    view: number
  }>
  timestamp?: string
}

export interface CrawlerBusinessCandidateItem {
  pid: string
  priority: number
  candidateScore: number
  sourceType: string
  sourceKey?: string
  sourceRecentAt?: string
  popularity: number
  view: number
  downloadStage: 'none' | 'preview' | 'full'
  lastSourceType?: string
  bizType?: string
}

export interface GetCrawlerBusinessCandidatesResult {
  success: boolean
  pool: CrawlerBusinessCandidatePool
  limit: number
  topN: number
  excludePublished: boolean
  onlyDownloaded: boolean
  downloadStatus: CrawlerBusinessDownloadStatus
  artistId?: string
  tags: string[]
  count: number
  items: CrawlerBusinessCandidateItem[]
  timestamp?: string
}

function getCrawlerServerUrl() {
  if (!env.CRAWLER_SERVER_URL) {
    throw new Error('CRAWLER_SERVER_URL is not configured')
  }

  return env.CRAWLER_SERVER_URL
}

async function parseCrawlerResponse<T>(response: Response): Promise<T> {
  let body: unknown = null

  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : `Crawler request failed with HTTP ${response.status}`
    throw new Error(message)
  }

  return body as T
}

function buildCrawlerUrl(action: string, query: Record<string, string | number | boolean | undefined> = {}) {
  const url = new URL(getCrawlerServerUrl())
  url.searchParams.set('action', action)

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(key, String(value))
  }

  return url
}

async function postCrawlerAction(action: string, payload: Record<string, unknown>) {
  const response = await fetch(getCrawlerServerUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
    cache: 'no-store',
  })

  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  return { ok: response.ok, status: response.status, body }
}

async function getCrawlerAction<T>(
  action: string,
  query: Record<string, string | number | boolean | undefined> = {}
): Promise<T> {
  const response = await fetch(buildCrawlerUrl(action, query), {
    method: 'GET',
    cache: 'no-store',
  })

  return parseCrawlerResponse<T>(response)
}

async function postCrawlerJson<T>(action: string, payload: object) {
  const response = await fetch(getCrawlerServerUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
    cache: 'no-store',
  })

  return parseCrawlerResponse<T>(response)
}

export async function triggerArtistCrawlById(
  artistId: string,
  limit: number
): Promise<TriggerArtistCrawlResult> {
  if (!env.CRAWLER_SERVER_URL) {
    return {
      attempted: false,
      success: false,
      message: 'CRAWLER_SERVER_URL is not configured, skip crawler trigger',
    }
  }

  for (const action of DEFAULT_ARTIST_CRAWL_ACTIONS) {
    try {
      const result = await postCrawlerAction(action, { artistId, limit })
      if (result.ok) {
        return {
          attempted: true,
          success: true,
          action,
          message: `Crawler triggered (${action})`,
        }
      }
    } catch {
      // Try the next compatible action name.
    }
  }

  return {
    attempted: true,
    success: false,
    message: 'Crawler endpoint did not accept any known artist crawl action',
  }
}

export async function enqueueArtworkArchiveByPid(
  pid: string,
  requestedSizes: string[]
): Promise<TriggerArtworkArchiveResult> {
  const sizes = Array.from(
    new Set(
      requestedSizes
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )

  if (!env.CRAWLER_SERVER_URL) {
    return {
      attempted: false,
      success: false,
      requestedSizes: sizes,
      message: 'CRAWLER_SERVER_URL is not configured, skip archive queue',
    }
  }

  try {
    const result = await postCrawlerAction('enqueue-full-download', {
      pids: [pid],
      sizes,
      sourceType: 'manual',
      sourceKey: 'admin:favorite',
      priority: 980,
    })

    if (!result.ok) {
      return {
        attempted: true,
        success: false,
        requestedSizes: sizes,
        message: `Archive queue failed with HTTP ${result.status}`,
      }
    }

    const body = result.body as
      | {
          message?: string
          enqueuedCount?: number
          skippedCount?: number
        }
      | null
      | undefined

    const enqueuedCount = typeof body?.enqueuedCount === 'number' ? body.enqueuedCount : undefined
    const skippedCount = typeof body?.skippedCount === 'number' ? body.skippedCount : undefined

    return {
      attempted: true,
      success: true,
      requestedSizes: sizes,
      enqueuedCount,
      skippedCount,
      message:
        typeof body?.message === 'string' && body.message.trim()
          ? body.message
          : `Archive queued (${sizes.join(', ')})`,
    }
  } catch (error) {
    return {
      attempted: true,
      success: false,
      requestedSizes: sizes,
      message: error instanceof Error ? error.message : 'Archive queue failed',
    }
  }
}

export async function triggerArtworkArchiveByPid(
  pid: string,
  requestedSizes: string[]
): Promise<TriggerArtworkArchiveResult> {
  return enqueueArtworkArchiveByPid(pid, requestedSizes)
}

export async function listCrawlerWatchTargets() {
  const result = await getCrawlerAction<CrawlerWatchTargetListResponse>('watch-targets')
  return result.items
}

export async function upsertCrawlerWatchTarget(input: UpsertCrawlerWatchTargetInput) {
  const result = await postCrawlerJson<CrawlerWatchTargetUpsertResponse>('upsert-watch-target', input)
  return result.item
}

export async function deleteCrawlerWatchTarget(id: number) {
  const result = await postCrawlerJson<CrawlerWatchTargetDeleteResponse>('delete-watch-target', { id })
  return result.id
}

export async function collectCrawlerWatchTargets(options: {
  targetIds?: number[]
  limitTargets?: number
  perTargetLimit?: number
}) {
  return postCrawlerJson<CollectCrawlerWatchTargetsResult>('collect-watch-targets', options)
}

export async function refreshCrawlerCandidateScores(options?: {
  limit?: number
  pids?: string[]
}) {
  return postCrawlerJson<RefreshCrawlerCandidateScoreResult>('refresh-candidate-score', {
    limit: options?.limit,
    pids: options?.pids,
  })
}

export async function runCrawlerBackfillPreview(options?: {
  limit?: number
  minPopularity?: number
  minAgeDays?: number
  sizes?: string[]
  dryRun?: boolean
}) {
  return postCrawlerJson<RunCrawlerBackfillPreviewResult>('run-backfill-preview', {
    limit: options?.limit,
    minPopularity: options?.minPopularity,
    minAgeDays: options?.minAgeDays,
    sizes: options?.sizes,
    dryRun: options?.dryRun,
  })
}

export async function getCrawlerBusinessCandidates(options: {
  pool: CrawlerBusinessCandidatePool
  limit?: number
  topN?: number
  excludePublished?: boolean
  onlyDownloaded?: boolean
  downloadStatus?: CrawlerBusinessDownloadStatus
  artistId?: string
  tags?: string[]
}) {
  return postCrawlerJson<GetCrawlerBusinessCandidatesResult>('business-candidates', {
    pool: options.pool,
    limit: options.limit,
    topN: options.topN,
    excludePublished: options.excludePublished,
    onlyDownloaded: options.onlyDownloaded,
    downloadStatus: options.downloadStatus,
    artistId: options.artistId,
    tags: options.tags,
  })
}
