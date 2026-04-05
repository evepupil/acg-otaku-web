import { z } from 'zod'

const optionalText = z.string().trim().optional()
const optionalNullableText = z.string().trim().optional().transform((value) => value && value.length > 0 ? value : undefined)
const booleanQuery = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  }
  return value
}, z.boolean())

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

export const createArtworkBatchSchema = z.object({
  pids: z.array(z.string().trim().regex(/^\d+$/)).min(1).max(50),
  downloadImages: z.boolean().optional().default(false),
})

export const adminPidQuerySchema = z.object({
  pid: z.string().trim().regex(/^\d+$/),
})

export const adminRouteIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const createCurationArtworkLinkSchema = z.object({
  pid: z.string().trim().regex(/^\d+$/),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
  editorComment: optionalNullableText,
})

export const createArtistFeatureSchema = z.object({
  artistId: z.string().trim().min(1).max(120),
  artistName: z.string().trim().min(1).max(120),
  artistAvatar: optionalNullableText,
  artistBio: optionalNullableText,
  featureTitle: z.string().trim().min(1).max(160),
  featureContent: optionalNullableText,
  coverPid: optionalNullableText,
  pixivUrl: optionalNullableText,
  twitterUrl: optionalNullableText,
})

export const adminCandidateQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(30),
  topN: z.coerce.number().int().min(1).max(1000).default(200),
  excludePublished: booleanQuery.default(true),
})

export const adminTopicCandidateQuerySchema = adminCandidateQuerySchema.extend({
  topicName: optionalText,
  tags: optionalText,
})

export const adminArtistCandidateSchema = adminCandidateQuerySchema.extend({
  artistId: z.string().trim().min(1).max(120),
  crawlBeforeQuery: z.boolean().optional().default(true),
})

export const updateArtistFeatureSchema = z.object({
  id: z.coerce.number().int().positive(),
  artistName: z.string().trim().min(1).max(120).optional(),
  artistAvatar: optionalNullableText,
  artistBio: optionalNullableText,
  featureTitle: z.string().trim().min(1).max(160).optional(),
  featureContent: optionalNullableText,
  coverPid: optionalNullableText,
  pixivUrl: optionalNullableText,
  twitterUrl: optionalNullableText,
  isPublished: z.boolean().optional(),
}).refine(
  ({ artistName, artistAvatar, artistBio, featureTitle, featureContent, coverPid, pixivUrl, twitterUrl, isPublished }) =>
    artistName !== undefined ||
    artistAvatar !== undefined ||
    artistBio !== undefined ||
    featureTitle !== undefined ||
    featureContent !== undefined ||
    coverPid !== undefined ||
    pixivUrl !== undefined ||
    twitterUrl !== undefined ||
    isPublished !== undefined,
  { message: 'At least one field must be updated' }
)

export const adminReviewCandidateQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(30),
  topN: z.coerce.number().int().min(1).max(1000).default(200),
  tag: optionalText.transform((value) => value && value.length > 0 ? value : undefined),
  excludePublished: booleanQuery.default(true),
  onlyDownloaded: booleanQuery.default(false),
  downloadStatus: z.enum(['any', 'preview', 'regular', 'original']).default('any'),
})

export const adminReviewActionSchema = z.object({
  pid: z.string().trim().regex(/^\d+$/),
  action: z.enum(['favorite', 'reject', 'skip']),
  note: optionalNullableText,
})

export const adminFavoriteListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  search: optionalText.transform((value) => value && value.length > 0 ? value : undefined),
  tag: optionalText.transform((value) => value && value.length > 0 ? value : undefined),
  artistId: optionalText.transform((value) => value && value.length > 0 ? value : undefined),
  excludePublished: booleanQuery.default(true),
  downloadStatus: z.enum(['any', 'preview', 'regular', 'original']).default('any'),
  sortBy: z.enum(['reviewed_desc', 'pid_desc']).default('reviewed_desc'),
})

const createDailyFromFavoritesSchema = z.object({
  type: z.literal('daily'),
  pids: z.array(z.string().trim().regex(/^\d+$/)).min(1).max(200),
  pickDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: optionalNullableText,
  description: optionalNullableText,
})

const createTopicFromFavoritesSchema = z.object({
  type: z.literal('topic'),
  pids: z.array(z.string().trim().regex(/^\d+$/)).min(1).max(200),
  topicName: z.string().trim().min(1).max(120),
  topicSlug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  topicDescription: optionalNullableText,
  featureContent: optionalNullableText,
  tags: optionalNullableText,
})

export const adminCreateCurationFromFavoritesSchema = z.discriminatedUnion('type', [
  createDailyFromFavoritesSchema,
  createTopicFromFavoritesSchema,
])

export const adminRegenerateCurationContentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('daily'),
    id: z.coerce.number().int().positive(),
  }),
  z.object({
    type: z.literal('topic'),
    id: z.coerce.number().int().positive(),
  }),
  z.object({
    type: z.literal('artist'),
    id: z.coerce.number().int().positive(),
  }),
])

const watchTargetTypeSchema = z.enum(['tag', 'artist'])

export const adminWatchTargetUpsertSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  targetType: watchTargetTypeSchema,
  targetValue: z.string().trim().min(1).max(120),
  bizType: z.string().trim().min(1).max(60).default('general'),
  priority: z.coerce.number().int().min(0).max(1000).default(500),
  windowDays: z.coerce.number().int().min(1).max(90).default(7),
  dailyPreviewQuota: z.coerce.number().int().min(1).max(500).default(50),
  enabled: z.boolean().default(true),
})

export const adminWatchTargetDeleteSchema = z.object({
  id: z.coerce.number().int().positive(),
})

const adminWatchTargetCollectSchema = z.object({
  action: z.literal('collect'),
  targetIds: z.array(z.coerce.number().int().positive()).max(100).optional(),
  limitTargets: z.coerce.number().int().min(1).max(100).optional(),
  perTargetLimit: z.coerce.number().int().min(1).max(200).optional(),
})

const adminWatchTargetUpsertActionSchema = z
  .object({
    action: z.literal('upsert'),
  })
  .merge(adminWatchTargetUpsertSchema)

const adminWatchTargetBatchUpsertSchema = z.object({
  action: z.literal('batch-upsert'),
  items: z.array(adminWatchTargetUpsertSchema.omit({ id: true })).min(1).max(100),
  runAfterImport: z.boolean().default(false),
  perTargetLimit: z.coerce.number().int().min(1).max(200).optional(),
})

export const adminWatchTargetActionSchema = z.discriminatedUnion('action', [
  adminWatchTargetUpsertActionSchema,
  adminWatchTargetBatchUpsertSchema,
  adminWatchTargetCollectSchema,
])

const adminCrawlerRefreshCandidateScoreSchema = z.object({
  action: z.literal('refresh-candidate-score'),
  limit: z.coerce.number().int().min(1).max(2000).default(200),
})

const adminCrawlerRunBackfillPreviewSchema = z.object({
  action: z.literal('run-backfill-preview'),
  limit: z.coerce.number().int().min(1).max(500).default(30),
  minPopularity: z.coerce.number().min(0).default(0),
  minAgeDays: z.coerce.number().int().min(1).max(3650).default(30),
  dryRun: z.boolean().default(false),
})

export const adminCrawlerManualActionSchema = z.discriminatedUnion('action', [
  adminCrawlerRefreshCandidateScoreSchema,
  adminCrawlerRunBackfillPreviewSchema,
])
