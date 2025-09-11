'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Artwork } from '../types';

interface ImageCarouselProps {
  /** 轮播图片数据 */
  images: Artwork[];
  /** 自动播放间隔时间（毫秒） */
  autoPlayInterval?: number;
  /** 是否显示控制按钮 */
  showControls?: boolean;
  /** 是否显示指示器 */
  showIndicators?: boolean;
  /** 轮播高度 */
  height?: string;
}

/**
 * 全屏插画轮播组件
 * 支持自动播放、手动切换、暂停/播放控制
 * @param props 组件属性
 * @returns JSX元素
 */
export default function ImageCarousel({
  images,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  height = '100vh'
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  /**
   * 处理图片点击事件，跳转到作品详情页面
   */
  const handleImageClick = () => {
    const currentImage = images[currentIndex];
    router.push(`/artwork/${currentImage.id}`);
  };

  /**
   * 切换到下一张图片
   */
  const nextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  /**
   * 切换到上一张图片
   */
  const prevImage = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  /**
   * 跳转到指定图片
   * @param index 目标图片索引
   */
  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  /**
   * 切换播放状态
   */
  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // 自动播放逻辑
  useEffect(() => {
    if (!isPlaying || isHovered) return;

    const interval = setInterval(nextImage, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPlaying, isHovered, nextImage, autoPlayInterval]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case ' ':
          event.preventDefault();
          togglePlayPause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextImage, prevImage, togglePlayPause]);

  if (!images || images.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100"
        style={{ height }}
      >
        <p className="text-gray-500 text-lg">暂无图片</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div 
      className="relative overflow-hidden group"
      style={{ height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 背景图片容器 */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={currentImage.image_url}
              alt={currentImage.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* 毛玻璃遮罩 */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 内容信息覆盖层 */}
      <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={handleImageClick}>
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center text-white px-6 max-w-4xl"
        >
          <motion.h1 
            key={`title-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-2xl"
          >
            {currentImage.title}
          </motion.h1>
          <motion.p 
            key={`artist-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-xl md:text-2xl mb-6 drop-shadow-lg"
          >
            by {currentImage.artist_name}
          </motion.p>
          <motion.p 
            key={`desc-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-lg md:text-xl opacity-90 drop-shadow-lg max-w-2xl mx-auto"
          >
            {currentImage.description}
          </motion.p>
        </motion.div>
      </div>

      {/* 左右切换按钮 */}
      {showControls && (
        <>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isHovered ? 1 : 0.7, x: 0 }}
            whileHover={{ scale: 1.1, opacity: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
            aria-label="上一张图片"
          >
            <ChevronLeft size={24} />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isHovered ? 1 : 0.7, x: 0 }}
            whileHover={{ scale: 1.1, opacity: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
            aria-label="下一张图片"
          >
            <ChevronRight size={24} />
          </motion.button>
        </>
      )}

      {/* 播放/暂停按钮 */}
      {showControls && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0.7, y: 0 }}
          whileHover={{ scale: 1.1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlayPause}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
          aria-label={isPlaying ? '暂停播放' : '开始播放'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </motion.button>
      )}

      {/* 指示器 */}
      {showIndicators && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3"
        >
          {images.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => goToImage(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`切换到第${index + 1}张图片`}
            />
          ))}
        </motion.div>
      )}

      {/* 进度条 */}
      {isPlaying && !isHovered && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 bg-white/60 origin-left"
          key={`progress-${currentIndex}`}
        />
      )}
    </div>
  );
}