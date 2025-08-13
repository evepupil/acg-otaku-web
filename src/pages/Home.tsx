import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, Heart, BookOpen, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

// 模拟数据
const featuredArtworks = [
  {
    id: '1',
    title: '春日樱花',
    artist: '画师A',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20cherry%20blossoms%20in%20spring%20anime%20style%20pink%20petals%20falling&image_size=landscape_16_9',
    description: '温柔的春日樱花飘落，唯美的粉色世界',
  },
  {
    id: '2',
    title: '星空下的少女',
    artist: '画师B',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20girl%20under%20starry%20night%20sky%20beautiful%20constellation%20dreamy%20atmosphere&image_size=landscape_16_9',
    description: '璀璨星空下的梦幻少女',
  },
  {
    id: '3',
    title: '夏日海滩',
    artist: '画师C',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=summer%20beach%20anime%20style%20blue%20ocean%20waves%20sunny%20day%20tropical&image_size=landscape_16_9',
    description: '清爽的夏日海滩风光',
  },
];

const hotPreviews = {
  rankings: [
    { id: '1', title: '魔法少女', views: 15420, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=magical%20girl%20anime%20style%20colorful%20costume%20sparkles&image_size=square' },
    { id: '2', title: '机甲战士', views: 12350, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mecha%20warrior%20anime%20robot%20suit%20futuristic&image_size=square' },
  ],
  recommendations: [
    { id: '3', title: '森林精灵', likes: 8920, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=forest%20elf%20anime%20style%20nature%20magic%20green%20leaves&image_size=square' },
    { id: '4', title: '城市夜景', likes: 7650, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=city%20night%20scene%20anime%20neon%20lights%20urban%20landscape&image_size=square' },
  ],
  articles: [
    { id: '1', title: '插画构图技巧分析', readTime: '5分钟', category: '技法分析' },
    { id: '2', title: '知名画师作品赏析', readTime: '8分钟', category: '画师推荐' },
  ],
};

/**
 * 首页组件
 * 包含轮播展示和各模块热门预览
 */
const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  /**
   * 自动轮播效果
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArtworks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  /**
   * 切换到指定幻灯片
   */
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  /**
   * 上一张幻灯片
   */
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredArtworks.length) % featuredArtworks.length);
  };

  /**
   * 下一张幻灯片
   */
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredArtworks.length);
  };

  return (
    <div className="min-h-screen">
      {/* 轮播展示区 */}
      <section className="relative h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${featuredArtworks[currentSlide].imageUrl})` }}
            >
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 内容覆盖层 */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent"
            >
              Pixiv Gallery
            </motion.h1>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl mb-8 text-white/90"
            >
              发现最美的插画世界
            </motion.p>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-6 mb-8"
            >
              <h3 className="text-2xl font-bold mb-2">{featuredArtworks[currentSlide].title}</h3>
              <p className="text-lg text-white/80 mb-2">by {featuredArtworks[currentSlide].artist}</p>
              <p className="text-white/70">{featuredArtworks[currentSlide].description}</p>
            </motion.div>
          </div>
        </div>

        {/* 轮播控制 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {featuredArtworks.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* 左右箭头 */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </section>

      {/* 热门预览区 */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            热门内容
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 排行榜预览 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-800">热门排行</h3>
              </div>
              <div className="space-y-3">
                {hotPreviews.rankings.map((item, index) => (
                  <Link
                    key={item.id}
                    to={`/artwork/${item.id}`}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-all duration-300"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{item.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-purple-600">#{index + 1}</span>
                  </Link>
                ))}
              </div>
              <Link
                to="/rankings"
                className="block mt-4 text-center py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                查看更多排行
              </Link>
            </motion.div>

            {/* 推荐预览 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-pink-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-800">精选推荐</h3>
              </div>
              <div className="space-y-3">
                {hotPreviews.recommendations.map((item) => (
                  <Link
                    key={item.id}
                    to={`/artwork/${item.id}`}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-all duration-300"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Heart className="w-4 h-4 mr-1" />
                        <span>{item.likes.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                to="/recommendations"
                className="block mt-4 text-center py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-300"
              >
                发现更多推荐
              </Link>
            </motion.div>

            {/* 鉴赏预览 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-800">精彩鉴赏</h3>
              </div>
              <div className="space-y-3">
                {hotPreviews.articles.map((item) => (
                  <Link
                    key={item.id}
                    to={`/article/${item.id}`}
                    className="block p-3 rounded-lg hover:bg-white/50 transition-all duration-300"
                  >
                    <p className="font-medium text-gray-800 mb-1">{item.title}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">{item.category}</span>
                      <span>{item.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                to="/articles"
                className="block mt-4 text-center py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
              >
                阅读更多文章
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;