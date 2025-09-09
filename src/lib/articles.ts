/**
 * 文章数据处理工具
 * 用于读取和解析 Markdown 文件，支持 SSG 构建
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

export interface ArticleMetadata {
  title: string
  slug: string
  excerpt: string
  author_name: string
  featured_image: string
  published_at: string
  view_count: number
  tags: string[]
}

export interface Article extends ArticleMetadata {
  id: string
  content: string
  htmlContent?: string
}

// 文章目录路径
const articlesDirectory = path.join(process.cwd(), 'articles')

/**
 * 获取所有文章的元数据
 * @returns 文章元数据数组
 */
export function getAllArticles(): Article[] {
  // 检查文章目录是否存在
  if (!fs.existsSync(articlesDirectory)) {
    console.warn('Articles directory not found, returning empty array')
    return []
  }

  const fileNames = fs.readdirSync(articlesDirectory)
  const articles = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(articlesDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      
      // 解析 frontmatter
      const { data, content } = matter(fileContents)
      
      return {
        id: slug,
        slug,
        content,
        ...data
      } as Article
    })
    .sort((a, b) => {
      // 按发布时间倒序排列
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    })

  return articles
}

/**
 * 根据 slug 获取单篇文章
 * @param slug 文章 slug
 * @returns 文章数据或 null
 */
export function getArticleBySlug(slug: string): Article | null {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`)
    
    if (!fs.existsSync(fullPath)) {
      return null
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    return {
      id: slug,
      slug,
      content,
      ...data
    } as Article
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error)
    return null
  }
}

/**
 * 根据 ID 获取单篇文章
 * @param id 文章 ID
 * @returns 文章数据或 null
 */
export function getArticleById(id: string): Article | null {
  return getArticleBySlug(id)
}

/**
 * 将 Markdown 内容转换为 HTML
 * @param markdown Markdown 内容
 * @returns HTML 内容
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown)
  return result.toString()
}

/**
 * 获取文章的 HTML 内容
 * @param slug 文章 slug
 * @returns 包含 HTML 内容的文章数据或 null
 */
export async function getArticleWithHtml(slug: string): Promise<Article | null> {
  const article = getArticleBySlug(slug)
  
  if (!article) {
    return null
  }
  
  const htmlContent = await markdownToHtml(article.content)
  
  return {
    ...article,
    htmlContent
  }
}

/**
 * 获取所有文章的 slug 列表（用于 generateStaticParams）
 * @returns slug 数组
 */
export function getAllArticleSlugs(): string[] {
  if (!fs.existsSync(articlesDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(articlesDirectory)
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''))
}

/**
 * 获取相关文章
 * @param currentSlug 当前文章的 slug
 * @param limit 返回数量限制
 * @returns 相关文章数组
 */
export function getRelatedArticles(currentSlug: string, limit: number = 3): Article[] {
  const allArticles = getAllArticles()
  const currentArticle = allArticles.find(article => article.slug === currentSlug)
  
  if (!currentArticle) {
    return allArticles.slice(0, limit)
  }
  
  // 简单的相关文章算法：基于标签匹配
  const relatedArticles = allArticles
    .filter(article => article.slug !== currentSlug)
    .map(article => {
      const commonTags = article.tags.filter(tag => 
        currentArticle.tags.includes(tag)
      )
      return {
        ...article,
        relevanceScore: commonTags.length
      }
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
  
  // 如果没有足够的相关文章，用最新文章补充
  if (relatedArticles.length < limit) {
    const additionalArticles = allArticles
      .filter(article => 
        article.slug !== currentSlug && 
        !relatedArticles.some(related => related.slug === article.slug)
      )
      .slice(0, limit - relatedArticles.length)
      .map(article => ({
        ...article,
        relevanceScore: 0
      }))
    
    relatedArticles.push(...additionalArticles)
  }

  // 移除 relevanceScore 属性，返回纯 Article 类型
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return relatedArticles.map(({ relevanceScore: _relevanceScore, ...article }) => article)
}

/**
 * 根据标签获取文章
 * @param tag 标签名
 * @returns 包含该标签的文章数组
 */
export function getArticlesByTag(tag: string): Article[] {
  const allArticles = getAllArticles()
  return allArticles.filter(article => 
    article.tags.some(articleTag => 
      articleTag.toLowerCase() === tag.toLowerCase()
    )
  )
}

/**
 * 获取所有标签及其文章数量
 * @returns 标签统计对象
 */
export function getAllTags(): { [tag: string]: number } {
  const allArticles = getAllArticles()
  const tagCounts: { [tag: string]: number } = {}
  
  allArticles.forEach(article => {
    article.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })
  
  return tagCounts
}

/**
 * 搜索文章
 * @param query 搜索关键词
 * @returns 匹配的文章数组
 */
export function searchArticles(query: string): Article[] {
  const allArticles = getAllArticles()
  const lowercaseQuery = query.toLowerCase()
  
  return allArticles.filter(article => 
    article.title.toLowerCase().includes(lowercaseQuery) ||
    article.excerpt.toLowerCase().includes(lowercaseQuery) ||
    article.content.toLowerCase().includes(lowercaseQuery) ||
    article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}