import { createClient, Client } from '@libsql/client'
import { env } from '@/env'

/**
 * Turso数据库客户端配置
 * 优先使用Turso作为主数据库，替代Supabase
 * 表结构与Supabase保持一致
 */

// 获取环境变量
const tursoUrl = env.TURSO_DATABASE_URL
const tursoAuthToken = env.TURSO_AUTH_TOKEN

// Turso客户端实例（单例模式）
let tursoClient: Client | null = null

/**
 * 获取Turso数据库客户端
 * 使用单例模式确保只创建一个连接
 * @returns Turso客户端实例
 */
export function getTursoClient(): Client {
  if (!tursoClient) {
    if (!tursoUrl || !tursoAuthToken) {
      throw new Error('缺少Turso数据库环境变量：TURSO_DATABASE_URL 或 TURSO_AUTH_TOKEN')
    }

    tursoClient = createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })
  }

  return tursoClient
}

/**
 * 数据库表类型定义
 * 基于爬虫项目的数据库结构，与Supabase保持一致
 */
export interface DatabasePic {
  pid: string
  title?: string
  author_id?: string
  author_name?: string
  download_time?: string
  tag: string
  good: number
  star: number
  view: number
  image_path: string
  image_url: string
  popularity: number
  upload_time?: string
  wx_url?: string
  wx_name?: string
  curation_type?: string
  curated_date?: string
  editor_comment?: string
  unfit?: number  // SQLite使用0/1代替布尔值
  size?: number
}

export interface DatabaseRanking {
  id: number
  pid: string
  rank: number
  rank_type: 'daily' | 'weekly' | 'monthly'
  crawl_time: string
  created_at?: string
  updated_at?: string
}

/**
 * 生成默认头像URL
 * @returns 头像URL
 */
function generateAvatarUrl(): string {
  return `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20artist%20avatar%20profile%20picture&image_size=square`
}

/**
 * 将数据库记录转换为前端Artwork类型
 * @param pic 数据库pic记录
 * @param rank 可选的排名
 * @returns 前端Artwork对象
 */
function transformPicToArtwork(pic: DatabasePic, rank?: number) {
  return {
    id: parseInt(pic.pid),
    title: pic.title || `插画 ${pic.pid}`,
    artist: {
      id: parseInt(pic.author_id || '0'),
      name: pic.author_name || '未知作者',
      avatar: generateAvatarUrl()
    },
    imageUrl: pic.image_url || pic.wx_url || '',
    imagePath: pic.image_path || '',  // 添加 imagePath 字段用于 B2 存储桶访问
    tags: pic.tag ? pic.tag.split(',').filter(Boolean) : [],
    createdAt: pic.upload_time || new Date().toISOString(),
    ...(rank !== undefined && { rank }),
    stats: {
      views: pic.view || 0,
      likes: pic.good || 0,
      bookmarks: pic.star || 0
    }
  }
}

/**
 * 获取排行榜数据
 * @param rankType 排行榜类型：daily/weekly/monthly
 * @param page 页码
 * @param limit 每页数量
 * @returns 排行榜数据和总数
 */
export async function getRankings(
  rankType: 'daily' | 'weekly' | 'monthly' = 'daily',
  page: number = 1,
  limit: number = 20
) {
  const client = getTursoClient()
  const offset = (page - 1) * limit

  // 获取排行榜数据，只返回最新爬取时间的数据
  const rankingsResult = await client.execute({
    sql: `
      SELECT r.pid, r.rank, p.*
      FROM ranking r
      LEFT JOIN pic p ON r.pid = p.pid
      WHERE r.rank_type = ?
        AND r.crawl_time = (
          SELECT MAX(crawl_time)
          FROM ranking
          WHERE rank_type = ?
        )
      ORDER BY r.rank ASC
      LIMIT ? OFFSET ?
    `,
    args: [rankType, rankType, limit, offset]
  })

  if (!rankingsResult.rows || rankingsResult.rows.length === 0) {
    return { artworks: [], total: 0 }
  }

  // 转换数据为前端格式
  const artworks = rankingsResult.rows.map(row => {
    const pic: DatabasePic = {
      pid: String(row.pid),
      title: row.title as string | undefined,
      author_id: row.author_id as string | undefined,
      author_name: row.author_name as string | undefined,
      download_time: row.download_time as string | undefined,
      tag: (row.tag as string) || '',
      good: Number(row.good) || 0,
      star: Number(row.star) || 0,
      view: Number(row.view) || 0,
      image_path: (row.image_path as string) || '',
      image_url: (row.image_url as string) || '',
      popularity: Number(row.popularity) || 0,
      upload_time: row.upload_time as string | undefined,
      wx_url: row.wx_url as string | undefined,
      wx_name: row.wx_name as string | undefined,
      unfit: row.unfit as number | undefined,
      size: row.size as number | undefined
    }
    return transformPicToArtwork(pic, Number(row.rank))
  })

  // 获取总数，只统计最新爬取时间的数据
  const countResult = await client.execute({
    sql: `
      SELECT COUNT(*) as count FROM ranking
      WHERE rank_type = ?
        AND crawl_time = (
          SELECT MAX(crawl_time)
          FROM ranking
          WHERE rank_type = ?
        )
    `,
    args: [rankType, rankType]
  })
  const total = Number(countResult.rows[0]?.count) || 0

  return { artworks, total }
}

/**
 * 获取插画详情
 * @param pid 插画ID
 * @returns 插画详情
 */
export async function getArtworkById(pid: number) {
  const client = getTursoClient()

  const result = await client.execute({
    sql: 'SELECT * FROM pic WHERE pid = ?',
    args: [pid.toString()]
  })

  if (!result.rows || result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]
  const pic: DatabasePic = {
    pid: String(row.pid),
    title: row.title as string | undefined,
    author_id: row.author_id as string | undefined,
    author_name: row.author_name as string | undefined,
    download_time: row.download_time as string | undefined,
    tag: (row.tag as string) || '',
    good: Number(row.good) || 0,
    star: Number(row.star) || 0,
    view: Number(row.view) || 0,
    image_path: (row.image_path as string) || '',
    image_url: (row.image_url as string) || '',
    popularity: Number(row.popularity) || 0,
    upload_time: row.upload_time as string | undefined,
    wx_url: row.wx_url as string | undefined,
    wx_name: row.wx_name as string | undefined,
    unfit: row.unfit as number | undefined,
    size: row.size as number | undefined,
    curation_type: row.curation_type as string | undefined,
    curated_date: row.curated_date as string | undefined,
    editor_comment: row.editor_comment as string | undefined
  }

  return {
    id: parseInt(pic.pid),
    pid: pic.pid,
    title: pic.title || `插画 ${pic.pid}`,
    artist: {
      id: parseInt(pic.author_id || '0'),
      name: pic.author_name || '未知作者',
      avatar: '',
      followerCount: 0
    },
    imageUrl: pic.image_url || pic.wx_url || '',
    imagePath: pic.image_path || '',  // 添加 imagePath 字段用于 B2 存储桶访问
    stats: {
      views: pic.view || 0,
      likes: pic.good || 0,
      bookmarks: pic.star || 0
    },
    tags: pic.tag ? pic.tag.split(',').filter(Boolean) : [],
    popularity: pic.popularity,
    uploadTime: pic.upload_time,
    downloadTime: pic.download_time,
    createdAt: pic.upload_time || new Date().toISOString(),
    updatedAt: pic.download_time || new Date().toISOString(),
    description: pic.title || `插画 ${pic.pid}`,
    editorComment: pic.editor_comment || null,
    curationType: pic.curation_type || null
  }
}

/**
 * 记录用户行为
 * @param userId 用户ID
 * @param artworkId 作品ID
 * @param action 行为类型
 */
export async function recordUserBehavior(
  userId: string,
  artworkId: number,
  action: 'view' | 'like' | 'share'
) {
  const client = getTursoClient()

  await client.execute({
    sql: `
      INSERT INTO user_behavior (user_id, artwork_id, action, created_at)
      VALUES (?, ?, ?, ?)
    `,
    args: [userId, artworkId, action, new Date().toISOString()]
  })

  return { success: true }
}

// ==================== 策展模式数据访问层 ====================

/**
 * 通过PID添加作品到pic表（管理后台用）
 */
export async function addArtworkByPid(data: {
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
}) {
  const client = getTursoClient()

  await client.execute({
    sql: `
      INSERT OR REPLACE INTO pic (pid, title, author_id, author_name, tag, image_url, image_path, good, star, view, popularity, curation_type, curated_date, editor_comment, upload_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `,
    args: [
      data.pid,
      data.title || null,
      data.authorId || null,
      data.authorName || null,
      data.tag || '',
      data.imageUrl || '',
      data.imagePath || '',
      data.good || 0,
      data.star || 0,
      data.view || 0,
      data.popularity || 0,
      data.curationType || null,
      data.curatedDate || null,
      data.editorComment || null,
    ]
  })
}

/**
 * 删除作品
 */
export async function deleteArtwork(pid: string) {
  const client = getTursoClient()
  await client.execute({ sql: 'DELETE FROM pic WHERE pid = ?', args: [pid] })
}

/**
 * 获取作品列表（管理后台，支持搜索和分页）
 */
export async function getArtworkList(page: number = 1, limit: number = 20, search?: string) {
  const client = getTursoClient()
  const offset = (page - 1) * limit

  let whereClauses = '1=1'
  const args: (string | number)[] = []

  if (search) {
    whereClauses += ' AND (pid LIKE ? OR title LIKE ? OR author_name LIKE ? OR tag LIKE ?)'
    const searchPattern = `%${search}%`
    args.push(searchPattern, searchPattern, searchPattern, searchPattern)
  }

  const countResult = await client.execute({
    sql: `SELECT COUNT(*) as count FROM pic WHERE ${whereClauses}`,
    args
  })
  const total = Number(countResult.rows[0]?.count) || 0

  const result = await client.execute({
    sql: `SELECT * FROM pic WHERE ${whereClauses} ORDER BY upload_time DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset]
  })

  const artworks = result.rows.map(row => {
    const pic = rowToDatabasePic(row)
    return transformPicToArtwork(pic)
  })

  return { artworks, total }
}

// ==================== 每日精选 ====================

/**
 * 获取每日精选列表
 */
export async function getDailyPicks(page: number = 1, limit: number = 20, pickType?: string) {
  const client = getTursoClient()
  const offset = (page - 1) * limit

  let where = '1=1'
  const args: (string | number)[] = []
  if (pickType) {
    where += ' AND pick_type = ?'
    args.push(pickType)
  }

  const countResult = await client.execute({
    sql: `SELECT COUNT(*) as count FROM daily_pick WHERE ${where}`,
    args
  })
  const total = Number(countResult.rows[0]?.count) || 0

  const result = await client.execute({
    sql: `SELECT * FROM daily_pick WHERE ${where} ORDER BY pick_date DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset]
  })

  const picks = result.rows.map(row => ({
    id: Number(row.id),
    pickDate: String(row.pick_date),
    pickType: String(row.pick_type) as 'ranking_pick' | 'daily_art',
    title: String(row.title || ''),
    description: String(row.description || ''),
    coverPid: String(row.cover_pid || ''),
    isPublished: row.is_published === 1,
    artworks: [],
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  }))

  return { picks, total }
}

/**
 * 获取已发布的每日精选列表（公共API用）
 */
export async function getPublishedDailyPicks(page: number = 1, limit: number = 20, pickType?: string) {
  const client = getTursoClient()
  const offset = (page - 1) * limit

  let where = 'is_published = 1'
  const args: (string | number)[] = []
  if (pickType) {
    where += ' AND pick_type = ?'
    args.push(pickType)
  }

  const countResult = await client.execute({
    sql: `SELECT COUNT(*) as count FROM daily_pick WHERE ${where}`,
    args
  })
  const total = Number(countResult.rows[0]?.count) || 0

  const result = await client.execute({
    sql: `SELECT * FROM daily_pick WHERE ${where} ORDER BY pick_date DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset]
  })

  const picks = await Promise.all(result.rows.map(async row => {
    const pickId = Number(row.id)
    const artworks = await getDailyPickArtworks(pickId)
    return {
      id: pickId,
      pickDate: String(row.pick_date),
      pickType: String(row.pick_type) as 'ranking_pick' | 'daily_art',
      title: String(row.title || ''),
      description: String(row.description || ''),
      coverPid: String(row.cover_pid || ''),
      isPublished: true,
      artworks,
      createdAt: String(row.created_at || ''),
      updatedAt: String(row.updated_at || ''),
    }
  }))

  return { picks, total }
}

/**
 * 获取已发布的每日精选摘要列表，不加载作品明细
 */
export async function getPublishedDailyPickSummaries(
  page: number = 1,
  limit: number = 20,
  pickType?: string
) {
  const client = getTursoClient()
  const offset = (page - 1) * limit

  let where = 'is_published = 1'
  const args: (string | number)[] = []
  if (pickType) {
    where += ' AND pick_type = ?'
    args.push(pickType)
  }

  const countResult = await client.execute({
    sql: `SELECT COUNT(*) as count FROM daily_pick WHERE ${where}`,
    args
  })
  const total = Number(countResult.rows[0]?.count) || 0

  const result = await client.execute({
    sql: `SELECT * FROM daily_pick WHERE ${where} ORDER BY pick_date DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset]
  })

  const picks = result.rows.map(row => ({
    id: Number(row.id),
    pickDate: String(row.pick_date),
    pickType: String(row.pick_type) as 'ranking_pick' | 'daily_art',
    title: String(row.title || ''),
    description: String(row.description || ''),
    coverPid: String(row.cover_pid || ''),
    isPublished: true,
    artworks: [],
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  }))

  return { picks, total }
}

/**
 * 获取单个每日精选（含作品列表）
 */
export async function getDailyPickById(id: number) {
  const client = getTursoClient()

  const result = await client.execute({
    sql: 'SELECT * FROM daily_pick WHERE id = ?',
    args: [id]
  })

  if (!result.rows.length) return null

  const row = result.rows[0]
  const artworks = await getDailyPickArtworks(id)

  return {
    id: Number(row.id),
    pickDate: String(row.pick_date),
    pickType: String(row.pick_type) as 'ranking_pick' | 'daily_art',
    title: String(row.title || ''),
    description: String(row.description || ''),
    coverPid: String(row.cover_pid || ''),
    isPublished: row.is_published === 1,
    artworks,
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  }
}

/**
 * 按日期获取每日精选
 */
export async function getDailyPickByDate(date: string, pickType?: string) {
  const client = getTursoClient()

  let where = 'pick_date = ? AND is_published = 1'
  const args: string[] = [date]
  if (pickType) {
    where += ' AND pick_type = ?'
    args.push(pickType)
  }

  const result = await client.execute({
    sql: `SELECT * FROM daily_pick WHERE ${where} LIMIT 1`,
    args
  })

  if (!result.rows.length) return null

  const row = result.rows[0]
  const artworks = await getDailyPickArtworks(Number(row.id))

  return {
    id: Number(row.id),
    pickDate: String(row.pick_date),
    pickType: String(row.pick_type) as 'ranking_pick' | 'daily_art',
    title: String(row.title || ''),
    description: String(row.description || ''),
    coverPid: String(row.cover_pid || ''),
    isPublished: true,
    artworks,
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  }
}

/**
 * 创建每日精选
 */
export async function createDailyPick(data: {
  pickDate: string
  pickType: string
  title?: string
  description?: string
  coverPid?: string
}) {
  const client = getTursoClient()

  const result = await client.execute({
    sql: `INSERT INTO daily_pick (pick_date, pick_type, title, description, cover_pid) VALUES (?, ?, ?, ?, ?)`,
    args: [data.pickDate, data.pickType, data.title || null, data.description || null, data.coverPid || null]
  })

  return Number(result.lastInsertRowid)
}

/**
 * 更新每日精选
 */
export async function updateDailyPick(id: number, data: {
  title?: string
  description?: string
  coverPid?: string
  isPublished?: boolean
}) {
  const client = getTursoClient()

  const sets: string[] = ["updated_at = datetime('now')"]
  const args: (string | number | null)[] = []

  if (data.title !== undefined) { sets.push('title = ?'); args.push(data.title) }
  if (data.description !== undefined) { sets.push('description = ?'); args.push(data.description) }
  if (data.coverPid !== undefined) { sets.push('cover_pid = ?'); args.push(data.coverPid) }
  if (data.isPublished !== undefined) { sets.push('is_published = ?'); args.push(data.isPublished ? 1 : 0) }

  args.push(id)
  await client.execute({
    sql: `UPDATE daily_pick SET ${sets.join(', ')} WHERE id = ?`,
    args
  })
}

/**
 * 删除每日精选
 */
export async function deleteDailyPick(id: number) {
  const client = getTursoClient()
  await client.execute({ sql: 'DELETE FROM daily_pick_artwork WHERE daily_pick_id = ?', args: [id] })
  await client.execute({ sql: 'DELETE FROM daily_pick WHERE id = ?', args: [id] })
}

/**
 * 获取每日精选的作品列表
 */
async function getDailyPickArtworks(pickId: number) {
  const client = getTursoClient()

  const result = await client.execute({
    sql: `
      SELECT dpa.sort_order, dpa.editor_comment, p.*
      FROM daily_pick_artwork dpa
      LEFT JOIN pic p ON dpa.pid = p.pid
      WHERE dpa.daily_pick_id = ?
      ORDER BY dpa.sort_order ASC
    `,
    args: [pickId]
  })

  return result.rows.map(row => {
    const pic = rowToDatabasePic(row)
    const artwork = transformPicToArtwork(pic)
    return {
      ...artwork,
      editorComment: row.editor_comment ? String(row.editor_comment) : undefined,
      sortOrder: Number(row.sort_order) || 0,
    }
  })
}

/**
 * 向每日精选添加作品
 */
export async function addDailyPickArtwork(pickId: number, pid: string, sortOrder: number = 0, editorComment?: string) {
  const client = getTursoClient()
  await client.execute({
    sql: 'INSERT INTO daily_pick_artwork (daily_pick_id, pid, sort_order, editor_comment) VALUES (?, ?, ?, ?)',
    args: [pickId, pid, sortOrder, editorComment || null]
  })
}

/**
 * 从每日精选移除作品
 */
export async function removeDailyPickArtwork(pickId: number, pid: string) {
  const client = getTursoClient()
  await client.execute({
    sql: 'DELETE FROM daily_pick_artwork WHERE daily_pick_id = ? AND pid = ?',
    args: [pickId, pid]
  })
}

// ==================== 画师专题 ====================

/**
 * 获取画师专题列表
 */
export async function getArtistFeatures(page: number = 1, limit: number = 20, publishedOnly: boolean = false) {
  const client = getTursoClient()
  const offset = (page - 1) * limit

  const where = publishedOnly ? 'is_published = 1' : '1=1'

  const countResult = await client.execute({
    sql: `SELECT COUNT(*) as count FROM artist_feature WHERE ${where}`,
    args: []
  })
  const total = Number(countResult.rows[0]?.count) || 0

  const result = await client.execute({
    sql: `SELECT * FROM artist_feature WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    args: [limit, offset]
  })

  const features = await Promise.all(result.rows.map(async row => {
    const featureId = Number(row.id)
    const artworks = publishedOnly ? await getArtistFeatureArtworks(featureId) : []
    return rowToArtistFeature(row, artworks)
  }))

  return { features, total }
}

/**
 * 获取单个画师专题
 */
export async function getArtistFeatureById(id: number) {
  const client = getTursoClient()

  const result = await client.execute({
    sql: 'SELECT * FROM artist_feature WHERE id = ?',
    args: [id]
  })

  if (!result.rows.length) return null

  const artworks = await getArtistFeatureArtworks(id)
  return rowToArtistFeature(result.rows[0], artworks)
}

/**
 * 创建画师专题
 */
export async function createArtistFeature(data: {
  artistId: string
  artistName: string
  artistAvatar?: string
  artistBio?: string
  featureTitle: string
  featureContent?: string
  coverPid?: string
  pixivUrl?: string
  twitterUrl?: string
}) {
  const client = getTursoClient()

  const result = await client.execute({
    sql: `INSERT INTO artist_feature (artist_id, artist_name, artist_avatar, artist_bio, feature_title, feature_content, cover_pid, pixiv_url, twitter_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.artistId, data.artistName, data.artistAvatar || null, data.artistBio || null,
      data.featureTitle, data.featureContent || null, data.coverPid || null,
      data.pixivUrl || null, data.twitterUrl || null
    ]
  })

  return Number(result.lastInsertRowid)
}

/**
 * 更新画师专题
 */
export async function updateArtistFeature(id: number, data: {
  artistName?: string
  artistAvatar?: string
  artistBio?: string
  featureTitle?: string
  featureContent?: string
  coverPid?: string
  pixivUrl?: string
  twitterUrl?: string
  isPublished?: boolean
}) {
  const client = getTursoClient()

  const sets: string[] = ["updated_at = datetime('now')"]
  const args: (string | number | null)[] = []

  if (data.artistName !== undefined) { sets.push('artist_name = ?'); args.push(data.artistName) }
  if (data.artistAvatar !== undefined) { sets.push('artist_avatar = ?'); args.push(data.artistAvatar) }
  if (data.artistBio !== undefined) { sets.push('artist_bio = ?'); args.push(data.artistBio) }
  if (data.featureTitle !== undefined) { sets.push('feature_title = ?'); args.push(data.featureTitle) }
  if (data.featureContent !== undefined) { sets.push('feature_content = ?'); args.push(data.featureContent) }
  if (data.coverPid !== undefined) { sets.push('cover_pid = ?'); args.push(data.coverPid) }
  if (data.pixivUrl !== undefined) { sets.push('pixiv_url = ?'); args.push(data.pixivUrl) }
  if (data.twitterUrl !== undefined) { sets.push('twitter_url = ?'); args.push(data.twitterUrl) }
  if (data.isPublished !== undefined) {
    sets.push('is_published = ?')
    args.push(data.isPublished ? 1 : 0)
    if (data.isPublished) {
      sets.push("published_at = datetime('now')")
    }
  }

  args.push(id)
  await client.execute({
    sql: `UPDATE artist_feature SET ${sets.join(', ')} WHERE id = ?`,
    args
  })
}

/**
 * 删除画师专题
 */
export async function deleteArtistFeature(id: number) {
  const client = getTursoClient()
  await client.execute({ sql: 'DELETE FROM artist_feature_artwork WHERE artist_feature_id = ?', args: [id] })
  await client.execute({ sql: 'DELETE FROM artist_feature WHERE id = ?', args: [id] })
}

/**
 * 获取画师专题的作品列表
 */
async function getArtistFeatureArtworks(featureId: number) {
  const client = getTursoClient()

  const result = await client.execute({
    sql: `
      SELECT afa.sort_order, afa.editor_comment, p.*
      FROM artist_feature_artwork afa
      LEFT JOIN pic p ON afa.pid = p.pid
      WHERE afa.artist_feature_id = ?
      ORDER BY afa.sort_order ASC
    `,
    args: [featureId]
  })

  return result.rows.map(row => {
    const pic = rowToDatabasePic(row)
    const artwork = transformPicToArtwork(pic)
    return {
      ...artwork,
      editorComment: row.editor_comment ? String(row.editor_comment) : undefined,
      sortOrder: Number(row.sort_order) || 0,
    }
  })
}

/**
 * 向画师专题添加作品
 */
export async function addArtistFeatureArtwork(featureId: number, pid: string, sortOrder: number = 0, editorComment?: string) {
  const client = getTursoClient()
  await client.execute({
    sql: 'INSERT INTO artist_feature_artwork (artist_feature_id, pid, sort_order, editor_comment) VALUES (?, ?, ?, ?)',
    args: [featureId, pid, sortOrder, editorComment || null]
  })
}

/**
 * 从画师专题移除作品
 */
export async function removeArtistFeatureArtwork(featureId: number, pid: string) {
  const client = getTursoClient()
  await client.execute({
    sql: 'DELETE FROM artist_feature_artwork WHERE artist_feature_id = ? AND pid = ?',
    args: [featureId, pid]
  })
}

function rowToArtistFeature(row: Record<string, unknown>, artworks: ReturnType<typeof transformPicToArtwork>[]) {
  return {
    id: Number(row.id),
    artistId: String(row.artist_id),
    artistName: String(row.artist_name),
    artistAvatar: String(row.artist_avatar || ''),
    artistBio: String(row.artist_bio || ''),
    featureTitle: String(row.feature_title),
    featureContent: String(row.feature_content || ''),
    coverPid: String(row.cover_pid || ''),
    pixivUrl: String(row.pixiv_url || ''),
    twitterUrl: String(row.twitter_url || ''),
    isPublished: row.is_published === 1,
    publishedAt: String(row.published_at || ''),
    artworks,
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  }
}

// ==================== 话题专题 ====================

/**
 * 获取话题专题列表
 */
export async function getTopicFeatures(page: number = 1, limit: number = 20, publishedOnly: boolean = false) {
  const client = getTursoClient()
  const offset = (page - 1) * limit

  const where = publishedOnly ? 'is_published = 1' : '1=1'

  const countResult = await client.execute({
    sql: `SELECT COUNT(*) as count FROM topic_feature WHERE ${where}`,
    args: []
  })
  const total = Number(countResult.rows[0]?.count) || 0

  const result = await client.execute({
    sql: `SELECT * FROM topic_feature WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    args: [limit, offset]
  })

  const features = await Promise.all(result.rows.map(async row => {
    const featureId = Number(row.id)
    const artworks = publishedOnly ? await getTopicFeatureArtworks(featureId) : []
    return rowToTopicFeature(row, artworks)
  }))

  return { features, total }
}

/**
 * 获取单个话题专题
 */
export async function getTopicFeatureById(id: number) {
  const client = getTursoClient()

  const result = await client.execute({
    sql: 'SELECT * FROM topic_feature WHERE id = ?',
    args: [id]
  })

  if (!result.rows.length) return null

  const artworks = await getTopicFeatureArtworks(id)
  return rowToTopicFeature(result.rows[0], artworks)
}

/**
 * 按slug获取话题专题
 */
export async function getTopicFeatureBySlug(slug: string) {
  const client = getTursoClient()

  const result = await client.execute({
    sql: 'SELECT * FROM topic_feature WHERE topic_slug = ? AND is_published = 1',
    args: [slug]
  })

  if (!result.rows.length) return null

  const artworks = await getTopicFeatureArtworks(Number(result.rows[0].id))
  return rowToTopicFeature(result.rows[0], artworks)
}

/**
 * 创建话题专题
 */
export async function createTopicFeature(data: {
  topicName: string
  topicSlug: string
  topicDescription?: string
  featureContent?: string
  coverPid?: string
  tags?: string
}) {
  const client = getTursoClient()

  const result = await client.execute({
    sql: `INSERT INTO topic_feature (topic_name, topic_slug, topic_description, feature_content, cover_pid, tags)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      data.topicName, data.topicSlug, data.topicDescription || null,
      data.featureContent || null, data.coverPid || null, data.tags || null
    ]
  })

  return Number(result.lastInsertRowid)
}

/**
 * 更新话题专题
 */
export async function updateTopicFeature(id: number, data: {
  topicName?: string
  topicDescription?: string
  featureContent?: string
  coverPid?: string
  tags?: string
  isPublished?: boolean
}) {
  const client = getTursoClient()

  const sets: string[] = ["updated_at = datetime('now')"]
  const args: (string | number | null)[] = []

  if (data.topicName !== undefined) { sets.push('topic_name = ?'); args.push(data.topicName) }
  if (data.topicDescription !== undefined) { sets.push('topic_description = ?'); args.push(data.topicDescription) }
  if (data.featureContent !== undefined) { sets.push('feature_content = ?'); args.push(data.featureContent) }
  if (data.coverPid !== undefined) { sets.push('cover_pid = ?'); args.push(data.coverPid) }
  if (data.tags !== undefined) { sets.push('tags = ?'); args.push(data.tags) }
  if (data.isPublished !== undefined) {
    sets.push('is_published = ?')
    args.push(data.isPublished ? 1 : 0)
    if (data.isPublished) {
      sets.push("published_at = datetime('now')")
    }
  }

  args.push(id)
  await client.execute({
    sql: `UPDATE topic_feature SET ${sets.join(', ')} WHERE id = ?`,
    args
  })
}

/**
 * 删除话题专题
 */
export async function deleteTopicFeature(id: number) {
  const client = getTursoClient()
  await client.execute({ sql: 'DELETE FROM topic_feature_artwork WHERE topic_feature_id = ?', args: [id] })
  await client.execute({ sql: 'DELETE FROM topic_feature WHERE id = ?', args: [id] })
}

/**
 * 获取话题专题的作品列表
 */
async function getTopicFeatureArtworks(featureId: number) {
  const client = getTursoClient()

  const result = await client.execute({
    sql: `
      SELECT tfa.sort_order, tfa.editor_comment, p.*
      FROM topic_feature_artwork tfa
      LEFT JOIN pic p ON tfa.pid = p.pid
      WHERE tfa.topic_feature_id = ?
      ORDER BY tfa.sort_order ASC
    `,
    args: [featureId]
  })

  return result.rows.map(row => {
    const pic = rowToDatabasePic(row)
    const artwork = transformPicToArtwork(pic)
    return {
      ...artwork,
      editorComment: row.editor_comment ? String(row.editor_comment) : undefined,
      sortOrder: Number(row.sort_order) || 0,
    }
  })
}

/**
 * 向话题专题添加作品
 */
export async function addTopicFeatureArtwork(featureId: number, pid: string, sortOrder: number = 0, editorComment?: string) {
  const client = getTursoClient()
  await client.execute({
    sql: 'INSERT INTO topic_feature_artwork (topic_feature_id, pid, sort_order, editor_comment) VALUES (?, ?, ?, ?)',
    args: [featureId, pid, sortOrder, editorComment || null]
  })
}

/**
 * 从话题专题移除作品
 */
export async function removeTopicFeatureArtwork(featureId: number, pid: string) {
  const client = getTursoClient()
  await client.execute({
    sql: 'DELETE FROM topic_feature_artwork WHERE topic_feature_id = ? AND pid = ?',
    args: [featureId, pid]
  })
}

function rowToTopicFeature(row: Record<string, unknown>, artworks: ReturnType<typeof transformPicToArtwork>[]) {
  return {
    id: Number(row.id),
    topicName: String(row.topic_name),
    topicSlug: String(row.topic_slug),
    topicDescription: String(row.topic_description || ''),
    featureContent: String(row.feature_content || ''),
    coverPid: String(row.cover_pid || ''),
    tags: row.tags ? String(row.tags).split(',').filter(Boolean) : [],
    isPublished: row.is_published === 1,
    publishedAt: String(row.published_at || ''),
    artworks,
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  }
}

// ==================== 统计 ====================

/**
 * 获取管理后台统计数据
 */
export async function getContentStats() {
  const client = getTursoClient()

  const [artworks, dailyPicks, artistFeatures, topicFeatures] = await Promise.all([
    client.execute({ sql: 'SELECT COUNT(*) as count FROM pic', args: [] }),
    client.execute({ sql: 'SELECT COUNT(*) as total, SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published FROM daily_pick', args: [] }),
    client.execute({ sql: 'SELECT COUNT(*) as total, SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published FROM artist_feature', args: [] }),
    client.execute({ sql: 'SELECT COUNT(*) as total, SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published FROM topic_feature', args: [] }),
  ])

  return {
    totalArtworks: Number(artworks.rows[0]?.count) || 0,
    totalDailyPicks: Number(dailyPicks.rows[0]?.total) || 0,
    totalArtistFeatures: Number(artistFeatures.rows[0]?.total) || 0,
    totalTopicFeatures: Number(topicFeatures.rows[0]?.total) || 0,
    publishedDailyPicks: Number(dailyPicks.rows[0]?.published) || 0,
    publishedArtistFeatures: Number(artistFeatures.rows[0]?.published) || 0,
    publishedTopicFeatures: Number(topicFeatures.rows[0]?.published) || 0,
  }
}

// ==================== 辅助函数 ====================

/**
 * 将数据库行转换为DatabasePic类型
 */
function rowToDatabasePic(row: Record<string, unknown>): DatabasePic {
  return {
    pid: String(row.pid),
    title: row.title as string | undefined,
    author_id: row.author_id as string | undefined,
    author_name: row.author_name as string | undefined,
    download_time: row.download_time as string | undefined,
    tag: (row.tag as string) || '',
    good: Number(row.good) || 0,
    star: Number(row.star) || 0,
    view: Number(row.view) || 0,
    image_path: (row.image_path as string) || '',
    image_url: (row.image_url as string) || '',
    popularity: Number(row.popularity) || 0,
    upload_time: row.upload_time as string | undefined,
    wx_url: row.wx_url as string | undefined,
    wx_name: row.wx_name as string | undefined,
    unfit: row.unfit as number | undefined,
    size: row.size as number | undefined,
  }
}
