import 'server-only'

import { and, desc, eq, inArray, isNotNull, isNull, like, or, sql } from 'drizzle-orm'

import { db } from '@/db/client'
import {
  artworkReview,
  artistFeature,
  artistFeatureArtwork,
  dailyPick,
  dailyPickArtwork,
  pic,
  topicFeature,
  topicFeatureArtwork,
} from '@/db/schema'

export interface DailyPickMutationInput {
  pickDate: string
  pickType: 'ranking_pick' | 'daily_art'
  title?: string
  description?: string
  coverPid?: string
}

export interface DailyPickUpdateInput {
  pickDate?: string
  pickType?: 'ranking_pick' | 'daily_art'
  title?: string
  description?: string
  coverPid?: string
  isPublished?: boolean
}

export interface TopicFeatureMutationInput {
  topicName: string
  topicSlug: string
  topicDescription?: string
  featureContent?: string
  coverPid?: string
  tags?: string
}

export interface TopicFeatureUpdateInput {
  topicName?: string
  topicSlug?: string
  topicDescription?: string
  featureContent?: string
  coverPid?: string
  tags?: string
  isPublished?: boolean
}

export interface ArtistFeatureMutationInput {
  artistId: string
  artistName: string
  artistAvatar?: string
  artistBio?: string
  featureTitle: string
  featureContent?: string
  coverPid?: string
  pixivUrl?: string
  twitterUrl?: string
}

export interface ArtistFeatureUpdateInput {
  artistName?: string
  artistAvatar?: string
  artistBio?: string
  featureTitle?: string
  featureContent?: string
  coverPid?: string
  pixivUrl?: string
  twitterUrl?: string
  isPublished?: boolean
}

export interface ArtworkMutationInput {
  pid: string
  title?: string
  authorId?: string
  authorName?: string
  tag?: string
  imageUrl?: string
  imagePath?: string
  good?: number
  star?: number
  view?: number
  popularity?: number
  curationType?: string
  curatedDate?: string
  editorComment?: string
}

interface CandidateArtworkRow {
  pid: string
  title: string | null
  authorId: string | null
  authorName: string | null
  tag: string
  imageUrl: string
  imagePath: string
  good: number
  star: number
  view: number
  popularity: number
  candidateScore: number | null
  uploadTime: string | null
}

export interface CandidateArtwork {
  id: number
  title: string
  artist: {
    id: number
    name: string
    avatar: string
  }
  imageUrl: string
  imagePath: string
  tags: string[]
  createdAt: string
  stats: {
    views: number
    likes: number
    bookmarks: number
  }
  candidateScore?: number
}

export type ArtworkReviewAction = 'favorite' | 'reject' | 'skip'
export type ArtworkReviewStatus = 'favorite' | 'rejected' | 'seen'

export interface FavoriteArtworkListResult {
  artworks: CandidateArtwork[]
  total: number
}

export type FavoriteArtworkSort = 'reviewed_desc' | 'pid_desc'
export type DownloadStatusFilter = 'any' | 'preview' | 'regular' | 'original'

const DEFAULT_ARTIST_AVATAR_URL =
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20artist%20avatar%20profile%20picture&image_size=square'

const ARTWORK_SCORE = sql<number>`(
  coalesce(${pic.popularity}, 0) +
  coalesce(${pic.star}, 0) * 10 +
  coalesce(${pic.good}, 0) * 3 +
  coalesce(${pic.view}, 0) / 100.0
)`

const CANDIDATE_PICK_SCORE = sql<number>`(
  case
    when coalesce(${pic.candidateScore}, 0) > 0 then coalesce(${pic.candidateScore}, 0)
    else ${ARTWORK_SCORE}
  end
)`

const HAS_PREVIEW_SIZE = sql`(
  coalesce(${pic.imageVariants}, '') like '%"thumb_mini":"%'
  or coalesce(${pic.imageVariants}, '') like '%"small":"%'
  or coalesce(${pic.imagePath}, '') like '%/thumb_mini.%'
  or coalesce(${pic.imagePath}, '') like '%/small.%'
)`

const HAS_REGULAR_SIZE = sql`(
  coalesce(${pic.imageVariants}, '') like '%"regular":"%'
  or coalesce(${pic.imagePath}, '') like '%/regular.%'
)`

const HAS_ORIGINAL_SIZE = sql`(
  coalesce(${pic.imageVariants}, '') like '%"original":"%'
  or coalesce(${pic.imagePath}, '') like '%/original.%'
)`

const HAS_ANY_ARCHIVE = sql`(
  coalesce(trim(${pic.imagePath}), '') not in ('', '[]')
  or coalesce(trim(${pic.imageVariants}), '') not in ('', '{}')
  or coalesce(${pic.downloadStage}, 'none') <> 'none'
)`

function buildDownloadStatusCondition(filter?: DownloadStatusFilter) {
  switch (filter) {
    case 'preview':
      return sql`((${HAS_PREVIEW_SIZE}) or coalesce(${pic.downloadStage}, 'none') = 'preview') and not (${HAS_REGULAR_SIZE}) and not (${HAS_ORIGINAL_SIZE})`
    case 'regular':
      return HAS_REGULAR_SIZE
    case 'original':
      return HAS_ORIGINAL_SIZE
    default:
      return null
  }
}

function mapCandidateArtwork(row: CandidateArtworkRow): CandidateArtwork {
  return {
    id: Number(row.pid),
    title: row.title || `插画 ${row.pid}`,
    artist: {
      id: Number(row.authorId || '0'),
      name: row.authorName || '未知作者',
      avatar: DEFAULT_ARTIST_AVATAR_URL,
    },
    imageUrl: row.imageUrl || '',
    imagePath: row.imagePath || '',
    tags: row.tag ? row.tag.split(',').filter(Boolean) : [],
    createdAt: row.uploadTime || new Date().toISOString(),
    stats: {
      views: row.view || 0,
      likes: row.good || 0,
      bookmarks: row.star || 0,
    },
    candidateScore: row.candidateScore ?? undefined,
  }
}

function shuffleArray<T>(items: T[]) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function mapReviewActionToStatus(action: ArtworkReviewAction): ArtworkReviewStatus {
  if (action === 'favorite') return 'favorite'
  if (action === 'reject') return 'rejected'
  return 'seen'
}

export async function createDailyPickRecord(data: DailyPickMutationInput) {
  const result = await db
    .insert(dailyPick)
    .values({
      pickDate: data.pickDate,
      pickType: data.pickType,
      title: data.title ?? null,
      description: data.description ?? null,
      coverPid: data.coverPid ?? null,
    })
    .returning({ id: dailyPick.id })

  return result[0]?.id ?? null
}

export async function updateDailyPickRecord(id: number, data: DailyPickUpdateInput) {
  const values = {
    updatedAt: sql`datetime('now')`,
    ...(data.pickDate !== undefined ? { pickDate: data.pickDate } : {}),
    ...(data.pickType !== undefined ? { pickType: data.pickType } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.coverPid !== undefined ? { coverPid: data.coverPid } : {}),
    ...(data.isPublished !== undefined ? { isPublished: data.isPublished ? 1 : 0 } : {}),
  }

  await db.update(dailyPick).set(values).where(eq(dailyPick.id, id))
}

export async function deleteDailyPickRecord(id: number) {
  await db.transaction(async (tx) => {
    await tx.delete(dailyPickArtwork).where(eq(dailyPickArtwork.dailyPickId, id))
    await tx.delete(dailyPick).where(eq(dailyPick.id, id))
  })
}

export async function createTopicFeatureRecord(data: TopicFeatureMutationInput) {
  const result = await db
    .insert(topicFeature)
    .values({
      topicName: data.topicName,
      topicSlug: data.topicSlug,
      topicDescription: data.topicDescription ?? null,
      featureContent: data.featureContent ?? null,
      coverPid: data.coverPid ?? null,
      tags: data.tags ?? null,
    })
    .returning({ id: topicFeature.id })

  return result[0]?.id ?? null
}

export async function createArtistFeatureRecord(data: ArtistFeatureMutationInput) {
  const result = await db
    .insert(artistFeature)
    .values({
      artistId: data.artistId,
      artistName: data.artistName,
      artistAvatar: data.artistAvatar ?? null,
      artistBio: data.artistBio ?? null,
      featureTitle: data.featureTitle,
      featureContent: data.featureContent ?? null,
      coverPid: data.coverPid ?? null,
      pixivUrl: data.pixivUrl ?? null,
      twitterUrl: data.twitterUrl ?? null,
    })
    .returning({ id: artistFeature.id })

  return result[0]?.id ?? null
}

export async function updateArtistFeatureRecord(id: number, data: ArtistFeatureUpdateInput) {
  const values = {
    updatedAt: sql`datetime('now')`,
    ...(data.artistName !== undefined ? { artistName: data.artistName } : {}),
    ...(data.artistAvatar !== undefined ? { artistAvatar: data.artistAvatar } : {}),
    ...(data.artistBio !== undefined ? { artistBio: data.artistBio } : {}),
    ...(data.featureTitle !== undefined ? { featureTitle: data.featureTitle } : {}),
    ...(data.featureContent !== undefined ? { featureContent: data.featureContent } : {}),
    ...(data.coverPid !== undefined ? { coverPid: data.coverPid } : {}),
    ...(data.pixivUrl !== undefined ? { pixivUrl: data.pixivUrl } : {}),
    ...(data.twitterUrl !== undefined ? { twitterUrl: data.twitterUrl } : {}),
    ...(data.isPublished !== undefined ? { isPublished: data.isPublished ? 1 : 0 } : {}),
    ...(data.isPublished ? { publishedAt: sql`datetime('now')` } : {}),
  }

  await db.update(artistFeature).set(values).where(eq(artistFeature.id, id))
}

export async function deleteArtistFeatureRecord(id: number) {
  await db.transaction(async (tx) => {
    await tx.delete(artistFeatureArtwork).where(eq(artistFeatureArtwork.artistFeatureId, id))
    await tx.delete(artistFeature).where(eq(artistFeature.id, id))
  })
}

export async function updateTopicFeatureRecord(id: number, data: TopicFeatureUpdateInput) {
  const values = {
    updatedAt: sql`datetime('now')`,
    ...(data.topicName !== undefined ? { topicName: data.topicName } : {}),
    ...(data.topicSlug !== undefined ? { topicSlug: data.topicSlug } : {}),
    ...(data.topicDescription !== undefined ? { topicDescription: data.topicDescription } : {}),
    ...(data.featureContent !== undefined ? { featureContent: data.featureContent } : {}),
    ...(data.coverPid !== undefined ? { coverPid: data.coverPid } : {}),
    ...(data.tags !== undefined ? { tags: data.tags } : {}),
    ...(data.isPublished !== undefined ? { isPublished: data.isPublished ? 1 : 0 } : {}),
    ...(data.isPublished ? { publishedAt: sql`datetime('now')` } : {}),
  }

  await db.update(topicFeature).set(values).where(eq(topicFeature.id, id))
}

export async function deleteTopicFeatureRecord(id: number) {
  await db.transaction(async (tx) => {
    await tx.delete(topicFeatureArtwork).where(eq(topicFeatureArtwork.topicFeatureId, id))
    await tx.delete(topicFeature).where(eq(topicFeature.id, id))
  })
}

export async function getArtworkExists(pidValue: string) {
  const result = await db
    .select({ pid: pic.pid })
    .from(pic)
    .where(eq(pic.pid, pidValue))
    .limit(1)

  return result.length > 0
}

export async function createArtworkRecord(data: ArtworkMutationInput) {
  await db.insert(pic).values({
    pid: data.pid,
    title: data.title ?? null,
    authorId: data.authorId ?? null,
    authorName: data.authorName ?? null,
    tag: data.tag ?? '',
    imageUrl: data.imageUrl ?? '',
    imagePath: data.imagePath ?? '',
    good: data.good ?? 0,
    star: data.star ?? 0,
    view: data.view ?? 0,
    popularity: data.popularity ?? 0,
    curationType: data.curationType ?? null,
    curatedDate: data.curatedDate ?? null,
    editorComment: data.editorComment ?? null,
    uploadTime: sql`datetime('now')`,
  })
}

export async function deleteArtworkRecord(pidValue: string) {
  await db.delete(pic).where(eq(pic.pid, pidValue))
}

export async function setArtworkUnfitStatus(pidValue: string, unfit: boolean) {
  await db
    .update(pic)
    .set({ unfit: unfit ? 1 : 0 })
    .where(eq(pic.pid, pidValue))
}

export async function getArtworkAdminList(page: number, limit: number, search?: string) {
  const offset = (page - 1) * limit
  const where = search
    ? or(
        like(pic.pid, `%${search}%`),
        like(pic.title, `%${search}%`),
        like(pic.authorName, `%${search}%`),
        like(pic.tag, `%${search}%`)
      )
    : undefined

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(pic)
    .where(where)

  const artworks = await db
    .select({
      pid: pic.pid,
      title: pic.title,
      authorId: pic.authorId,
      authorName: pic.authorName,
      tag: pic.tag,
      imageUrl: pic.imageUrl,
      imagePath: pic.imagePath,
      good: pic.good,
      star: pic.star,
      view: pic.view,
      uploadTime: pic.uploadTime,
    })
    .from(pic)
    .where(where)
    .orderBy(desc(pic.uploadTime))
    .limit(limit)
    .offset(offset)

  return {
    artworks: artworks.map((row) => ({
      id: Number(row.pid),
      title: row.title || `插画 ${row.pid}`,
      artist: {
        id: Number(row.authorId || '0'),
        name: row.authorName || '未知作者',
        avatar:
          'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20artist%20avatar%20profile%20picture&image_size=square',
      },
      imageUrl: row.imageUrl || '',
      imagePath: row.imagePath || '',
      tags: row.tag ? row.tag.split(',').filter(Boolean) : [],
      createdAt: row.uploadTime || new Date().toISOString(),
      stats: {
        views: row.view || 0,
        likes: row.good || 0,
        bookmarks: row.star || 0,
      },
    })),
    total: Number(count) || 0,
  }
}

export async function getCandidateArtworksByPids(pids: string[]) {
  const orderedPids = pids.map((pid) => pid.trim()).filter(Boolean)
  const uniquePids = Array.from(new Set(orderedPids))

  if (uniquePids.length === 0) {
    return []
  }

  const rows = await db
    .select({
      pid: pic.pid,
      title: pic.title,
      authorId: pic.authorId,
      authorName: pic.authorName,
      tag: pic.tag,
      imageUrl: pic.imageUrl,
      imagePath: pic.imagePath,
      good: pic.good,
      star: pic.star,
      view: pic.view,
      popularity: pic.popularity,
      candidateScore: pic.candidateScore,
      uploadTime: pic.uploadTime,
    })
    .from(pic)
    .where(inArray(pic.pid, uniquePids))

  const rowMap = new Map(rows.map((row) => [row.pid, row]))

  return orderedPids
    .map((pid) => rowMap.get(pid))
    .filter((row): row is CandidateArtworkRow => Boolean(row))
    .map(mapCandidateArtwork)
}

async function getReviewedArtworkPidSet() {
  const rows = await db.select({ pid: artworkReview.pid }).from(artworkReview)
  return new Set(rows.map((row) => row.pid))
}

async function getPublishedArtworkPidSet() {
  const [
    dailyArtworkRows,
    artistArtworkRows,
    topicArtworkRows,
    dailyCoverRows,
    artistCoverRows,
    topicCoverRows,
  ] = await Promise.all([
    db
      .select({ pid: dailyPickArtwork.pid })
      .from(dailyPickArtwork)
      .innerJoin(dailyPick, eq(dailyPickArtwork.dailyPickId, dailyPick.id))
      .where(eq(dailyPick.isPublished, 1)),
    db
      .select({ pid: artistFeatureArtwork.pid })
      .from(artistFeatureArtwork)
      .innerJoin(artistFeature, eq(artistFeatureArtwork.artistFeatureId, artistFeature.id))
      .where(eq(artistFeature.isPublished, 1)),
    db
      .select({ pid: topicFeatureArtwork.pid })
      .from(topicFeatureArtwork)
      .innerJoin(topicFeature, eq(topicFeatureArtwork.topicFeatureId, topicFeature.id))
      .where(eq(topicFeature.isPublished, 1)),
    db
      .select({ pid: dailyPick.coverPid })
      .from(dailyPick)
      .where(and(eq(dailyPick.isPublished, 1), isNotNull(dailyPick.coverPid))),
    db
      .select({ pid: artistFeature.coverPid })
      .from(artistFeature)
      .where(and(eq(artistFeature.isPublished, 1), isNotNull(artistFeature.coverPid))),
    db
      .select({ pid: topicFeature.coverPid })
      .from(topicFeature)
      .where(and(eq(topicFeature.isPublished, 1), isNotNull(topicFeature.coverPid))),
  ])

  const result = new Set<string>()
  for (const row of dailyArtworkRows) result.add(row.pid)
  for (const row of artistArtworkRows) result.add(row.pid)
  for (const row of topicArtworkRows) result.add(row.pid)
  for (const row of dailyCoverRows) if (row.pid) result.add(row.pid)
  for (const row of artistCoverRows) if (row.pid) result.add(row.pid)
  for (const row of topicCoverRows) if (row.pid) result.add(row.pid)
  return result
}

export async function isArtworkPublishedInCuration(pidValue: string) {
  const [
    dailyLink,
    artistLink,
    topicLink,
    dailyCover,
    artistCover,
    topicCover,
  ] = await Promise.all([
    db
      .select({ id: dailyPickArtwork.id })
      .from(dailyPickArtwork)
      .innerJoin(dailyPick, eq(dailyPickArtwork.dailyPickId, dailyPick.id))
      .where(and(eq(dailyPickArtwork.pid, pidValue), eq(dailyPick.isPublished, 1)))
      .limit(1),
    db
      .select({ id: artistFeatureArtwork.id })
      .from(artistFeatureArtwork)
      .innerJoin(artistFeature, eq(artistFeatureArtwork.artistFeatureId, artistFeature.id))
      .where(and(eq(artistFeatureArtwork.pid, pidValue), eq(artistFeature.isPublished, 1)))
      .limit(1),
    db
      .select({ id: topicFeatureArtwork.id })
      .from(topicFeatureArtwork)
      .innerJoin(topicFeature, eq(topicFeatureArtwork.topicFeatureId, topicFeature.id))
      .where(and(eq(topicFeatureArtwork.pid, pidValue), eq(topicFeature.isPublished, 1)))
      .limit(1),
    db
      .select({ id: dailyPick.id })
      .from(dailyPick)
      .where(and(eq(dailyPick.coverPid, pidValue), eq(dailyPick.isPublished, 1)))
      .limit(1),
    db
      .select({ id: artistFeature.id })
      .from(artistFeature)
      .where(and(eq(artistFeature.coverPid, pidValue), eq(artistFeature.isPublished, 1)))
      .limit(1),
    db
      .select({ id: topicFeature.id })
      .from(topicFeature)
      .where(and(eq(topicFeature.coverPid, pidValue), eq(topicFeature.isPublished, 1)))
      .limit(1),
  ])

  return (
    dailyLink.length > 0 ||
    artistLink.length > 0 ||
    topicLink.length > 0 ||
    dailyCover.length > 0 ||
    artistCover.length > 0 ||
    topicCover.length > 0
  )
}

function buildTopNRandomCandidates(rows: CandidateArtworkRow[], topN: number, limit: number) {
  const topPool = rows.slice(0, Math.max(limit, topN))
  return shuffleArray(topPool).slice(0, limit).map(mapCandidateArtwork)
}

export async function getDailyRandomTopNCandidates(
  limit = 30,
  topN = 200,
  excludePublished = true
) {
  const fetchLimit = Math.max(topN * 4, limit * 6, 200)
  const rows = await db
    .select({
      pid: pic.pid,
      title: pic.title,
      authorId: pic.authorId,
      authorName: pic.authorName,
      tag: pic.tag,
      imageUrl: pic.imageUrl,
      imagePath: pic.imagePath,
      good: pic.good,
      star: pic.star,
      view: pic.view,
      popularity: pic.popularity,
      candidateScore: pic.candidateScore,
      uploadTime: pic.uploadTime,
    })
    .from(pic)
    .where(or(eq(pic.unfit, 0), isNull(pic.unfit)))
    .orderBy(desc(CANDIDATE_PICK_SCORE), desc(ARTWORK_SCORE), desc(pic.uploadTime))
    .limit(fetchLimit)

  const excluded = excludePublished ? await getPublishedArtworkPidSet() : new Set<string>()
  const filtered = rows.filter((row) => !excluded.has(row.pid))

  return buildTopNRandomCandidates(filtered, topN, limit)
}

export async function getArtistRandomTopNCandidates(
  artistId: string,
  limit = 30,
  topN = 200,
  excludePublished = true
) {
  const fetchLimit = Math.max(topN * 4, limit * 6, 200)
  const rows = await db
    .select({
      pid: pic.pid,
      title: pic.title,
      authorId: pic.authorId,
      authorName: pic.authorName,
      tag: pic.tag,
      imageUrl: pic.imageUrl,
      imagePath: pic.imagePath,
      good: pic.good,
      star: pic.star,
      view: pic.view,
      popularity: pic.popularity,
      candidateScore: pic.candidateScore,
      uploadTime: pic.uploadTime,
    })
    .from(pic)
    .where(and(eq(pic.authorId, artistId), or(eq(pic.unfit, 0), isNull(pic.unfit))))
    .orderBy(desc(CANDIDATE_PICK_SCORE), desc(ARTWORK_SCORE), desc(pic.uploadTime))
    .limit(fetchLimit)

  const excluded = excludePublished ? await getPublishedArtworkPidSet() : new Set<string>()
  const filtered = rows.filter((row) => !excluded.has(row.pid))

  return buildTopNRandomCandidates(filtered, topN, limit)
}

function normalizeTags(input: string[]) {
  const merged = input
    .join(',')
    .split(/[,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)

  return Array.from(new Set(merged))
}

export async function getTopicRandomTopNCandidates(
  tagsInput: string[],
  limit = 30,
  topN = 200,
  excludePublished = true
) {
  const normalizedTags = normalizeTags(tagsInput)
  if (normalizedTags.length === 0) {
    return []
  }

  const fetchLimit = Math.max(topN * 4, limit * 6, 200)
  const likeClauses = normalizedTags.map((tag) => like(pic.tag, `%${tag}%`))
  const tagsWhere = likeClauses.length === 1 ? likeClauses[0] : or(...likeClauses)
  const rows = await db
    .select({
      pid: pic.pid,
      title: pic.title,
      authorId: pic.authorId,
      authorName: pic.authorName,
      tag: pic.tag,
      imageUrl: pic.imageUrl,
      imagePath: pic.imagePath,
      good: pic.good,
      star: pic.star,
      view: pic.view,
      popularity: pic.popularity,
      candidateScore: pic.candidateScore,
      uploadTime: pic.uploadTime,
    })
    .from(pic)
    .where(and(tagsWhere, or(eq(pic.unfit, 0), isNull(pic.unfit))))
    .orderBy(desc(CANDIDATE_PICK_SCORE), desc(ARTWORK_SCORE), desc(pic.uploadTime))
    .limit(fetchLimit)

  const excluded = excludePublished ? await getPublishedArtworkPidSet() : new Set<string>()
  const filtered = rows.filter((row) => !excluded.has(row.pid))

  return buildTopNRandomCandidates(filtered, topN, limit)
}

export async function getReviewCandidates(
  limit = 30,
  topN = 200,
  tag?: string,
  excludePublished = true,
  onlyDownloaded = false,
  downloadStatus: DownloadStatusFilter = 'any'
) {
  const fetchLimit = Math.max(topN * 4, limit * 8, 300)
  const conditions = [or(eq(pic.unfit, 0), isNull(pic.unfit))]

  if (tag) {
    conditions.push(like(pic.tag, `%${tag}%`))
  }

  if (onlyDownloaded) {
    conditions.push(HAS_ANY_ARCHIVE)
  }

  const downloadStatusCondition = buildDownloadStatusCondition(downloadStatus)
  if (downloadStatusCondition) {
    conditions.push(downloadStatusCondition)
  }

  const where = and(...conditions)

  const rows = await db
    .select({
      pid: pic.pid,
      title: pic.title,
      authorId: pic.authorId,
      authorName: pic.authorName,
      tag: pic.tag,
      imageUrl: pic.imageUrl,
      imagePath: pic.imagePath,
      good: pic.good,
      star: pic.star,
      view: pic.view,
      popularity: pic.popularity,
      candidateScore: pic.candidateScore,
      uploadTime: pic.uploadTime,
    })
    .from(pic)
    .where(where)
    .orderBy(desc(CANDIDATE_PICK_SCORE), desc(ARTWORK_SCORE), desc(pic.uploadTime))
    .limit(fetchLimit)

  const reviewedSet = await getReviewedArtworkPidSet()
  const publishedSet = excludePublished ? await getPublishedArtworkPidSet() : new Set<string>()
  const filtered = rows.filter((row) => !reviewedSet.has(row.pid) && !publishedSet.has(row.pid))

  return buildTopNRandomCandidates(filtered, topN, limit)
}

export async function recordArtworkReviewAction(
  pidValue: string,
  action: ArtworkReviewAction,
  note?: string
) {
  const status = mapReviewActionToStatus(action)
  const now = sql`datetime('now')`
  const reviewedAt = status === 'seen' ? null : now

  await db
    .insert(artworkReview)
    .values({
      pid: pidValue,
      status,
      reviewNote: note ?? null,
      firstSeenAt: now,
      lastSeenAt: now,
      reviewedAt,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: artworkReview.pid,
      set: {
        status,
        reviewNote: note ?? null,
        lastSeenAt: now,
        reviewedAt,
        updatedAt: now,
      },
    })
}

export async function getFavoriteArtworks(
  page: number,
  limit: number,
  options?: {
    search?: string
    tag?: string
    artistId?: string
    excludePublished?: boolean
    downloadStatus?: DownloadStatusFilter
    sortBy?: FavoriteArtworkSort
  }
): Promise<FavoriteArtworkListResult> {
  const offset = (page - 1) * limit
  const conditions = [eq(artworkReview.status, 'favorite' as const)]

  if (options?.search) {
    conditions.push(
      or(
        like(pic.pid, `%${options.search}%`),
        like(pic.title, `%${options.search}%`),
        like(pic.authorName, `%${options.search}%`),
        like(pic.tag, `%${options.search}%`)
      )!
    )
  }

  if (options?.tag) {
    conditions.push(like(pic.tag, `%${options.tag}%`))
  }

  if (options?.artistId) {
    conditions.push(eq(pic.authorId, options.artistId))
  }

  const downloadStatusCondition = buildDownloadStatusCondition(options?.downloadStatus)
  if (downloadStatusCondition) {
    conditions.push(downloadStatusCondition)
  }

  const where = and(...conditions)
  const orderBy =
    options?.sortBy === 'pid_desc'
      ? [sql`CAST(${pic.pid} AS INTEGER) DESC`, desc(artworkReview.reviewedAt)]
      : [desc(artworkReview.reviewedAt), desc(pic.uploadTime)]

  const rows = await db
    .select({
      pid: pic.pid,
      title: pic.title,
      authorId: pic.authorId,
      authorName: pic.authorName,
      tag: pic.tag,
      imageUrl: pic.imageUrl,
      imagePath: pic.imagePath,
      good: pic.good,
      star: pic.star,
      view: pic.view,
      popularity: pic.popularity,
      candidateScore: pic.candidateScore,
      uploadTime: pic.uploadTime,
      reviewedAt: artworkReview.reviewedAt,
    })
    .from(artworkReview)
    .innerJoin(pic, eq(artworkReview.pid, pic.pid))
    .where(where)
    .orderBy(...orderBy)

  const publishedSet = options?.excludePublished ? await getPublishedArtworkPidSet() : new Set<string>()
  const filteredRows = rows.filter((row) => !publishedSet.has(row.pid))
  const pagedRows = filteredRows.slice(offset, offset + limit)

  return {
    artworks: pagedRows.map((row) =>
      mapCandidateArtwork({
        pid: row.pid,
        title: row.title,
        authorId: row.authorId,
        authorName: row.authorName,
        tag: row.tag,
        imageUrl: row.imageUrl,
        imagePath: row.imagePath,
        good: row.good,
        star: row.star,
        view: row.view,
        popularity: row.popularity,
        candidateScore: row.candidateScore,
        uploadTime: row.uploadTime,
      })
    ),
    total: filteredRows.length,
  }
}

export async function getTopicFeatureSlugExists(topicSlugValue: string, excludeId?: number) {
  const result = excludeId === undefined
    ? await db
        .select({ id: topicFeature.id })
        .from(topicFeature)
        .where(eq(topicFeature.topicSlug, topicSlugValue))
        .limit(1)
    : await db
        .select({ id: topicFeature.id })
        .from(topicFeature)
        .where(and(eq(topicFeature.topicSlug, topicSlugValue), sql`${topicFeature.id} <> ${excludeId}`))
        .limit(1)

  return result.length > 0
}

export async function getDailyPickExists(pickDateValue: string, pickTypeValue: DailyPickMutationInput['pickType'], excludeId?: number) {
  const result = excludeId === undefined
    ? await db
        .select({ id: dailyPick.id })
        .from(dailyPick)
        .where(and(eq(dailyPick.pickDate, pickDateValue), eq(dailyPick.pickType, pickTypeValue)))
        .limit(1)
    : await db
        .select({ id: dailyPick.id })
        .from(dailyPick)
        .where(
          and(
            eq(dailyPick.pickDate, pickDateValue),
            eq(dailyPick.pickType, pickTypeValue),
            sql`${dailyPick.id} <> ${excludeId}`
          )
        )
        .limit(1)

  return result.length > 0
}

export async function getDailyPickArtworkLinkExists(dailyPickIdValue: number, pidValue: string) {
  const result = await db
    .select({ id: dailyPickArtwork.id })
    .from(dailyPickArtwork)
    .where(and(eq(dailyPickArtwork.dailyPickId, dailyPickIdValue), eq(dailyPickArtwork.pid, pidValue)))
    .limit(1)

  return result.length > 0
}

export async function addDailyPickArtworkRecord(
  dailyPickIdValue: number,
  pidValue: string,
  sortOrder = 0,
  editorComment?: string
) {
  await db.insert(dailyPickArtwork).values({
    dailyPickId: dailyPickIdValue,
    pid: pidValue,
    sortOrder,
    editorComment: editorComment ?? null,
  })
}

export async function updateDailyPickArtworkComments(
  dailyPickIdValue: number,
  commentsByPid: Record<string, string>
) {
  await db.transaction(async (tx) => {
    for (const [pidValue, editorComment] of Object.entries(commentsByPid)) {
      await tx
        .update(dailyPickArtwork)
        .set({ editorComment: editorComment ?? null })
        .where(and(eq(dailyPickArtwork.dailyPickId, dailyPickIdValue), eq(dailyPickArtwork.pid, pidValue)))
    }
  })
}

export async function removeDailyPickArtworkRecord(dailyPickIdValue: number, pidValue: string) {
  await db
    .delete(dailyPickArtwork)
    .where(and(eq(dailyPickArtwork.dailyPickId, dailyPickIdValue), eq(dailyPickArtwork.pid, pidValue)))
}

export async function getArtistFeatureArtworkLinkExists(artistFeatureIdValue: number, pidValue: string) {
  const result = await db
    .select({ id: artistFeatureArtwork.id })
    .from(artistFeatureArtwork)
    .where(and(eq(artistFeatureArtwork.artistFeatureId, artistFeatureIdValue), eq(artistFeatureArtwork.pid, pidValue)))
    .limit(1)

  return result.length > 0
}

export async function addArtistFeatureArtworkRecord(
  artistFeatureIdValue: number,
  pidValue: string,
  sortOrder = 0,
  editorComment?: string
) {
  await db.insert(artistFeatureArtwork).values({
    artistFeatureId: artistFeatureIdValue,
    pid: pidValue,
    sortOrder,
    editorComment: editorComment ?? null,
  })
}

export async function updateArtistFeatureArtworkComments(
  artistFeatureIdValue: number,
  commentsByPid: Record<string, string>
) {
  await db.transaction(async (tx) => {
    for (const [pidValue, editorComment] of Object.entries(commentsByPid)) {
      await tx
        .update(artistFeatureArtwork)
        .set({ editorComment: editorComment ?? null })
        .where(
          and(
            eq(artistFeatureArtwork.artistFeatureId, artistFeatureIdValue),
            eq(artistFeatureArtwork.pid, pidValue)
          )
        )
    }
  })
}

export async function removeArtistFeatureArtworkRecord(artistFeatureIdValue: number, pidValue: string) {
  await db
    .delete(artistFeatureArtwork)
    .where(and(eq(artistFeatureArtwork.artistFeatureId, artistFeatureIdValue), eq(artistFeatureArtwork.pid, pidValue)))
}

export async function getTopicFeatureArtworkLinkExists(topicFeatureIdValue: number, pidValue: string) {
  const result = await db
    .select({ id: topicFeatureArtwork.id })
    .from(topicFeatureArtwork)
    .where(and(eq(topicFeatureArtwork.topicFeatureId, topicFeatureIdValue), eq(topicFeatureArtwork.pid, pidValue)))
    .limit(1)

  return result.length > 0
}

export async function addTopicFeatureArtworkRecord(
  topicFeatureIdValue: number,
  pidValue: string,
  sortOrder = 0,
  editorComment?: string
) {
  await db.insert(topicFeatureArtwork).values({
    topicFeatureId: topicFeatureIdValue,
    pid: pidValue,
    sortOrder,
    editorComment: editorComment ?? null,
  })
}

export async function updateTopicFeatureArtworkComments(
  topicFeatureIdValue: number,
  commentsByPid: Record<string, string>
) {
  await db.transaction(async (tx) => {
    for (const [pidValue, editorComment] of Object.entries(commentsByPid)) {
      await tx
        .update(topicFeatureArtwork)
        .set({ editorComment: editorComment ?? null })
        .where(
          and(
            eq(topicFeatureArtwork.topicFeatureId, topicFeatureIdValue),
            eq(topicFeatureArtwork.pid, pidValue)
          )
        )
    }
  })
}

export async function removeTopicFeatureArtworkRecord(topicFeatureIdValue: number, pidValue: string) {
  await db
    .delete(topicFeatureArtwork)
    .where(and(eq(topicFeatureArtwork.topicFeatureId, topicFeatureIdValue), eq(topicFeatureArtwork.pid, pidValue)))
}
