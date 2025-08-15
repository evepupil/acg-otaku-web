/**
 * 加载组件
 * 提供多种样式的加载状态展示
 */

'use client'

import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

/**
 * 加载组件属性接口
 */
interface LoadingProps {
  /** 加载组件类型 */
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 自定义类名 */
  className?: string
  /** 加载文本 */
  text?: string
  /** 是否全屏显示 */
  fullScreen?: boolean
}

/**
 * 旋转加载器
 */
const SpinnerLoader = ({ size = 'md', className }: { size: string; className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn(
        'border-2 border-gray-200 border-t-pink-500 rounded-full',
        sizeClasses[size as keyof typeof sizeClasses],
        className
      )}
    />
  )
}

/**
 * 点状加载器
 */
const DotsLoader = ({ size = 'md', className }: { size: string; className?: string }) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  const dotVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: { scale: 1.2, opacity: 1 },
  }

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.2,
          }}
          className={cn(
            'bg-pink-500 rounded-full',
            sizeClasses[size as keyof typeof sizeClasses]
          )}
        />
      ))}
    </div>
  )
}

/**
 * 脉冲加载器
 */
const PulseLoader = ({ size = 'md', className }: { size: string; className?: string }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={cn(
        'bg-gradient-to-br from-pink-500 to-purple-600 rounded-full',
        sizeClasses[size as keyof typeof sizeClasses],
        className
      )}
    />
  )
}

/**
 * 骨架屏加载器
 */
const SkeletonLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* 标题骨架 */}
      <div className="space-y-2">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-4 bg-gray-200 rounded-md w-3/4"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-4 bg-gray-200 rounded-md w-1/2"
        />
      </div>
      
      {/* 内容骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((index) => (
          <motion.div
            key={index}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
            className="space-y-3"
          >
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/**
 * 主加载组件
 */
export default function Loading({
  variant = 'spinner',
  size = 'md',
  className,
  text,
  fullScreen = false
}: LoadingProps) {
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader size={size} />
      case 'pulse':
        return <PulseLoader size={size} />
      case 'skeleton':
        return <SkeletonLoader />
      default:
        return <SpinnerLoader size={size} />
    }
  }

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      fullScreen && 'min-h-screen',
      className
    )}>
      {variant !== 'skeleton' && (
        <>
          {renderLoader()}
          {text && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-600 font-medium"
            >
              {text}
            </motion.p>
          )}
        </>
      )}
      {variant === 'skeleton' && renderLoader()}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

/**
 * 页面加载组件
 */
export function PageLoading({ text = '加载中...' }: { text?: string }) {
  return (
    <Loading
      variant="pulse"
      size="lg"
      text={text}
      fullScreen
      className="bg-gradient-to-br from-pink-50 via-white to-purple-50"
    />
  )
}

/**
 * 内容加载组件
 */
export function ContentLoading({ text }: { text?: string }) {
  return (
    <Loading
      variant="spinner"
      size="md"
      text={text}
      className="py-12"
    />
  )
}

/**
 * 按钮加载组件
 */
export function ButtonLoading({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <Loading variant="spinner" size={size} />
}

/**
 * 卡片骨架加载组件
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-4 space-y-4"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
            className="h-48 bg-gray-200 rounded-lg"
          />
          <div className="space-y-2">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 + 0.2 }}
              className="h-4 bg-gray-200 rounded w-3/4"
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 + 0.4 }}
              className="h-3 bg-gray-200 rounded w-1/2"
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}