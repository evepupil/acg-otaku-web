/**
 * 首页英雄区域组件
 * 展示网站主要功能介绍和视觉效果
 */

'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Star, TrendingUp, Heart, Search } from 'lucide-react'
import Button from './Button'
import { cn } from '../lib/utils'

/**
 * 英雄区域组件属性接口
 */
interface HeroSectionProps {
  /** 自定义类名 */
  className?: string
}

/**
 * 特色功能数据
 */
const features = [
  {
    icon: TrendingUp,
    title: '实时排行榜',
    description: '每日更新的热门萌图排行',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Heart,
    title: '个性推荐',
    description: '基于喜好的智能推荐',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    icon: Star,
    title: '精品鉴赏',
    description: '深度解析二次元优秀作品',
    color: 'from-blue-500 to-cyan-500'
  }
]

/**
 * 浮动装饰元素
 */
const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 背景渐变球 */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full blur-xl"
      />
      
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
        className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-xl"
      />
      
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-full blur-lg"
      />
    </div>
  )
}

/**
 * 特色功能卡片
 */
const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  const Icon = feature.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-card p-6 text-center group cursor-pointer"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={cn(
          'w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br flex items-center justify-center',
          feature.color
        )}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
        {feature.title}
      </h3>
      
      <p className="text-gray-600 text-sm leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  )
}

/**
 * 主英雄区域组件
 */
export default function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={cn(
      'relative min-h-screen flex items-center justify-center overflow-hidden',
      'bg-gradient-to-br from-pink-50 via-white to-purple-50',
      className
    )}>
      {/* 浮动装饰元素 */}
      <FloatingElements />
      
      {/* 主要内容 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          {/* 主标题 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                ACG萌图宅
              </span>
              <br />
              <span className="text-gray-800">
                二次元世界
              </span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              探索精美二次元插画作品，感受萌系艺术的魅力。
              <br className="hidden md:block" />
              每日更新热门排行，个性化推荐，发现你的专属萌图。
            </motion.p>
          </motion.div>
          
          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            <Button
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="text-lg px-8 py-4"
              motionProps={{
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 }
              }}
            >
              开始探索
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              leftIcon={<Search className="w-5 h-5" />}
              className="text-lg px-8 py-4"
            >
              搜索作品
            </Button>
          </motion.div>
        </div>
        
        {/* 特色功能展示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
        
        {/* 统计数据 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: '精选作品', value: '10,000+' },
                { label: '活跃画师', value: '2,500+' },
                { label: '每日更新', value: '500+' },
                { label: '用户喜爱', value: '98%' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* 底部渐变 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 to-transparent pointer-events-none" />
    </section>
  )
}