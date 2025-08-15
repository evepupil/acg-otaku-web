/**
 * 文章详情页组件 - 展示文章的详细内容、作者信息、相关文章等
 * 支持文章阅读、点赞、收藏、分享等功能
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Eye, Share2, Calendar, Tag, User, Clock, 
  ArrowLeft, Bookmark, MessageCircle, ThumbsUp,
  ChevronUp, ChevronDown, Copy, Check
} from 'lucide-react'
import Button from '@/components/Button'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation'
import type { Article, Artist } from '@/types'

/**
 * 目录组件
 */
function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([])
  const [activeHeading, setActiveHeading] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // 解析文章内容中的标题
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const matches = Array.from(content.matchAll(headingRegex))
    
    const parsedHeadings = matches.map((match, index) => ({
      id: `heading-${index}`,
      text: match[2],
      level: match[1].length
    }))
    
    setHeadings(parsedHeadings)
  }, [content])

  /**
   * 滚动到指定标题
   */
  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveHeading(headingId)
    }
  }

  if (headings.length === 0) return null

  return (
    <div className="glass-card rounded-xl p-4 sticky top-24">
      <div 
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-gray-800">目录</h3>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                  activeHeading === heading.id
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
              >
                {heading.text}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * 相关文章组件
 */
function RelatedArticles({ categoryId, currentArticleId }: { categoryId: string; currentArticleId: string }) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟获取相关文章数据
    const fetchRelatedArticles = async () => {
      try {
        // 这里应该调用实际的API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 模拟数据
        const mockArticles: Article[] = Array.from({ length: 4 }, (_, i) => ({
          id: i + 1,
          title: `相关文章标题 ${i + 1}`,
          excerpt: `这是第 ${i + 1} 篇相关文章的摘要内容，介绍了相关的插画技巧和创作心得。`,
          content: `这是第 ${i + 1} 篇相关文章的详细内容...`,
          coverImage: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=article%20cover%20illustration%20${i + 1}&image_size=landscape_4_3`,
          author: {
            id: 1,
            name: '专栏作者',
            avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=author%20avatar%20profile&image_size=square',
            bio: '专业插画师和教程作者',
            followerCount: 1000,
            artworkCount: 50
          },
          category: '教程',
          readTime: 5 + i,
          views: 1000 + i * 200,
          likes: 50 + i * 10,
          publishDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['插画', '教程', '技巧']
        }))
        
        setRelatedArticles(mockArticles)
      } catch (error) {
        console.error('获取相关文章失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedArticles()
  }, [categoryId, currentArticleId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loading variant="spinner" size="md" text="加载相关文章..." />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {relatedArticles.map((article) => (
        <motion.div
          key={article.id}
          whileHover={{ scale: 1.02 }}
          className="glass-card rounded-lg overflow-hidden cursor-pointer group"
        >
          <div className="aspect-video relative overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                {article.category}
              </span>
            </div>
          </div>
          
          <div className="p-4">
            <h4 className="font-semibold text-gray-800 line-clamp-2 mb-2">
              {article.title}
            </h4>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}分钟</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{article.views.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{article.likes.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * 文章详情页组件
 */
export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [copied, setCopied] = useState(false)

  /**
   * 获取文章详情数据
   */
  const fetchArticleDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 这里应该调用实际的API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟数据
      const mockArticle: Article = {
        id: parseInt(params.id),
        title: '插画创作技巧：如何绘制生动的角色表情',
        excerpt: '本文将详细介绍如何通过观察和练习来提升角色表情的绘制技巧，让你的作品更加生动有趣。',
        content: `# 插画创作技巧：如何绘制生动的角色表情

在插画创作中，角色的表情是传达情感和故事的重要元素。一个生动的表情能够瞬间抓住观者的注意力，让作品更具感染力。

## 理解表情的基本构成

### 眼部表情
眼睛被称为"心灵的窗户"，在表情表达中起着至关重要的作用。不同的眼部形状和状态能够传达不同的情感：

- **喜悦**：眼睛微眯，眼角上扬
- **悲伤**：眼睛下垂，可能伴有泪水
- **愤怒**：眉毛紧皱，眼神锐利
- **惊讶**：眼睛睁大，眉毛上扬

### 嘴部表情
嘴部的变化同样能够表达丰富的情感：

- **微笑**：嘴角上扬，可能露出牙齿
- **皱眉**：嘴角下垂，表达不满
- **惊讶**：嘴巴微张，呈O形

## 实践技巧

### 观察真实表情
最好的学习方法就是观察真实的人物表情。你可以：

1. 对着镜子练习各种表情
2. 观察身边人的表情变化
3. 研究电影和动画中的经典表情

### 夸张与简化
在插画中，适当的夸张能够让表情更加突出：

- 放大关键特征
- 简化不必要的细节
- 突出情感的核心元素

## 常见错误与解决方案

### 表情僵硬
**问题**：表情看起来不自然，缺乏生动感。
**解决方案**：
- 注意面部肌肉的协调性
- 避免所有特征都过于对称
- 加入微妙的不对称元素

### 情感不明确
**问题**：观者无法准确理解角色的情感状态。
**解决方案**：
- 确保主要表情特征清晰明确
- 避免混合过多不同的情感元素
- 通过整体氛围强化情感表达

## 进阶技巧

### 微表情的运用
微表情是指持续时间很短的面部表情，通常能够揭示真实的情感状态。在插画中巧妙运用微表情，能够为角色增添更多层次。

### 文化差异的考虑
不同文化背景下，表情的含义可能有所不同。在创作面向国际观众的作品时，需要考虑这些文化差异。

## 总结

绘制生动的角色表情需要大量的观察、练习和思考。通过理解表情的基本构成，掌握实践技巧，避免常见错误，你的插画作品将会更加生动有趣，能够更好地与观者产生情感共鸣。

记住，最重要的是要保持练习的热情，不断尝试新的表现方式，让你的创作技巧不断提升。`,
        coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20character%20expressions%20tutorial%20illustration&image_size=landscape_4_3',
        author: {
          id: 1,
          name: '插画教学专家',
          avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=art%20teacher%20avatar%20profile&image_size=square',
          bio: '资深插画师，从事插画教学工作多年，擅长角色设计和表情绘制。',
          followers: 8520,
          following: 156,
          artworkCount: 45
        },
        category: '教程',
        readTime: 12,
        views: 15680,
        likes: 2340,
        publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['插画', '教程', '表情', '角色设计', '绘画技巧']
      }
      
      setArticle(mockArticle)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取文章详情失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理点赞
   */
  const handleLike = async () => {
    setLiked(!liked)
    // 这里应该调用API更新点赞状态
  }

  /**
   * 处理收藏
   */
  const handleBookmark = async () => {
    setBookmarked(!bookmarked)
    // 这里应该调用API更新收藏状态
  }

  /**
   * 处理分享
   */
  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href
        })
      } catch (error) {
        console.log('分享取消或失败')
      }
    } else {
      // 复制链接到剪贴板
      await handleCopyLink()
    }
  }

  /**
   * 复制链接
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  /**
   * 渲染Markdown内容
   */
  const renderContent = (content: string) => {
    // 简单的Markdown渲染（实际项目中建议使用专业的Markdown解析库）
    return content
      .split('\n')
      .map((line, index) => {
        // 标题
        if (line.startsWith('# ')) {
          return (
            <h1 key={index} id={`heading-${index}`} className="text-3xl font-bold text-gray-800 mb-6 mt-8">
              {line.substring(2)}
            </h1>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} id={`heading-${index}`} className="text-2xl font-semibold text-gray-800 mb-4 mt-6">
              {line.substring(3)}
            </h2>
          )
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} id={`heading-${index}`} className="text-xl font-semibold text-gray-800 mb-3 mt-5">
              {line.substring(4)}
            </h3>
          )
        }
        
        // 列表
        if (line.startsWith('- ')) {
          return (
            <li key={index} className="text-gray-600 mb-2 ml-4">
              {line.substring(2)}
            </li>
          )
        }
        
        // 数字列表
        if (/^\d+\.\s/.test(line)) {
          return (
            <li key={index} className="text-gray-600 mb-2 ml-4 list-decimal">
              {line.replace(/^\d+\.\s/, '')}
            </li>
          )
        }
        
        // 粗体
        if (line.includes('**')) {
          const parts = line.split('**')
          return (
            <p key={index} className="text-gray-600 mb-4 leading-relaxed">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-800">{part}</strong> : part
              )}
            </p>
          )
        }
        
        // 普通段落
        if (line.trim()) {
          return (
            <p key={index} className="text-gray-600 mb-4 leading-relaxed">
              {line}
            </p>
          )
        }
        
        return null
      })
      .filter(Boolean)
  }

  useEffect(() => {
    fetchArticleDetail()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-20">
        <div className="flex justify-center items-center h-96">
          <Loading variant="spinner" size="lg" text="加载文章详情..." />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="glass-card p-8 rounded-xl max-w-md mx-auto">
              <div className="text-red-500 mb-4">
                <MessageCircle className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h3>
              <p className="text-gray-600 mb-4">{error || '文章不存在'}</p>
              <div className="flex space-x-3 justify-center">
                <Button onClick={() => router.back()} variant="outline">
                  返回
                </Button>
                <Button onClick={fetchArticleDetail} variant="primary">
                  重试
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            onClick={() => router.back()}
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            返回
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-3">
            {/* 文章头部 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-8 mb-8"
            >
              {/* 封面图片 */}
              <div className="aspect-video rounded-lg overflow-hidden mb-6">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 分类标签 */}
              <div className="mb-4">
                <span className="px-3 py-1 bg-purple-500 text-white text-sm rounded-full">
                  {article.category}
                </span>
              </div>
              
              {/* 标题 */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {article.title}
              </h1>
              
              {/* 摘要 */}
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {article.excerpt}
              </p>
              
              {/* 文章元信息 */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center space-x-2">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{article.author.name}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(article.publishDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime} 分钟阅读</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.views.toLocaleString()} 浏览</span>
                </div>
              </div>
              
              {/* 标签 */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleLike}
                  variant={liked ? "primary" : "outline"}
                  leftIcon={<Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />}
                >
                  {liked ? '已点赞' : '点赞'} ({article.likes.toLocaleString()})
                </Button>
                
                <Button
                  onClick={handleBookmark}
                  variant={bookmarked ? "primary" : "outline"}
                  leftIcon={<Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />}
                >
                  {bookmarked ? '已收藏' : '收藏'}
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  分享
                </Button>
                
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {copied ? '已复制' : '复制链接'}
                </Button>
              </div>
            </motion.div>

            {/* 文章内容 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-xl p-8 mb-8"
            >
              <div className="prose prose-lg max-w-none">
                {renderContent(article.content)}
              </div>
            </motion.div>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            {/* 目录 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <TableOfContents content={article.content} />
            </motion.div>

            {/* 作者信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-xl p-6 mb-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{article.author.name}</h3>
                  <p className="text-sm text-gray-500">专栏作者</p>
                </div>
              </div>
              
              {article.author.bio && (
                <p className="text-gray-600 text-sm mb-4">{article.author.bio}</p>
              )}
              
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="font-semibold text-gray-800">{article.author.artworkCount || 0}</div>
                  <div className="text-xs text-gray-500">文章</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{article.author.followers || 0}</div>
                  <div className="text-xs text-gray-500">粉丝</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{article.author.following || 0}</div>
                  <div className="text-xs text-gray-500">关注</div>
                </div>
              </div>
              
              <Button variant="primary" className="w-full">
                关注作者
              </Button>
            </motion.div>
          </div>
        </div>

        {/* 相关文章 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-8"
        >
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">相关文章</h3>
          <RelatedArticles categoryId={article.category} currentArticleId={article.id.toString()} />
        </motion.div>
      </div>
    </div>
  )
}