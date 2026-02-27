'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, Eye, Share2, Calendar, 
  ArrowLeft, Bookmark,
  Copy, Check
} from 'lucide-react'
import Button from '@/components/Button'
import { useRouter } from 'next/navigation'
import type { Article } from '../../../src/lib/articles'

/**
 * 目录组件
 */
function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([])
  const [activeHeading, setActiveHeading] = useState<string>('')

  useEffect(() => {
    // 从内容中提取标题
    const lines = content.split('\n')
    const extractedHeadings = lines
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return { id: `heading-${index}`, text: line.substring(2), level: 1 }
        }
        if (line.startsWith('## ')) {
          return { id: `heading-${index}`, text: line.substring(3), level: 2 }
        }
        if (line.startsWith('### ')) {
          return { id: `heading-${index}`, text: line.substring(4), level: 3 }
        }
        return null
      })
      .filter(Boolean) as { id: string; text: string; level: number }[]
    
    setHeadings(extractedHeadings)
  }, [content])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveHeading(id)
    }
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">目录</h3>
      <nav className="space-y-2">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToHeading(heading.id)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              activeHeading === heading.id
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            } ${heading.level === 1 ? 'font-semibold' : heading.level === 2 ? 'ml-4' : 'ml-8'}`}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </div>
  )
}

/**
 * 相关文章组件
 */
function RelatedArticles({ articles }: { articles: Article[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {articles.map((article) => (
        <motion.div
          key={article.id}
          whileHover={{ scale: 1.02 }}
          className="glass-card rounded-lg overflow-hidden cursor-pointer group"
        >
          <div className="aspect-video relative overflow-hidden">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                {article.tags[0] || '文章'}
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
                  <Eye className="w-3 h-3" />
                  <span>{article.view_count.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{article.view_count?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

interface ArticleDetailClientProps {
  article: Article
  relatedArticles: Article[]
}

/**
 * 文章详情客户端组件
 */
export default function ArticleDetailClient({ article, relatedArticles }: ArticleDetailClientProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [copied, setCopied] = useState(false)

  /**
   * 处理点赞
   */
  const handleLike = () => {
    setIsLiked(!isLiked)
    // 这里可以添加API调用
  }

  /**
   * 处理收藏
   */
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // 这里可以添加API调用
  }

  /**
   * 处理分享
   */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      })
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
    } catch (err) {
      console.error('复制失败:', err)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              返回
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button
                variant={isLiked ? 'primary' : 'ghost'}
                onClick={handleLike}
                leftIcon={<Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />}
              >
                {isLiked ? '已点赞' : '点赞'}
              </Button>
              
              <Button
                variant={isBookmarked ? 'primary' : 'ghost'}
                onClick={handleBookmark}
                leftIcon={<Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />}
              >
                {isBookmarked ? '已收藏' : '收藏'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主内容区域 */}
          <div className="lg:col-span-2">
            {/* 文章头部信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-8 mb-8"
            >
              {/* 封面图片 */}
              <div className="aspect-video relative overflow-hidden rounded-lg mb-6">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 分类标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* 标题 */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                {article.title}
              </h1>
              
              {/* 摘要 */}
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {article.excerpt}
              </p>
              
              {/* 文章元信息 */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {new Date(article.published_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">作者：{article.author_name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">{article.view_count} 次阅读</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    leftIcon={<Share2 className="w-4 h-4" />}
                  >
                    分享
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  >
                    {copied ? '已复制' : '复制链接'}
                  </Button>
                </div>
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
                <div dangerouslySetInnerHTML={{ __html: article.htmlContent || '' }} />
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
                <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-xl">
                  {article.author_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{article.author_name}</h3>
                  <p className="text-sm text-gray-500">专栏作者</p>
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
          <RelatedArticles articles={relatedArticles} />
        </motion.div>
      </div>
    </div>
  )
}