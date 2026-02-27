'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navigation from '../src/components/Navigation';
import ImageCarousel from '../src/components/ImageCarousel';
import Footer from '../src/components/Footer';
import { TrendingUp, CalendarDays, Palette, Hash } from 'lucide-react';

/**
 * 首页组件
 * 展示网站主要内容和导航入口
 */
export default function HomePage() {
  const [featuredArtworks, setFeaturedArtworks] = useState([]);

  useEffect(() => {
    const fetchFeaturedArtworks = async () => {
      try {
        // 从每日精选API获取数据
        const response = await fetch('/api/daily-picks?page=1&limit=1');
        if (!response.ok) throw new Error('获取精选作品失败');
        const data = await response.json();

        if (data.success && data.data?.picks?.length > 0) {
          const latestPick = data.data.picks[0];
          setFeaturedArtworks(latestPick.artworks?.slice(0, 5) || []);
        }
      } catch (error) {
        console.error('获取精选作品失败:', error);
      }
    };

    fetchFeaturedArtworks();
  }, []);

  const sections = [
    {
      title: '每日排行精选',
      description: '从Pixiv排行榜精心挑选的优质作品',
      href: '/rankings',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-green-600',
      bgLight: 'bg-emerald-50',
    },
    {
      title: '每日美图',
      description: '每天精选的ACG插画佳作',
      href: '/daily',
      icon: CalendarDays,
      gradient: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: '画师鉴赏',
      description: '深入了解优秀画师的艺术世界',
      href: '/artists',
      icon: Palette,
      gradient: 'from-purple-500 to-violet-600',
      bgLight: 'bg-purple-50',
    },
    {
      title: '话题鉴赏',
      description: '围绕主题探索精选作品集',
      href: '/topics',
      icon: Hash,
      gradient: 'from-orange-500 to-amber-600',
      bgLight: 'bg-orange-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-green-50">
      <div className="relative z-50">
        <Navigation />
      </div>

      <main>
        {/* 全屏插画轮播 */}
        <section className="relative">
          <ImageCarousel
            images={featuredArtworks}
            autoPlayInterval={6000}
            showControls={true}
            showIndicators={true}
            height="100vh"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center text-white/80"
            >
              <span className="text-sm mb-2">向下滚动探索更多</span>
              <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-1 h-3 bg-white/60 rounded-full mt-2"
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 板块入口 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="py-20 relative z-10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">探索 ACG 艺术世界</h2>
              <p className="text-gray-500 mt-2">精心策划的内容等你发现</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.href}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Link href={section.href}
                      className={`block group p-8 ${section.bgLight} rounded-2xl hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100`}>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${section.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{section.description}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
