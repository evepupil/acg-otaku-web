import 'server-only'

import { and, eq, sql } from 'drizzle-orm'

import { db } from '@/db/client'
import { dailyPick, dailyPickArtwork, topicFeature, topicFeatureArtwork } from '@/db/schema'

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
