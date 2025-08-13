import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  Heart, 
  Bookmark, 
  Share2, 
  Download, 
  Eye, 
  Calendar, 
  Tag, 
  User, 
  ArrowLeft,
  ExternalLink,
  Palette,
  Layers
} from 'lucide-react';

// 模拟数据
const illustrationData = {
  '1': {
    id: '1',
    title: '星空下的少女',
    artist: '星河绘梦',
    artistId: 'artist_001',
    description: '在宁静的夜晚，少女仰望着满天繁星，心中充满了对未来的憧憬和梦想。这幅作品运用了深蓝色调和点状光效，营造出梦幻而宁静的氛围。',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20girl%20starry%20night%20sky%20dreamy%20atmosphere&image_size=portrait_4_3',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20girl%20starry%20night%20sky%20dreamy%20atmosphere&image_size=square',
    publishDate: '2024-01-15',
    views: 15420,
    likes: 2340,
    bookmarks: 890,
    tags: ['插画', '少女', '星空', '夜景', '梦幻'],
    dimensions: '2480 × 3508',
    fileSize: '8.5 MB',
    software: 'Photoshop',
    category: 'Original',
    ranking: {
      daily: 3,
      weekly: 8,
      monthly: 15
    },
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#7209b7']
  },
  '2': {
    id: '2',
    title: '机械少女',
    artist: '未来科技',
    artistId: 'artist_002',
    description: '融合了科幻元素和少女形象的创新作品，展现了技术与美学的完美结合。细致的机械结构和柔美的人物形象形成强烈对比。',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20anime%20girl%20mechanical%20futuristic%20detailed&image_size=portrait_4_3',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20anime%20girl%20mechanical%20futuristic%20detailed&image_size=square',
    publishDate: '2024-01-14',
    views: 12890,
    likes: 1980,
    bookmarks: 720,
    tags: ['科幻', '机械', '少女', '赛博朋克', '未来'],
    dimensions: '1920 × 2560',
    fileSize: '12.3 MB',
    software: 'Clip Studio Paint',
    category: 'Original',
    ranking: {
      daily: 5,
      weekly: 12,
      monthly: 28
    },
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7']
  }
};

// 相关推荐数据
const relatedIllustrations = [
  {
    id: '3',
    title: '月光森林',
    artist: '自然画师',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=moonlight%20forest%20magical%20nature%20anime%20style&image_size=square',
    likes: 1560
  },
  {
    id: '4',
    title: '城市夜景',
    artist: '都市绘者',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=city%20night%20lights%20urban%20anime%20style&image_size=square',
    likes: 2100
  },
  {
    id: '5',
    title: '花园少女',
    artist: '花语画师',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20girl%20flower%20garden%20spring%20beautiful&image_size=square',
    likes: 1890
  },
  {
    id: '6',
    title: '魔法学院',
    artist: '奇幻创作者',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=magic%20academy%20fantasy%20anime%20school&image_size=square',
    likes: 2450
  }
];

/**
 * 插画详情页面组件
 * 展示插画的详细信息和相关推荐
 */
const IllustrationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [illustration, setIllustration] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      if (id && illustrationData[id as keyof typeof illustrationData]) {
        setIllustration(illustrationData[id as keyof typeof illustrationData]);
      }
      setIsLoading(false);
    }, 500);
  }, [id]);

  /**
   * 处理点赞
   */
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (illustration) {
      illustration.likes += isLiked ? -1 : 1;
    }
  };

  /**
   * 处理收藏
   */
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (illustration) {
      illustration.bookmarks += isBookmarked ? -1 : 1;
    }
  };

  /**
   * 处理分享
   */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: illustration?.title,
        text: illustration?.description,
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  /**
   * 处理下载
   */
  const handleDownload = () => {
    // 模拟下载功能
    alert('下载功能需要登录后使用');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!illustration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">插画不存在</h1>
          <Link to="/" className="text-blue-500 hover:text-blue-600">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2">
            {/* 插画图片 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative mb-8"
            >
              <div className="bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
                {!imageLoaded && (
                  <div className="aspect-[4/3] bg-gray-200 animate-pulse flex items-center justify-center">
                    <Layers className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <img
                  src={illustration.imageUrl}
                  alt={illustration.title}
                  className={`w-full h-auto transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </motion.div>

            {/* 插画信息 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {illustration.title}
              </h1>
              
              <div className="flex items-center space-x-6 mb-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <Link 
                    to={`/artist/${illustration.artistId}`}
                    className="hover:text-blue-600 transition-colors duration-300"
                  >
                    {illustration.artist}
                  </Link>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{illustration.publishDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>{illustration.views.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                {illustration.description}
              </p>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mb-6">
                {illustration.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center space-x-1"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-4">
                <motion.button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isLiked 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'bg-white/80 text-gray-700 hover:bg-red-50 hover:text-red-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{illustration.likes.toLocaleString()}</span>
                </motion.button>

                <motion.button
                  onClick={handleBookmark}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isBookmarked 
                      ? 'bg-yellow-500 text-white shadow-lg' 
                      : 'bg-white/80 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>{illustration.bookmarks.toLocaleString()}</span>
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/80 text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-500 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 className="w-5 h-5" />
                  <span>分享</span>
                </motion.button>

                <motion.button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/80 text-gray-700 rounded-xl hover:bg-green-50 hover:text-green-500 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-5 h-5" />
                  <span>下载</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 作品信息 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">作品信息</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">尺寸</span>
                  <span className="font-medium">{illustration.dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">文件大小</span>
                  <span className="font-medium">{illustration.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">创作软件</span>
                  <span className="font-medium">{illustration.software}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">分类</span>
                  <span className="font-medium">{illustration.category}</span>
                </div>
              </div>
            </motion.div>

            {/* 排行信息 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">排行榜</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">日榜</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-sm font-medium">
                    #{illustration.ranking.daily}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">周榜</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm font-medium">
                    #{illustration.ranking.weekly}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">月榜</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-sm font-medium">
                    #{illustration.ranking.monthly}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 色彩分析 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>主要色彩</span>
              </h3>
              <div className="flex space-x-2">
                {illustration.colors.map((color: string, index: number) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: color }}
                    title={color}
                  ></div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* 相关推荐 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">相关推荐</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedIllustrations.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/60 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to={`/illustration/${item.id}`}>
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{item.artist}</p>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Heart className="w-4 h-4" />
                      <span>{item.likes.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IllustrationDetail;