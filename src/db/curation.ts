import 'server-only'

import { and, desc, eq, like, or, sql } from 'drizzle-orm'

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

export async function removeTopicFeatureArtworkRecord(topicFeatureIdValue: number, pidValue: string) {
  await db
    .delete(topicFeatureArtwork)
    .where(and(eq(topicFeatureArtwork.topicFeatureId, topicFeatureIdValue), eq(topicFeatureArtwork.pid, pidValue)))
}
