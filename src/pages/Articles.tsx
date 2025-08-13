import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, Clock, Eye, Tag, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

// 模拟数据
const articlesData = {
  all: [
    {
      id: '1',
      title: '插画构图的黄金法则：如何让你的作品更具视觉冲击力',
      excerpt: '构图是插画创作中最重要的基础技能之一。本文将深入探讨黄金分割、三分法则等经典构图技巧，帮助你创作出更具吸引力的作品。',
      category: 'review',
      author: '艺术导师小王',
      publishDate: '2024-01-15',
      readTime: '8分钟',
      views: 12450,
      coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=art%20composition%20golden%20ratio%20tutorial%20illustration&image_size=landscape_4_3',
      tags: ['构图', '技法', '教程'],
    },
    {
      id: '2',
      title: '知名画师专访：从业余爱好到职业插画师的成长之路',
      excerpt: '本期我们采访了知名插画师「星河绘梦」，分享她从零基础到成为职业插画师的心路历程，以及对新手的建议和经验分享。',
      category: 'artist',
      author: '编辑部',
      publishDate: '2024-01-12',
      readTime: '12分钟',
      views: 18920,
      coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=artist%20interview%20workspace%20drawing%20tablet%20creative&image_size=landscape_4_3',
      tags: ['画师专访', '职业发展', '经验分享'],
    },
    {
      id: '3',
      title: '色彩心理学在插画中的应用：如何用颜色讲故事',
      excerpt: '颜色不仅仅是视觉元素，更是情感的载体。了解色彩心理学，让你的插画作品更能触动观者的内心，传达深层的情感信息。',
      category: 'review',
      author: '色彩专家李老师',
      publishDate: '2024-01-10',
      readTime: '10分钟',
      views: 15680,
      coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=color%20psychology%20palette%20emotions%20art%20theory&image_size=landscape_4_3',
      tags: ['色彩理论', '心理学', '情感表达'],
    },
    {
      id: '4',
      title: '新锐画师推荐：「梦境编织者」的超现实主义世界',
      excerpt: '今天为大家介绍一位充满想象力的新锐画师「梦境编织者」，她的作品融合了超现实主义和现代插画技法，创造出令人惊叹的梦幻世界。',
      category: 'artist',
      author: '艺术评论员张三',
      publishDate: '2024-01-08',
      readTime: '6分钟',
      views: 9340,
      coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=surreal%20dream%20fantasy%20art%20imagination%20creative&image_size=landscape_4_3',
      tags: ['新锐画师', '超现实主义', '梦幻'],
    },
    {
      id: '5',
      title: '数字绘画工具对比：Photoshop vs Procreate vs Clip Studio Paint',
      excerpt: '选择合适的绘画软件对创作效率至关重要。本文详细对比了三款主流数字绘画工具的优缺点，帮助你找到最适合的创作伙伴。',
      category: 'review',
      author: '数字艺术专家',
      publishDate: '2024-01-05',
      readTime: '15分钟',
      views: 22100,
      coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20art%20software%20comparison%20tools%20technology&image_size=landscape_4_3',
      tags: ['数字绘画', '软件对比', '工具'],
    },
    {
      id: '6',
      title: '传统与现代的碰撞：古风插画的创新表达',
      excerpt: '古风插画如何在保持传统韵味的同时融入现代元素？本文探讨了古风插画的发展趋势和创新方向。',
      category: 'review',
      author: '古风艺术研究者',
      publishDate: '2024-01-03',
      readTime: '9分钟',
      views: 13750,
      coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20art%20modern%20fusion%20ancient%20style&image_size=landscape_4_3',
      tags: ['古风', '传统艺术', '创新'],
    },
  ],
};

type CategoryType = 'all' | 'review' | 'artist';

/**
 * 鉴赏页面组件
 * 包含文章列表和分类导航
 */
const Articles: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { key: 'all' as CategoryType, label: '全部文章', icon: BookOpen },
    { key: 'review' as CategoryType, label: '技法鉴赏', icon: Eye },
    { key: 'artist' as CategoryType, label: '画师推荐', icon: User },
  ];

  /**
   * 切换分类
   */
  const handleCategoryChange = (category: CategoryType) => {
    if (category === selectedCategory) return;
    
    setIsLoading(true);
    setSelectedCategory(category);
    
    // 模拟加载延迟
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  /**
   * 获取过滤后的文章
   */
  const getFilteredArticles = () => {
    let articles = articlesData.all;
    
    // 按分类过滤
    if (selectedCategory !== 'all') {
      articles = articles.filter(article => article.category === selectedCategory);
    }
    
    // 按搜索词过滤
    if (searchTerm) {
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return articles;
  };

  /**
   * 获取分类标签样式
   */
  const getCategoryBadge = (category: string) => {
    const styles = {
      review: 'bg-blue-100 text-blue-600',
      artist: 'bg-green-100 text-green-600',
    };
    return styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-600';
  };

  /**
   * 获取分类标签文本
   */
  const getCategoryLabel = (category: string) => {
    const labels = {
      review: '技法鉴赏',
      artist: '画师推荐',
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            插画鉴赏
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            深度解析插画艺术，分享创作技巧与画师故事
          </p>
        </motion.div>

        {/* 搜索和筛选 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文章标题、内容或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          
          {/* 分类筛选 */}
          <div className="flex space-x-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.key;
              
              return (
                <motion.button
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
                  className={`
                    relative px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2
                    ${isActive 
                      ? 'text-white shadow-lg' 
                      : 'text-gray-700 bg-white/60 backdrop-blur-md hover:bg-white/80'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="font-medium relative z-10">{category.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* 文章列表 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${searchTerm}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {isLoading ? (
              /* 加载状态 */
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg animate-pulse"
                  >
                    <div className="flex gap-6">
                      <div className="w-48 h-32 bg-gray-300 rounded-xl flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-300 rounded mb-3"></div>
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                          <div className="h-6 bg-gray-300 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 文章列表 */
              <div className="space-y-6">
                {getFilteredArticles().length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">暂无相关文章</p>
                    <p className="text-gray-500 mt-2">尝试调整搜索条件或分类筛选</p>
                  </motion.div>
                ) : (
                  getFilteredArticles().map((article, index) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Link to={`/article/${article.id}`} className="block">
                        <div className="flex flex-col md:flex-row gap-6 p-6">
                          {/* 文章封面 */}
                          <div className="md:w-48 flex-shrink-0">
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="w-full h-32 md:h-32 object-cover rounded-xl"
                            />
                          </div>
                          
                          {/* 文章信息 */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h2 className="text-xl md:text-2xl font-bold text-gray-800 line-clamp-2 flex-1">
                                {article.title}
                              </h2>
                              <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${getCategoryBadge(article.category)}`}>
                                {getCategoryLabel(article.category)}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {article.excerpt}
                            </p>
                            
                            {/* 标签 */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {article.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm flex items-center space-x-1"
                                >
                                  <Tag className="w-3 h-3" />
                                  <span>{tag}</span>
                                </span>
                              ))}
                            </div>
                            
                            {/* 文章元信息 */}
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center space-x-4">
                                <span>by {article.author}</span>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{article.readTime}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-4 h-4" />
                                  <span>{article.views.toLocaleString()}</span>
                                </div>
                              </div>
                              <span>{article.publishDate}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 加载更多 */}
        {!isLoading && getFilteredArticles().length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl">
              加载更多文章
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Articles;