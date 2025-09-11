'use client';

import { motion } from 'framer-motion';
import Navigation from '../src/components/Navigation';
import ImageCarousel from '../src/components/ImageCarousel';
import FeaturedPreview from '../src/components/FeaturedPreview';
import Footer from '../src/components/Footer';
import { getFeaturedArtworks } from '../src/data/mockData';
import { transformMockArtworksToType } from '../src/utils/dataTransform';

/**
 * 首页组件
 * 展示网站主要内容和导航入口
 * @returns JSX元素
 */
export default function HomePage() {
  // 获取精选插画数据用于轮播
  const mockFeaturedArtworks = getFeaturedArtworks();
  const featuredArtworks = transformMockArtworksToType(mockFeaturedArtworks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-green-50">
      {/* 导航栏 - 绝对定位覆盖在轮播图上 */}
      <div className="relative z-50">
        <Navigation />
      </div>
      
      {/* 主要内容区域 */}
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
          
          {/* 向下滚动提示 */}
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
        
        {/* 精选内容预览 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="py-20 relative z-10"
        >
          <FeaturedPreview />
        </motion.section>
      </main>
      
      <Footer />
    </div>
  );
}