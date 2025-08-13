import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Heart, 
  Bookmark, 
  Share2, 
  User, 
  Calendar,
  Tag,
  MessageCircle,
  ThumbsUp,
  Quote
} from 'lucide-react';

// 模拟文章数据
const articleData = {
  '1': {
    id: '1',
    title: '插画构图的黄金法则：如何让你的作品更具视觉冲击力',
    content: `
      <h2>引言</h2>
      <p>构图是插画创作中最重要的基础技能之一。一个好的构图能够引导观者的视线，传达作品的情感，并创造出强烈的视觉冲击力。本文将深入探讨插画构图的核心原理和实用技巧。</p>
      
      <h2>黄金分割法则</h2>
      <p>黄金分割比例（1:1.618）是自然界中普遍存在的美学比例，在插画创作中运用这一比例可以创造出更加和谐美观的构图效果。</p>
      
      <blockquote>
        "黄金分割不仅仅是一个数学概念，更是艺术创作中的美学密码。" - 达芬奇
      </blockquote>
      
      <h3>实际应用技巧</h3>
      <ul>
        <li>将画面按黄金比例分割，重要元素放置在分割点上</li>
        <li>利用黄金螺旋线引导视线流动</li>
        <li>在人物比例设计中应用黄金分割</li>
      </ul>
      
      <h2>三分法则</h2>
      <p>三分法则是最常用的构图技巧之一。将画面用两条水平线和两条垂直线分成九个相等的部分，重要元素放置在线条交叉点附近。</p>
      
      <h3>三分法则的优势</h3>
      <ol>
        <li>创造视觉平衡</li>
        <li>避免画面过于居中的单调感</li>
        <li>增强画面的动态感</li>
      </ol>
      
      <h2>对称与非对称构图</h2>
      <p>对称构图给人以稳定、庄重的感觉，而非对称构图则更具动感和活力。根据作品要表达的情感选择合适的构图方式。</p>
      
      <h2>色彩在构图中的作用</h2>
      <p>色彩不仅影响画面的情感表达，也是构图的重要元素。暖色具有前进感，冷色具有后退感，合理运用色彩的这些特性可以增强画面的层次感。</p>
      
      <h2>实践建议</h2>
      <p>理论知识需要通过大量的实践来内化。建议初学者：</p>
      <ul>
        <li>多观察优秀作品的构图方式</li>
        <li>尝试用不同构图方法创作同一主题</li>
        <li>记录自己的构图心得和感悟</li>
      </ul>
      
      <h2>结语</h2>
      <p>构图技巧是插画创作的基础，但不应成为创作的束缚。在掌握基本规则的基础上，勇于突破和创新，才能创作出真正打动人心的作品。</p>
    `,
    excerpt: '构图是插画创作中最重要的基础技能之一。本文将深入探讨黄金分割、三分法则等经典构图技巧，帮助你创作出更具吸引力的作品。',
    author: '艺术导师小王',
    authorId: 'author_001',
    authorAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20art%20teacher%20avatar%20friendly&image_size=square',
    publishDate: '2024-01-15',
    readTime: '8分钟',
    views: 12450,
    likes: 890,
    bookmarks: 340,
    comments: 67,
    category: 'review',
    tags: ['构图', '技法', '教程', '黄金分割', '三分法则'],
    coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=art%20composition%20golden%20ratio%20tutorial%20illustration&image_size=landscape_4_3',
    relatedImages: [
      'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20ratio%20spiral%20composition%20example&image_size=landscape_4_3',
      'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=rule%20of%20thirds%20grid%20photography%20composition&image_size=landscape_4_3',
      'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=symmetrical%20vs%20asymmetrical%20composition%20comparison&image_size=landscape_4_3'
    ]
  },
  '2': {
    id: '2',
    title: '知名画师专访：从业余爱好到职业插画师的成长之路',
    content: `
      <h2>画师简介</h2>
      <p>今天我们有幸采访到知名插画师「星河绘梦」，她从一名业余爱好者成长为职业插画师，作品风格独特，深受粉丝喜爱。</p>
      
      <h2>Q: 请介绍一下您的创作历程</h2>
      <p><strong>星河绘梦：</strong>我最初只是因为喜欢动漫而开始画画，完全是自学。大学期间利用课余时间不断练习，毕业后决定全职投入插画创作。</p>
      
      <h2>Q: 从业余到职业的转变过程中遇到了哪些挑战？</h2>
      <p><strong>星河绘梦：</strong>最大的挑战是如何在保持创作热情的同时，学会商业化运作。需要了解市场需求，学会与客户沟通，同时保持自己的艺术风格。</p>
      
      <blockquote>
        "创作不仅仅是技法的展现，更是情感的传达。" - 星河绘梦
      </blockquote>
      
      <h2>Q: 对于想要成为职业插画师的新手，您有什么建议？</h2>
      <p><strong>星河绘梦：</strong>我的建议是：</p>
      <ol>
        <li>扎实的基础功底是一切的根本</li>
        <li>多观察生活，积累素材和灵感</li>
        <li>建立自己的作品集和个人品牌</li>
        <li>学会接受批评和建议</li>
        <li>保持持续学习的心态</li>
      </ol>
      
      <h2>Q: 您的创作灵感主要来源于哪里？</h2>
      <p><strong>星河绘梦：</strong>灵感无处不在。可能是一首歌、一部电影、一个梦境，甚至是路边的一朵花。关键是要保持敏感的心，随时记录下触动自己的瞬间。</p>
      
      <h2>Q: 在技法提升方面，您有什么心得？</h2>
      <p><strong>星河绘梦：</strong>技法的提升需要大量的练习和思考。我建议新手可以：</p>
      <ul>
        <li>临摹优秀作品，但要思考为什么这样画</li>
        <li>尝试不同的绘画风格和技法</li>
        <li>参加线上线下的绘画课程</li>
        <li>与其他画师交流学习</li>
      </ul>
      
      <h2>Q: 对于未来的创作计划，您有什么想法？</h2>
      <p><strong>星河绘梦：</strong>我希望能够创作更多有深度的作品，不仅仅是视觉上的美感，更要有情感的共鸣。同时也想尝试一些新的创作形式，比如动画短片。</p>
      
      <h2>结语</h2>
      <p>通过这次访谈，我们看到了一位职业插画师的成长历程和创作心得。希望她的经验能够为更多有志于插画创作的朋友提供帮助和启发。</p>
    `,
    excerpt: '本期我们采访了知名插画师「星河绘梦」，分享她从零基础到成为职业插画师的心路历程，以及对新手的建议和经验分享。',
    author: '编辑部',
    authorId: 'author_002',
    authorAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=editorial%20team%20professional%20avatar&image_size=square',
    publishDate: '2024-01-12',
    readTime: '12分钟',
    views: 18920,
    likes: 1240,
    bookmarks: 580,
    comments: 89,
    category: 'artist',
    tags: ['画师专访', '职业发展', '经验分享', '创作心得'],
    coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=artist%20interview%20workspace%20drawing%20tablet%20creative&image_size=landscape_4_3',
    relatedImages: [
      'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=artist%20workspace%20setup%20creative%20environment&image_size=landscape_4_3',
      'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20art%20creation%20process%20steps&image_size=landscape_4_3'
    ]
  }
};

// 相关文章数据
const relatedArticles = [
  {
    id: '3',
    title: '色彩心理学在插画中的应用',
    author: '色彩专家李老师',
    readTime: '10分钟',
    coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=color%20psychology%20palette%20emotions%20art%20theory&image_size=square',
    category: 'review'
  },
  {
    id: '4',
    title: '新锐画师推荐：梦境编织者',
    author: '艺术评论员张三',
    readTime: '6分钟',
    coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=surreal%20dream%20fantasy%20art%20imagination%20creative&image_size=square',
    category: 'artist'
  },
  {
    id: '5',
    title: '数字绘画工具对比分析',
    author: '数字艺术专家',
    readTime: '15分钟',
    coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20art%20software%20comparison%20tools%20technology&image_size=square',
    category: 'review'
  }
];

/**
 * 文章详情页面组件
 * 展示文章内容和相关推荐
 */
const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      if (id && articleData[id as keyof typeof articleData]) {
        setArticle(articleData[id as keyof typeof articleData]);
      }
      setIsLoading(false);
    }, 500);
  }, [id]);

  useEffect(() => {
    // 监听滚动进度
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * 处理点赞
   */
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (article) {
      article.likes += isLiked ? -1 : 1;
    }
  };

  /**
   * 处理收藏
   */
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (article) {
      article.bookmarks += isBookmarked ? -1 : 1;
    }
  };

  /**
   * 处理分享
   */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
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

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">文章不存在</h1>
          <Link to="/articles" className="text-blue-500 hover:text-blue-600">
            返回文章列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 阅读进度条 */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Link
              to="/articles"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回文章列表</span>
            </Link>
          </motion.div>

          {/* 文章头部 */}
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            {/* 分类标签 */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryBadge(article.category)}`}>
                {getCategoryLabel(article.category)}
              </span>
            </div>

            {/* 标题 */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* 文章元信息 */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <img 
                  src={article.authorAvatar} 
                  alt={article.author}
                  className="w-8 h-8 rounded-full"
                />
                <Link 
                  to={`/author/${article.authorId}`}
                  className="hover:text-blue-600 transition-colors duration-300"
                >
                  {article.author}
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{article.publishDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{article.views.toLocaleString()}</span>
              </div>
            </div>

            {/* 封面图片 */}
            <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-4 mb-8">
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
                <span>{article.likes.toLocaleString()}</span>
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
                <span>{article.bookmarks.toLocaleString()}</span>
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

              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 text-gray-700 rounded-xl">
                <MessageCircle className="w-5 h-5" />
                <span>{article.comments}</span>
              </div>
            </div>
          </motion.header>

          {/* 文章内容 */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg mb-8"
          >
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                '--tw-prose-body': 'rgb(55 65 81)',
                '--tw-prose-headings': 'rgb(17 24 39)',
                '--tw-prose-links': 'rgb(59 130 246)',
                '--tw-prose-bold': 'rgb(17 24 39)',
                '--tw-prose-counters': 'rgb(107 114 128)',
                '--tw-prose-bullets': 'rgb(107 114 128)',
                '--tw-prose-hr': 'rgb(229 231 235)',
                '--tw-prose-quotes': 'rgb(17 24 39)',
                '--tw-prose-quote-borders': 'rgb(229 231 235)',
                '--tw-prose-captions': 'rgb(107 114 128)',
                '--tw-prose-code': 'rgb(17 24 39)',
                '--tw-prose-pre-code': 'rgb(229 231 235)',
                '--tw-prose-pre-bg': 'rgb(17 24 39)',
                '--tw-prose-th-borders': 'rgb(209 213 219)',
                '--tw-prose-td-borders': 'rgb(229 231 235)',
              } as React.CSSProperties}
            />
          </motion.article>

          {/* 标签 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">相关标签</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center space-x-1"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </motion.div>

          {/* 相关文章 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">相关文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/60 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to={`/article/${item.id}`}>
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryBadge(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                      <h3 className="font-semibold text-gray-800 mt-2 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{item.author}</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;