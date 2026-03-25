import 'server-only'

import { asc, desc, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@/db/client'
import {
  artistFeature,
  artistFeatureArtwork,
  dailyPick,
  dailyPickArtwork,
  pic,
  topicFeature,
  topicFeatureArtwork,
} from '@/db/schema'
import type {
  AdminStats,
  ArtistFeature,
  Artwork,
  DailyPick,
  PickType,
  TopicFeature,
} from '@/types'

const DEFAULT_ARTIST_AVATAR_URL =
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20artist%20avatar%20profile%20picture&image_size=square'

type LinkedArtwork = Artwork & {
  editorComment?: string
  sortOrder?: number
}

interface PicRecord {
  pid: string
  title: string | null
  authorId: string | null
  authorName: string | null
  downloadTime: string | null
  tag: string
  good: number
  star: number
  view: number
  imagePath: string
  imageUrl: string
  popularity: number
  uploadTime: string | null
  wxUrl: string | null
  wxName: string | null
  curationType: string | null
  curatedDate: string | null
  editorComment: string | null
  unfit: number | null
  size: number | null
}

interface ArtworkLinkRow {
  parentId: number
  pid: string
  sortOrder: number
  editorComment: string | null
}

function mapPicRecordToArtwork(record: PicRecord, rank?: number): Artwork {
  return {
    id: Number(record.pid),
    title: record.title || `插画 ${record.pid}`,
    artist: {
      id: Number(record.authorId || '0'),
      name: record.authorName || '未知作者',
      avatar: DEFAULT_ARTIST_AVATAR_URL,
    },
    imageUrl: record.imageUrl || record.wxUrl || '',
    imagePath: record.imagePath || '',
    tags: record.tag ? record.tag.split(',').filter(Boolean) : [],
    createdAt: record.uploadTime || new Date().toISOString(),
    ...(rank !== undefined ? { rank } : {}),
    stats: {
      views: record.view || 0,
      likes: record.good || 0,
      bookmarks: record.star || 0,
    },
  }
}

function mapDailyPickRow(row: typeof dailyPick.$inferSelect, artworks: LinkedArtwork[] = []): DailyPick {
  return {
    id: row.id,
    pickDate: row.pickDate,
    pickType: row.pickType as PickType,
    title: row.title ?? '',
    description: row.description ?? '',
    coverPid: row.coverPid ?? '',
    isPublished: row.isPublished === 1,
    artworks,
    createdAt: row.createdAt ?? '',
    updatedAt: row.updatedAt ?? '',
  }
}

function mapArtistFeatureRow(
  row: typeof artistFeature.$inferSelect,
  artworks: LinkedArtwork[] = []
): ArtistFeature {
  return {
    id: row.id,
    artistId: row.artistId,
    artistName: row.artistName,
    artistAvatar: row.artistAvatar ?? '',
    artistBio: row.artistBio ?? '',
    featureTitle: row.featureTitle,
    featureContent: row.featureContent ?? '',
    coverPid: row.coverPid ?? '',
    pixivUrl: row.pixivUrl ?? '',
    twitterUrl: row.twitterUrl ?? '',
    isPublished: row.isPublished === 1,
    publishedAt: row.publishedAt ?? '',
    artworks,
    createdAt: row.createdAt ?? '',
    updatedAt: row.updatedAt ?? '',
  }
}

function mapTopicFeatureRow(
  row: typeof topicFeature.$inferSelect,
  artworks: LinkedArtwork[] = []
): TopicFeature {
  return {
    id: row.id,
    topicName: row.topicName,
    topicSlug: row.topicSlug,
    topicDescription: row.topicDescription ?? '',
    featureContent: row.featureContent ?? '',
    coverPid: row.coverPid ?? '',
    tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
    isPublished: row.isPublished === 1,
    publishedAt: row.publishedAt ?? '',
    artworks,
    createdAt: row.createdAt ?? '',
    updatedAt: row.updatedAt ?? '',
  }
}

async function getArtworkRecordMap(pids: string[]) {
  const uniquePids = Array.from(new Set(pids))

  if (uniquePids.length === 0) {
    return new Map<string, PicRecord>()
  }

  const artworkRows = await db
    .select({
      pid: pic.pid,
      title: pic.title,
      authorId: pic.authorId,
      authorName: pic.authorName,
      downloadTime: pic.downloadTime,
      tag: pic.tag,
      good: pic.good,
      star: pic.star,
      view: pic.view,
      imagePath: pic.imagePath,
      imageUrl: pic.imageUrl,
      popularity: pic.popularity,
      uploadTime: pic.uploadTime,
      wxUrl: pic.wxUrl,
      wxName: pic.wxName,
      curationType: pic.curationType,
      curatedDate: pic.curatedDate,
      editorComment: pic.editorComment,
      unfit: pic.unfit,
      size: pic.size,
    })
    .from(pic)
    .where(inArray(pic.pid, uniquePids))

  return new Map(artworkRows.map((row) => [row.pid, row]))
}

function buildArtworkMap(linkRows: ArtworkLinkRow[], artworkMap: Map<string, PicRecord>) {
  const grouped = new Map<number, LinkedArtwork[]>()

  for (const link of linkRows) {
    const artworkRecord = artworkMap.get(link.pid)

    if (!artworkRecord) {
      continue
    }

    const items = grouped.get(link.parentId) ?? []
    items.push({
      ...mapPicRecordToArtwork(artworkRecord),
      editorComment: link.editorComment ?? undefined,
      sortOrder: link.sortOrder ?? 0,
    })
    grouped.set(link.parentId, items)
  }

  return grouped
}

async function getDailyPickArtworkMap(ids: number[]) {
  if (ids.length === 0) {
    return new Map<number, LinkedArtwork[]>()
  }

  const linkRows = await db
    .select({
      parentId: dailyPickArtwork.dailyPickId,
      pid: dailyPickArtwork.pid,
      sortOrder: dailyPickArtwork.sortOrder,
      editorComment: dailyPickArtwork.editorComment,
    })
    .from(dailyPickArtwork)
    .where(inArray(dailyPickArtwork.dailyPickId, ids))
    .orderBy(asc(dailyPickArtwork.dailyPickId), asc(dailyPickArtwork.sortOrder))

  const artworkMap = await getArtworkRecordMap(linkRows.map((row) => row.pid))
  return buildArtworkMap(linkRows, artworkMap)
}

async function getArtistFeatureArtworkMap(ids: number[]) {
  if (ids.length === 0) {
    return new Map<number, LinkedArtwork[]>()
  }

  const linkRows = await db
    .select({
      parentId: artistFeatureArtwork.artistFeatureId,
      pid: artistFeatureArtwork.pid,
      sortOrder: artistFeatureArtwork.sortOrder,
      editorComment: artistFeatureArtwork.editorComment,
    })
    .from(artistFeatureArtwork)
    .where(inArray(artistFeatureArtwork.artistFeatureId, ids))
    .orderBy(asc(artistFeatureArtwork.artistFeatureId), asc(artistFeatureArtwork.sortOrder))

  const artworkMap = await getArtworkRecordMap(linkRows.map((row) => row.pid))
  return buildArtworkMap(linkRows, artworkMap)
}

async function getTopicFeatureArtworkMap(ids: number[]) {
  if (ids.length === 0) {
    return new Map<number, LinkedArtwork[]>()
  }

  const linkRows = await db
    .select({
      parentId: topicFeatureArtwork.topicFeatureId,
      pid: topicFeatureArtwork.pid,
      sortOrder: topicFeatureArtwork.sortOrder,
      editorComment: topicFeatureArtwork.editorComment,
    })
    .from(topicFeatureArtwork)
    .where(inArray(topicFeatureArtwork.topicFeatureId, ids))
    .orderBy(asc(topicFeatureArtwork.topicFeatureId), asc(topicFeatureArtwork.sortOrder))

  const artworkMap = await getArtworkRecordMap(linkRows.map((row) => row.pid))
  return buildArtworkMap(linkRows, artworkMap)
}

export async function getArtworkById(id: number) {
  const rows = await db
    .select({
      pid: pic.pid,
      title: pic.title,
      authorId: pic.authorId,
      authorName: pic.authorName,
      downloadTime: pic.downloadTime,
      tag: pic.tag,
      good: pic.good,
      star: pic.star,
      view: pic.view,
      imagePath: pic.imagePath,
      imageUrl: pic.imageUrl,
      popularity: pic.popularity,
      uploadTime: pic.uploadTime,
      wxUrl: pic.wxUrl,
      wxName: pic.wxName,
      curationType: pic.curationType,
      curatedDate: pic.curatedDate,
      editorComment: pic.editorComment,
      unfit: pic.unfit,
      size: pic.size,
    })
    .from(pic)
    .where(eq(pic.pid, String(id)))
    .limit(1)

  const record = rows[0]

  if (!record) {
    return null
  }

  const artwork = mapPicRecordToArtwork(record)

  return {
    ...artwork,
    pid: record.pid,
    popularity: record.popularity || 0,
    uploadTime: record.uploadTime ?? undefined,
    downloadTime: record.downloadTime ?? undefined,
    updatedAt: record.downloadTime || new Date().toISOString(),
    description: record.title || `插画 ${record.pid}`,
    editorComment: record.editorComment ?? null,
    curationType: record.curationType ?? null,
  }
}

export async function getDailyPicks(page = 1, limit = 20, pickType?: string) {
  const offset = (page - 1) * limit
  const where = pickType ? eq(dailyPick.pickType, pickType) : undefined

  const [countRows, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(dailyPick).where(where),
    db
      .select()
      .from(dailyPick)
      .where(where)
      .orderBy(desc(dailyPick.pickDate))
      .limit(limit)
      .offset(offset),
  ])

  return {
    picks: rows.map((row) => mapDailyPickRow(row)),
    total: Number(countRows[0]?.count) || 0,
  }
}

export async function getPublishedDailyPicks(page = 1, limit = 20, pickType?: string) {
  const offset = (page - 1) * limit
  const where = pickType
    ? sql`${dailyPick.isPublished} = 1 and ${dailyPick.pickType} = ${pickType}`
    : eq(dailyPick.isPublished, 1)

  const [countRows, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(dailyPick).where(where),
    db
      .select()
      .from(dailyPick)
      .where(where)
      .orderBy(desc(dailyPick.pickDate))
      .limit(limit)
      .offset(offset),
  ])

  const artworkMap = await getDailyPickArtworkMap(rows.map((row) => row.id))

  return {
    picks: rows.map((row) => mapDailyPickRow(row, artworkMap.get(row.id) ?? [])),
    total: Number(countRows[0]?.count) || 0,
  }
}

export async function getPublishedDailyPickSummaries(page = 1, limit = 20, pickType?: string) {
  const offset = (page - 1) * limit
  const where = pickType
    ? sql`${dailyPick.isPublished} = 1 and ${dailyPick.pickType} = ${pickType}`
    : eq(dailyPick.isPublished, 1)

  const [countRows, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(dailyPick).where(where),
    db
      .select()
      .from(dailyPick)
      .where(where)
      .orderBy(desc(dailyPick.pickDate))
      .limit(limit)
      .offset(offset),
  ])

  return {
    picks: rows.map((row) => mapDailyPickRow(row)),
    total: Number(countRows[0]?.count) || 0,
  }
}

export async function getDailyPickById(id: number) {
  const rows = await db.select().from(dailyPick).where(eq(dailyPick.id, id)).limit(1)
  const record = rows[0]

  if (!record) {
    return null
  }

  const artworkMap = await getDailyPickArtworkMap([id])
  return mapDailyPickRow(record, artworkMap.get(id) ?? [])
}

export async function getDailyPickByDate(date: string, pickType?: string) {
  const where = pickType
    ? sql`${dailyPick.pickDate} = ${date} and ${dailyPick.isPublished} = 1 and ${dailyPick.pickType} = ${pickType}`
    : sql`${dailyPick.pickDate} = ${date} and ${dailyPick.isPublished} = 1`

  const rows = await db.select().from(dailyPick).where(where).limit(1)
  const record = rows[0]

  if (!record) {
    return null
  }

  const artworkMap = await getDailyPickArtworkMap([record.id])
  return mapDailyPickRow(record, artworkMap.get(record.id) ?? [])
}

export async function getArtistFeatures(page = 1, limit = 20, publishedOnly = false) {
  const offset = (page - 1) * limit
  const where = publishedOnly ? eq(artistFeature.isPublished, 1) : undefined

  const [countRows, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(artistFeature).where(where),
    db
      .select()
      .from(artistFeature)
      .where(where)
      .orderBy(desc(artistFeature.createdAt))
      .limit(limit)
      .offset(offset),
  ])

  const artworkMap = publishedOnly
    ? await getArtistFeatureArtworkMap(rows.map((row) => row.id))
    : new Map<number, LinkedArtwork[]>()

  return {
    features: rows.map((row) => mapArtistFeatureRow(row, artworkMap.get(row.id) ?? [])),
    total: Number(countRows[0]?.count) || 0,
  }
}

export async function getArtistFeatureById(id: number) {
  const rows = await db.select().from(artistFeature).where(eq(artistFeature.id, id)).limit(1)
  const record = rows[0]

  if (!record) {
    return null
  }

  const artworkMap = await getArtistFeatureArtworkMap([id])
  return mapArtistFeatureRow(record, artworkMap.get(id) ?? [])
}

export async function getTopicFeatures(page = 1, limit = 20, publishedOnly = false) {
  const offset = (page - 1) * limit
  const where = publishedOnly ? eq(topicFeature.isPublished, 1) : undefined

  const [countRows, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(topicFeature).where(where),
    db
      .select()
      .from(topicFeature)
      .where(where)
      .orderBy(desc(topicFeature.createdAt))
      .limit(limit)
      .offset(offset),
  ])

  const artworkMap = publishedOnly
    ? await getTopicFeatureArtworkMap(rows.map((row) => row.id))
    : new Map<number, LinkedArtwork[]>()

  return {
    features: rows.map((row) => mapTopicFeatureRow(row, artworkMap.get(row.id) ?? [])),
    total: Number(countRows[0]?.count) || 0,
  }
}

export async function getTopicFeatureById(id: number) {
  const rows = await db.select().from(topicFeature).where(eq(topicFeature.id, id)).limit(1)
  const record = rows[0]

  if (!record) {
    return null
  }

  const artworkMap = await getTopicFeatureArtworkMap([id])
  return mapTopicFeatureRow(record, artworkMap.get(id) ?? [])
}

export async function getContentStats(): Promise<AdminStats> {
  const [artworks, dailyPicks, artistFeatures, topicFeatures] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(pic),
    db.select({
      total: sql<number>`count(*)`,
      published: sql<number>`sum(case when ${dailyPick.isPublished} = 1 then 1 else 0 end)`,
    }).from(dailyPick),
    db.select({
      total: sql<number>`count(*)`,
      published: sql<number>`sum(case when ${artistFeature.isPublished} = 1 then 1 else 0 end)`,
    }).from(artistFeature),
    db.select({
      total: sql<number>`count(*)`,
      published: sql<number>`sum(case when ${topicFeature.isPublished} = 1 then 1 else 0 end)`,
    }).from(topicFeature),
  ])

  return {
    totalArtworks: Number(artworks[0]?.count) || 0,
    totalDailyPicks: Number(dailyPicks[0]?.total) || 0,
    totalArtistFeatures: Number(artistFeatures[0]?.total) || 0,
    totalTopicFeatures: Number(topicFeatures[0]?.total) || 0,
    publishedDailyPicks: Number(dailyPicks[0]?.published) || 0,
    publishedArtistFeatures: Number(artistFeatures[0]?.published) || 0,
    publishedTopicFeatures: Number(topicFeatures[0]?.published) || 0,
  }
}
