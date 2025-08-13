import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Eye, Heart, Calendar, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

// 模拟数据
const rankingData = {
  daily: [
    { id: '1', title: '魔法少女变身', artist: '画师A', views: 25420, likes: 3240, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=magical%20girl%20transformation%20anime%20style%20sparkles%20colorful&image_size=square' },
    { id: '2', title: '机甲战士出击', artist: '画师B', views: 22350, likes: 2890, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mecha%20warrior%20battle%20anime%20robot%20action&image_size=square' },
    { id: '3', title: '森林中的精灵', artist: '画师C', views: 19800, likes: 2650, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=forest%20elf%20anime%20nature%20magic%20beautiful&image_size=square' },
    { id: '4', title: '星空下的约定', artist: '画师D', views: 18200, likes: 2420, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=starry%20night%20anime%20couple%20romantic%20constellation&image_size=square' },
    { id: '5', title: '夏日海滩派对', artist: '画师E', views: 17600, likes: 2180, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=summer%20beach%20party%20anime%20fun%20tropical&image_size=square' },
    { id: '6', title: '古风美人', artist: '画师F', views: 16900, likes: 2050, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20beauty%20traditional%20dress%20elegant&image_size=square' },
  ],
  weekly: [
    { id: '7', title: '龙族传说', artist: '画师G', views: 45200, likes: 5680, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=dragon%20legend%20anime%20fantasy%20epic%20mythology&image_size=square' },
    { id: '8', title: '校园青春', artist: '画师H', views: 42800, likes: 5320, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=school%20youth%20anime%20students%20cherry%20blossoms&image_size=square' },
    { id: '9', title: '赛博朋克城市', artist: '画师I', views: 40100, likes: 4890, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20city%20anime%20neon%20futuristic%20night&image_size=square' },
    { id: '10', title: '猫咪咖啡厅', artist: '画师J', views: 38500, likes: 4650, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cat%20cafe%20anime%20cute%20cozy%20warm&image_size=square' },
    { id: '11', title: '武侠江湖', artist: '画师K', views: 36200, likes: 4320, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=martial%20arts%20anime%20warrior%20traditional%20action&image_size=square' },
    { id: '12', title: '太空探险', artist: '画师L', views: 34800, likes: 4120, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=space%20adventure%20anime%20astronaut%20galaxy%20stars&image_size=square' },
  ],
  monthly: [
    { id: '13', title: '时间旅行者', artist: '画师M', views: 78900, likes: 9240, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=time%20traveler%20anime%20clock%20portal%20mysterious&image_size=square' },
    { id: '14', title: '花园仙境', artist: '画师N', views: 76200, likes: 8890, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=garden%20wonderland%20anime%20flowers%20fairy%20magical&image_size=square' },
    { id: '15', title: '深海奇遇', artist: '画师O', views: 73500, likes: 8520, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=deep%20sea%20adventure%20anime%20underwater%20mysterious&image_size=square' },
    { id: '16', title: '音乐之声', artist: '画师P', views: 71800, likes: 8180, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=music%20anime%20instruments%20melody%20performance&image_size=square' },
    { id: '17', title: '梦境世界', artist: '画师Q', views: 69200, likes: 7890, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=dream%20world%20anime%20surreal%20fantasy%20clouds&image_size=square' },
    { id: '18', title: '料理大师', artist: '画师R', views: 67600, likes: 7650, imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cooking%20master%20anime%20chef%20delicious%20food&image_size=square' },
  ],
};

type PeriodType = 'daily' | 'weekly' | 'monthly';

/**
 * 排行榜页面组件
 * 包含时间切换器和插画网格展示
 */
const Rankings: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('daily');
  const [isLoading, setIsLoading] = useState(false);

  const periods = [
    { key: 'daily' as PeriodType, label: '每日排行', icon: Calendar },
    { key: 'weekly' as PeriodType, label: '每周排行', icon: TrendingUp },
    { key: 'monthly' as PeriodType, label: '每月排行', icon: Filter },
  ];

  /**
   * 切换时间维度
   */
  const handlePeriodChange = (period: PeriodType) => {
    if (period === selectedPeriod) return;
    
    setIsLoading(true);
    setSelectedPeriod(period);
    
    // 模拟加载延迟
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  /**
   * 获取当前排行数据
   */
  const getCurrentRankings = () => {
    return rankingData[selectedPeriod] || [];
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            插画排行榜
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            发现最受欢迎的插画作品，感受艺术的魅力
          </p>
        </motion.div>

        {/* 时间切换器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-2 shadow-lg">
            <div className="flex space-x-2">
              {periods.map((period) => {
                const Icon = period.icon;
                const isActive = selectedPeriod === period.key;
                
                return (
                  <motion.button
                    key={period.key}
                    onClick={() => handlePeriodChange(period.key)}
                    className={`
                      relative px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2
                      ${isActive 
                        ? 'text-white shadow-lg' 
                        : 'text-gray-700 hover:text-purple-600 hover:bg-white/50'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" />
                    <span className="font-medium relative z-10">{period.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* 排行榜内容 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPeriod}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {isLoading ? (
              /* 加载状态 */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg animate-pulse"
                  >
                    <div className="w-full h-48 bg-gray-300 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 排行榜网格 */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCurrentRankings().map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link to={`/artwork/${artwork.id}`} className="block">
                      {/* 排名标识 */}
                      <div className="relative">
                        <img
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg
                            ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                              index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                              'bg-gradient-to-r from-purple-400 to-purple-600'
                            }
                          `}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>

                      {/* 作品信息 */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                          {artwork.title}
                        </h3>
                        <p className="text-gray-600 mb-4">by {artwork.artist}</p>
                        
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
            )}
          </motion.div>
        </AnimatePresence>

        {/* 加载更多按钮 */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl">
              加载更多作品
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Rankings;