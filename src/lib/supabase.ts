import { createClient } from '@supabase/supabase-js'

/**
 * Supabase客户端配置
 * 用于连接爬虫项目的数据库
 */

// 获取环境变量（仅在服务端使用）
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 检查是否在服务端环境
if (typeof window === 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
}

// 创建Supabase客户端（仅在服务端使用）
export const supabase = typeof window === 'undefined' 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 创建Supabase管理客户端（仅在服务端使用）
export const supabaseAdmin = typeof window === 'undefined'
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null

/**
 * 数据库表类型定义
 * 基于爬虫项目的数据库结构
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
  unfit?: boolean
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
 * 数据库操作函数
 */

/**
 * 获取排行榜数据
 * @param rankType 排行榜类型
 * @param page 页码
 * @param limit 每页数量
 * @returns 排行榜数据
 */
export async function getRankings(
  rankType: 'daily' | 'weekly' | 'monthly' = 'daily',
  page: number = 1,
  limit: number = 20
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase client not available')
  }
  
  const offset = (page - 1) * limit
  
  const { data: rankings, error: rankingError } = await supabaseAdmin
    .from('ranking')
    .select('pid, rank')
    .eq('rank_type', rankType)
    .order('rank', { ascending: true })
    .range(offset, offset + limit - 1)

  if (rankingError) {
    throw new Error(`获取排行榜失败: ${rankingError.message}`)
  }

  if (!rankings || rankings.length === 0) {
    return { artworks: [], total: 0 }
  }

  // 获取对应的插画详情
  const pids = rankings.map(r => r.pid)
  const { data: pics, error: picError } = await supabaseAdmin
    .from('pic')
    .select('*')
    .in('pid', pids)

  if (picError) {
    throw new Error(`获取插画详情失败: ${picError.message}`)
  }

  // 合并排行榜和插画数据，匹配前端Artwork类型
  const artworks = rankings.map(ranking => {
    const pic = pics?.find(p => p.pid === ranking.pid)
    return {
      id: parseInt(ranking.pid),
      title: pic?.title || `插画 ${ranking.pid}`,
      artist: {
        id: parseInt(pic?.author_id || '0'),
        name: pic?.author_name || '未知作者',
        avatar: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20artist%20avatar%20profile%20picture&image_size=square`
      },
      imageUrl: pic?.image_url || pic?.wx_url || '',
      tags: pic?.tag ? pic.tag.split(',').filter(Boolean) : [],
      createdAt: pic?.upload_time || new Date().toISOString(),
      rank: ranking.rank,
      stats: {
        views: pic?.view || 0,
        likes: pic?.good || 0,
        bookmarks: pic?.star || 0
      }
    }
  })

  // 获取总数
  const { count } = await supabaseAdmin
    .from('ranking')
    .select('*', { count: 'exact', head: true })
    .eq('rank_type', rankType)

  return {
    artworks,
    total: count || 0
  }
}

/**
 * 获取推荐插画数据
 * @param page 页码
 * @param limit 每页数量
 * @returns 推荐插画数据
 */
export async function getRecommendations(
  page: number = 1,
  limit: number = 10
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase client not available')
  }
  
  const offset = (page - 1) * limit
  
  // 基于热度和随机性获取推荐内容
  const { data: pics, error } = await supabaseAdmin
    .from('pic')
    .select('*')
    .gte('popularity', 0.3) // 热度阈值
    .not('title', 'is', null)
    .not('author_name', 'is', null)
    .order('popularity', { ascending: false })
    .range(offset, offset + limit * 2 - 1) // 获取更多数据用于随机

  if (error) {
    throw new Error(`获取推荐数据失败: ${error.message}`)
  }

  if (!pics || pics.length === 0) {
    return { recommendations: [], total: 0 }
  }

  // 随机打乱并取指定数量
  const shuffled = pics.sort(() => Math.random() - 0.5).slice(0, limit)
  
  const recommendations = shuffled.map(pic => ({
    id: parseInt(pic.pid),
    title: pic.title || `插画 ${pic.pid}`,
    artist: {
      id: parseInt(pic.author_id || '0'),
      name: pic.author_name || '未知作者',
      avatar: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20artist%20avatar%20profile%20picture&image_size=square`
    },
    imageUrl: pic.image_url || pic.wx_url || '',
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

  // 获取总数（符合推荐条件的作品数量）
  const { count } = await supabaseAdmin
    .from('pic')
    .select('*', { count: 'exact', head: true })
    .gte('popularity', 0.3)
    .not('title', 'is', null)
    .not('author_name', 'is', null)

  return {
    recommendations,
    total: count || 0
  }
}

/**
 * 获取插画详情
 * @param pid 插画ID
 * @returns 插画详情
 */
export async function getArtworkById(pid: number) {
  if (!supabaseAdmin) {
    throw new Error('Supabase client not available')
  }
  
  const { data: pic, error } = await supabaseAdmin
    .from('pic')
    .select('*')
    .eq('pid', pid)
    .single()

  if (error) {
    throw new Error(`获取插画详情失败: ${error.message}`)
  }

  if (!pic) {
    return null
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
  if (!supabaseAdmin) {
    throw new Error('Supabase client not available')
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_behavior')
    .insert({
      user_id: userId,
      artwork_id: artworkId,
      action,
      created_at: new Date().toISOString()
    })

  if (error) {
    throw new Error(`记录用户行为失败: ${error.message}`)
  }

  return data
}