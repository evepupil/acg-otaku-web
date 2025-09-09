/**
 * 鉴赏页面组件 - 展示插画鉴赏文章列表和搜索功能
 * 支持分类筛选、搜索和排序功能
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, Eye, Heart, BookOpen, Grid, List, User, Calendar } from 'lucide-react'
import Button from '../../src/components/Button'
import Loading from '../../src/components/Loading'
import { useDebounce, useInfiniteScroll } from '../../src/hooks'
import type { Article } from '../../src/types'

// 文章分类类型
type ArticleCategory = 'all' | 'tutorial' | 'review' | 'interview' | 'news'

/**
 * 文章分类选项
 */
const CATEGORY_OPTIONS: { value: ArticleCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: '全部', icon: <Grid className="w-4 h-4" /> },
  { value: 'tutorial', label: '教程', icon: <BookOpen className="w-4 h-4" /> },
  { value: 'review', label: '评测', icon: <Eye className="w-4 h-4" /> },
  { value: 'interview', label: '访谈', icon: <User className="w-4 h-4" /> },
  { value: 'news', label: '资讯', icon: <Calendar className="w-4 h-4" /> }
]

/**
 * 排序选项
 */
type SortOption = 'latest' | 'popular' | 'views' | 'likes'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'latest', label: '最新发布' },
  { value: 'popular', label: '最受欢迎' },
  { value: 'views', label: '浏览量' },
  { value: 'likes', label: '点赞数' }
]

/**
 * 视图模式
 */
type ViewMode = 'grid' | 'list'

/**
 * 文章卡片组件
 */
function ArticleCard({ article, viewMode }: { article: Article; viewMode: ViewMode }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [liked, setLiked] = useState(false)

  /**
   * 处理点赞操作
   */
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
    
    // 记录用户行为
    try {
      await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like',
          articleId: article.id,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('记录用户行为失败:', error)
    }
  }

  /**
   * 获取分类颜色
   */
  const getCategoryColor = (category: string) => {
      const colors: Record<string, string> = {
        tutorial: 'bg-blue-100 text-blue-600',
        review: 'bg-green-100 text-green-600',
        interview: 'bg-purple-100 text-purple-600',
        news: 'bg-orange-100 text-orange-600'
      }
      return colors[category] || 'bg-gray-100 text-gray-600'
    }

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="glass-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
      >
        <div className="flex">
          {/* 文章封面 */}
          <div className="w-48 h-32 flex-shrink-0 relative overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            <img
              src={article.coverImage}
              alt={article.title}
              className={`
                w-full h-full object-cover group-hover:scale-105 transition-transform duration-300
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* 分类标签 */}
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                {CATEGORY_OPTIONS.find(opt => opt.value === article.category)?.label}
              </span>
            </div>
          </div>
          
          {/* 文章信息 */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2">
                {article.title}
              </h3>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`
                  ml-4 p-2 rounded-full transition-colors duration-200
                  ${liked 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-pink-500 hover:text-white'
                  }
                `}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              </motion.button>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{article.author.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(article.publishDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime}分钟阅读</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{(article.views || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{(article.likes || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
    >
      {/* 文章封面 */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        <img
          src={article.coverImage}
          alt={article.title}
          className={`
            w-full h-full object-cover group-hover:scale-105 transition-transform duration-300
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* 分类标签 */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md ${getCategoryColor(article.category)}`}>
            {CATEGORY_OPTIONS.find(opt => opt.value === article.category)?.label}
          </span>
        </div>
        
        {/* 点赞按钮 */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors duration-200
              ${liked 
                ? 'bg-pink-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-pink-500 hover:text-white'
              }
            `}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
        
        {/* 阅读时间 */}
        <div className="absolute bottom-4 right-4">
          <div className="flex items-center space-x-1 px-2 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
            <Clock className="w-3 h-3" />
            <span>{article.readTime}min</span>
          </div>
        </div>
      </div>
      
      {/* 文章信息 */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {article.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{article.author_name}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{(article.views || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{(article.likes || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {new Date(article.publishDate).toLocaleDateString()}
            </span>
            
            {/* 标签 */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex space-x-1">
                {article.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-emerald-100 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
                {article.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    +{article.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * 鉴赏页面组件
 */
export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<ArticleCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  // const [showFilters, setShowFilters] = useState(false) // 暂时注释，未来可能使用

  // 防抖搜索
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  /**
   * 获取文章数据
   */
  const fetchArticles = async (params: {
    search?: string
    category?: ArticleCategory | 'all'
    sort?: SortOption
    page?: number
    append?: boolean
  } = {}) => {
    try {
      const {
        search = debouncedSearchQuery,
        category: selectedCategory = category,
        sort = sortBy,
        page: selectedPage = 1,
        append = false
      } = params
      
      if (selectedPage === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      
      const searchParams = new URLSearchParams({
        page: selectedPage.toString(),
        limit: '12',
        sort
      })
      
      if (search) {
        searchParams.append('search', search)
      }
      
      if (selectedCategory !== 'all') {
        searchParams.append('category', selectedCategory)
      }
      
      const response = await fetch(`/api/articles?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('获取文章数据失败')
      }
      
      const data = await response.json()
      
      if (append) {
        setArticles(prev => [...prev, ...data.data.articles])
      } else {
        setArticles(data.data.articles)
      }
      
      // 基于当前页数和总页数判断是否还有更多数据
      setHasMore(data.data.pagination.page < data.data.pagination.totalPages)
    } catch (err) {
      console.error('获取数据失败:', err)
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  /**
   * 处理搜索
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
    setHasMore(true)
  }

  /**
   * 处理分类切换
   */
  const handleCategoryChange = (newCategory: ArticleCategory | 'all') => {
    setCategory(newCategory)
    setPage(1)
    setHasMore(true)
    fetchArticles({ category: newCategory, page: 1 })
  }

  /**
   * 处理排序切换
   */
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setPage(1)
    setHasMore(true)
    fetchArticles({ sort: newSort, page: 1 })
  }

  /**
   * 加载更多数据
   */
  const loadMore = useCallback(async () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      await fetchArticles({ page: nextPage, append: true })
    }
  }, [page, loadingMore, hasMore, debouncedSearchQuery, category, sortBy])

  // 无限滚动
  useInfiniteScroll(loadMore, hasMore && !loadingMore)

  // 搜索变化时重新获取数据
  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      setPage(1)
      setHasMore(true)
      fetchArticles({ search: debouncedSearchQuery, page: 1 })
    }
  }, [debouncedSearchQuery])

  // 初始化数据
  useEffect(() => {
    fetchArticles()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              插画鉴赏
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            深度解析插画艺术，分享创作技巧与灵感
          </p>
        </motion.div>

        {/* 搜索和筛选栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {/* 搜索框 */}
          <div className="glass-card p-6 rounded-xl mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索文章标题、作者或标签..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* 筛选控制栏 */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* 分类和排序 */}
            <div className="flex flex-wrap items-center gap-4">
              {/* 分类选择器 */}
              <div className="glass-card p-2 rounded-lg">
                <div className="flex space-x-1">
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleCategoryChange(option.value)}
                      className={`
                        px-3 py-2 rounded-md font-medium transition-all duration-300 flex items-center space-x-2 text-sm
                        ${category === option.value
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-emerald-600 hover:bg-white/50'
                        }
                      `}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 排序选择器 */}
              <div className="glass-card p-2 rounded-lg">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="bg-transparent border-none outline-none text-gray-600 font-medium cursor-pointer"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 视图模式和筛选按钮 */}
            <div className="flex items-center space-x-3">
              {/* 视图模式切换 */}
              <div className="glass-card p-1 rounded-lg">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`
                      p-2 rounded-md transition-all duration-200
                      ${viewMode === 'grid'
                        ? 'bg-emerald-500 text-white'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-white/50'
                      }
                    `}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      p-2 rounded-md transition-all duration-200
                      ${viewMode === 'list'
                        ? 'bg-emerald-500 text-white'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-white/50'
                      }
                    `}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 文章内容 */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <Loading variant="spinner" size="lg" text="加载文章内容..." />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="glass-card p-8 rounded-xl max-w-md mx-auto">
                <div className="text-red-500 mb-4">
                  <BookOpen className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                  onClick={() => fetchArticles()}
                  variant="primary"
                >
                  重试
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`articles-${category}-${sortBy}-${debouncedSearchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* 文章网格/列表 */}
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-6'
                }
              `}>
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* 加载更多指示器 */}
              {loadingMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center py-8"
                >
                  <Loading variant="spinner" size="md" text="加载更多..." />
                </motion.div>
              )}

              {/* 没有更多内容提示 */}
              {!hasMore && articles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-gray-500">已经到底了，没有更多内容了</p>
                </motion.div>
              )}

              {/* 空状态 */}
              {!loading && articles.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="glass-card p-8 rounded-xl max-w-md mx-auto">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {searchQuery ? '未找到相关文章' : '暂无文章内容'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery ? '请尝试其他关键词或调整筛选条件' : '请稍后再试或联系管理员'}
                    </p>
                    {searchQuery && (
                      <Button
                        onClick={() => handleSearch('')}
                        variant="primary"
                      >
                        清除搜索
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}