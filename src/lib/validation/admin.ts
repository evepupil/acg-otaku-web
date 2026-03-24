import { z } from 'zod'

const optionalText = z.string().trim().optional()
const optionalNullableText = z.string().trim().optional().transform((value) => value && value.length > 0 ? value : undefined)

export const adminPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const adminDailyPickListQuerySchema = adminPaginationQuerySchema.extend({
  pickType: z.enum(['ranking_pick', 'daily_art']).optional(),
})

export const createDailyPickSchema = z.object({
  pickDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickType: z.enum(['ranking_pick', 'daily_art']),
  title: optionalNullableText,
  description: optionalNullableText,
  coverPid: optionalNullableText,
})

export const updateDailyPickSchema = z.object({
  id: z.coerce.number().int().positive(),
  pickDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pickType: z.enum(['ranking_pick', 'daily_art']).optional(),
  title: optionalNullableText,
  description: optionalNullableText,
  coverPid: optionalNullableText,
  isPublished: z.boolean().optional(),
}).refine(
  ({ pickDate, pickType, title, description, coverPid, isPublished }) =>
    pickDate !== undefined ||
    pickType !== undefined ||
    title !== undefined ||
    description !== undefined ||
    coverPid !== undefined ||
    isPublished !== undefined,
  { message: 'At least one field must be updated' }
)

export const adminIdQuerySchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const createTopicFeatureSchema = z.object({
  topicName: z.string().trim().min(1).max(120),
  topicSlug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
  topicDescription: optionalNullableText,
  featureContent: optionalNullableText,
  coverPid: optionalNullableText,
  tags: optionalNullableText,
})

export const updateTopicFeatureSchema = z.object({
  id: z.coerce.number().int().positive(),
  topicName: z.string().trim().min(1).max(120).optional(),
  topicSlug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  topicDescription: optionalNullableText,
  featureContent: optionalNullableText,
  coverPid: optionalNullableText,
  tags: optionalNullableText,
  isPublished: z.boolean().optional(),
}).refine(
  ({ topicName, topicSlug, topicDescription, featureContent, coverPid, tags, isPublished }) =>
    topicName !== undefined ||
    topicSlug !== undefined ||
    topicDescription !== undefined ||
    featureContent !== undefined ||
    coverPid !== undefined ||
    tags !== undefined ||
    isPublished !== undefined,
  { message: 'At least one field must be updated' }
)

export const adminArtworkListQuerySchema = adminPaginationQuerySchema.extend({
  search: optionalText.transform((value) => value && value.length > 0 ? value : undefined),
})

export const createArtworkSchema = z.object({
  pid: z.string().trim().regex(/^\d+$/),
  downloadImages: z.boolean().optional().default(false),
})
