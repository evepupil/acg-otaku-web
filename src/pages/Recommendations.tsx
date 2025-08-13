import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, RefreshCw, Eye, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

// 模拟数据
const dailyRecommendations = [
  {
    id: '1',
    title: '梦幻星河',
    artist: '星空画师',
    description: '璀璨的星河在夜空中流淌，如梦如幻的宇宙景象让人沉醉其中。',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=dreamy%20galaxy%20anime%20style%20stars%20nebula%20cosmic%20beautiful&image_size=landscape_4_3',
    likes: 12450,
    views: 45200,
    tags: ['星空', '梦幻', '宇宙'],
    featured: true,
  },
  {
    id: '2',
    title: '春日物语',
    artist: '花见画师',
    description: '温暖的春日阳光洒在樱花树下，少女的笑容如花般绽放。',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20story%20anime%20girl%20cherry%20blossoms%20warm%20sunlight&image_size=landscape_4_3',
    likes: 9820,
    views: 32100,
    tags: ['春天', '樱花', '少女'],
    featured: true,
  },
];

const smartRecommendations = [
  {
    id: '3',
    title: '机械之心',
    artist: '机甲大师',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mechanical%20heart%20anime%20robot%20cyberpunk%20detailed&image_size=square',
    likes: 8650,
    views: 28900,
    reason: '基于您对科幻类作品的喜好',
  },
  {
    id: '4',
    title: '古风美人',
    artist: '墨染画师',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20beauty%20traditional%20hanfu%20elegant%20ink%20painting&image_size=square',
    likes: 7320,
    views: 24600,
    reason: '您经常浏览古风类插画',
  },
  {
    id: '5',
    title: '魔法学院',
    artist: '魔法画师',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=magic%20academy%20anime%20school%20wizards%20fantasy%20castle&image_size=square',
    likes: 6890,
    views: 22400,
    reason: '与您收藏的作品风格相似',
  },
  {
    id: '6',
    title: '海底世界',
    artist: '深海画师',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=underwater%20world%20anime%20mermaid%20coral%20reef%20beautiful&image_size=square',
    likes: 6420,
    views: 21800,
    reason: '新兴热门风格推荐',
  },
  {
    id: '7',
    title: '都市夜景',
    artist: '城市画师',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=city%20night%20anime%20neon%20lights%20urban%20atmosphere&image_size=square',
    likes: 5980,
    views: 19500,
    reason: '根据浏览时间推荐',
  },
  {
    id: '8',
    title: '森林精灵',
    artist: '自然画师',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=forest%20spirit%20anime%20nature%20elf%20magical%20green&image_size=square',
    likes: 5650,
    views: 18200,
    reason: '同类画师作品推荐',
  },
];

/**
 * 推荐页面组件
 * 包含每日推荐和智能推荐模块
 */
const Recommendations: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * 刷新推荐内容
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    // 模拟刷新延迟
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
            精选推荐
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            为您精心挑选的优质插画作品，发现更多惊喜
          </p>
        </motion.div>

        {/* 每日推荐 */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">今日精选</h2>
            </div>
            <div className="text-sm text-gray-600 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>每日更新</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {dailyRecommendations.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to={`/artwork/${artwork.id}`} className="block">
                  <div className="relative">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-64 object-cover"
                    />
                    {artwork.featured && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                          <Sparkles className="w-4 h-4" />
                          <span>精选</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{artwork.title}</h3>
                    <p className="text-gray-600 mb-3">by {artwork.artist}</p>
                    <p className="text-gray-700 mb-4 line-clamp-2">{artwork.description}</p>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {artwork.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 统计信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{artwork.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>{artwork.likes.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 智能推荐 */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">智能推荐</h2>
            </div>
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-lg hover:bg-white/80 transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>刷新推荐</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {smartRecommendations.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to={`/artwork/${artwork.id}`} className="block">
                  <div className="relative">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
                      {artwork.title}
                    </h3>
                    <p className="text-gray-600 mb-3 text-sm">by {artwork.artist}</p>
                    
                    {/* 推荐理由 */}
                    <div className="mb-3">
                      <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs inline-block">
                        {artwork.reason}
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{artwork.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{artwork.likes.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* 加载更多 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-12"
          >
            <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl">
              发现更多推荐
            </button>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default Recommendations;