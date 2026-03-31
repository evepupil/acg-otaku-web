import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const pic = sqliteTable('pic', {
  pid: text('pid').primaryKey(),
  title: text('title'),
  authorId: text('author_id'),
  authorName: text('author_name'),
  downloadTime: text('download_time'),
  tag: text('tag').notNull().default(''),
  good: integer('good').notNull().default(0),
  star: integer('star').notNull().default(0),
  view: integer('view').notNull().default(0),
  imagePath: text('image_path').notNull().default(''),
  imageUrl: text('image_url').notNull().default(''),
  popularity: integer('popularity').notNull().default(0),
  uploadTime: text('upload_time'),
  wxUrl: text('wx_url'),
  wxName: text('wx_name'),
  curationType: text('curation_type'),
  curatedDate: text('curated_date'),
  editorComment: text('editor_comment'),
  unfit: integer('unfit'),
  size: integer('size'),
})

export const dailyPick = sqliteTable('daily_pick', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pickDate: text('pick_date').notNull(),
  pickType: text('pick_type').notNull().default('daily_art'),
  title: text('title'),
  description: text('description'),
  coverPid: text('cover_pid'),
  isPublished: integer('is_published').notNull().default(0),
  createdAt: text('created_at').default("datetime('now')"),
  updatedAt: text('updated_at').default("datetime('now')"),
})

export const dailyPickArtwork = sqliteTable('daily_pick_artwork', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dailyPickId: integer('daily_pick_id').notNull(),
  pid: text('pid').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  editorComment: text('editor_comment'),
})

export const artistFeature = sqliteTable('artist_feature', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  artistId: text('artist_id').notNull(),
  artistName: text('artist_name').notNull(),
  artistAvatar: text('artist_avatar'),
  artistBio: text('artist_bio'),
  featureTitle: text('feature_title').notNull(),
  featureContent: text('feature_content'),
  coverPid: text('cover_pid'),
  pixivUrl: text('pixiv_url'),
  twitterUrl: text('twitter_url'),
  isPublished: integer('is_published').notNull().default(0),
  publishedAt: text('published_at'),
  createdAt: text('created_at').default("datetime('now')"),
  updatedAt: text('updated_at').default("datetime('now')"),
})

export const artistFeatureArtwork = sqliteTable('artist_feature_artwork', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  artistFeatureId: integer('artist_feature_id').notNull(),
  pid: text('pid').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  editorComment: text('editor_comment'),
})

export const topicFeature = sqliteTable('topic_feature', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  topicName: text('topic_name').notNull(),
  topicSlug: text('topic_slug').notNull(),
  topicDescription: text('topic_description'),
  featureContent: text('feature_content'),
  coverPid: text('cover_pid'),
  tags: text('tags'),
  isPublished: integer('is_published').notNull().default(0),
  publishedAt: text('published_at'),
  createdAt: text('created_at').default("datetime('now')"),
  updatedAt: text('updated_at').default("datetime('now')"),
})

export const topicFeatureArtwork = sqliteTable('topic_feature_artwork', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  topicFeatureId: integer('topic_feature_id').notNull(),
  pid: text('pid').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  editorComment: text('editor_comment'),
})

export const artworkReview = sqliteTable('artwork_review', {
  pid: text('pid').primaryKey(),
  status: text('status').notNull().default('seen'), // seen | favorite | rejected
  reviewNote: text('review_note'),
  firstSeenAt: text('first_seen_at').default("datetime('now')"),
  lastSeenAt: text('last_seen_at').default("datetime('now')"),
  reviewedAt: text('reviewed_at'),
  createdAt: text('created_at').default("datetime('now')"),
  updatedAt: text('updated_at').default("datetime('now')"),
})
