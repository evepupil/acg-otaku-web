import { createClient, Client } from '@libsql/client'

/**
 * Turso数据库客户端配置
 * 优先使用Turso作为主数据库，替代Supabase
 * 表结构与Supabase保持一致
 */

// 获取环境变量
const tursoUrl = process.env.TURSO_DATABASE_URL
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

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

  // 获取排行榜数据，关联pic表
  const rankingsResult = await client.execute({
    sql: `
      SELECT r.pid, r.rank, p.*
      FROM ranking r
      LEFT JOIN pic p ON r.pid = p.pid
      WHERE r.rank_type = ?
      ORDER BY r.rank ASC
      LIMIT ? OFFSET ?
    `,
    args: [rankType, limit, offset]
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

  // 获取总数
  const countResult = await client.execute({
    sql: 'SELECT COUNT(*) as count FROM ranking WHERE rank_type = ?',
    args: [rankType]
  })
  const total = Number(countResult.rows[0]?.count) || 0

  return { artworks, total }
}

/**
 * 获取推荐插画数据
 * @param page 页码
 * @param limit 每页数量
 * @returns 推荐插画数据和总数
 */
export async function getRecommendations(
  page: number = 1,
  limit: number = 10
) {
  const client = getTursoClient()

  // 使用 SQLite 的 RANDOM() 函数实现真正的随机推荐
  // 每次调用都会返回不同的随机结果，支持"换一批"功能
  const picsResult = await client.execute({
    sql: `
      SELECT * FROM pic
      WHERE popularity >= 0.3
        AND title IS NOT NULL
        AND author_name IS NOT NULL
      ORDER BY RANDOM()
      LIMIT ?
    `,
    args: [limit]
  })

  if (!picsResult.rows || picsResult.rows.length === 0) {
    return { recommendations: [], total: 0 }
  }

  // 转换数据
  const pics: DatabasePic[] = picsResult.rows.map(row => ({
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
  }))

  const recommendations = pics.map(pic => ({
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
    description: `热度: ${(pic.popularity * 100).toFixed(1)}%`,
    recommendReason: pic.popularity > 0.7 ? '高人气作品推荐' :
                    pic.popularity > 0.5 ? '优质内容推荐' : '发现新作品',
    stats: {
      views: pic.view || 0,
      likes: pic.good || 0,
      bookmarks: pic.star || 0
    }
  }))

  // 获取总数
  const countResult = await client.execute({
    sql: `
      SELECT COUNT(*) as count FROM pic
      WHERE popularity >= 0.3
        AND title IS NOT NULL
        AND author_name IS NOT NULL
    `,
    args: []
  })
  const total = Number(countResult.rows[0]?.count) || 0

  return { recommendations, total }
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
    size: row.size as number | undefined
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
    description: pic.title || `插画 ${pic.pid}`
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
