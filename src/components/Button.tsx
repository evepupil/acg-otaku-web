/**
 * 通用按钮组件
 * 提供多种样式、尺寸和状态的按钮
 */

'use client'

import { forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '../lib/utils'
import { ButtonLoading } from './Loading'

/**
 * 按钮组件属性接口
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体样式 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 是否为加载状态 */
  loading?: boolean
  /** 是否为全宽按钮 */
  fullWidth?: boolean
  /** 左侧图标 */
  leftIcon?: React.ReactNode
  /** 右侧图标 */
  rightIcon?: React.ReactNode
  /** 是否启用动画效果 */
  animated?: boolean
  /** 自定义动画属性 */
  motionProps?: MotionProps
}

/**
 * 按钮样式配置
 */
const buttonVariants = {
  primary: {
    base: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg',
      hover: 'hover:from-green-600 hover:to-emerald-700 hover:shadow-xl',
    active: 'active:scale-95',
    disabled: 'disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed'
  },
  secondary: {
    base: 'bg-white text-gray-700 border border-gray-300 shadow-sm',
    hover: 'hover:bg-gray-50 hover:border-gray-400 hover:shadow-md',
    active: 'active:scale-95',
    disabled: 'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'
  },
  outline: {
    base: 'border-2 border-green-500 text-green-500 bg-transparent',
      hover: 'hover:bg-green-500 hover:text-white hover:shadow-lg',
    active: 'active:scale-95',
    disabled: 'disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed'
  },
  ghost: {
    base: 'text-gray-600 bg-transparent',
    hover: 'hover:bg-gray-100 hover:text-gray-800',
    active: 'active:scale-95',
    disabled: 'disabled:text-gray-400 disabled:cursor-not-allowed'
  },
  danger: {
    base: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg',
    hover: 'hover:from-red-600 hover:to-red-700 hover:shadow-xl',
    active: 'active:scale-95',
    disabled: 'disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed'
  }
}

/**
 * 按钮尺寸配置
 */
const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded-md',
  md: 'px-4 py-2 text-sm font-medium rounded-lg',
  lg: 'px-6 py-3 text-base font-medium rounded-lg',
  xl: 'px-8 py-4 text-lg font-semibold rounded-xl'
}

/**
 * 按钮组件
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    animated = true,
    motionProps,
    className,
    children,
    disabled,
    ...props
  },
  ref
) => {
  const variantStyles = buttonVariants[variant]
  const sizeStyles = buttonSizes[size]
  
  const isDisabled = disabled || loading

  const buttonClasses = cn(
    // 基础样式
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    'transform-gpu will-change-transform',
    
    // 变体样式
    variantStyles.base,
    !isDisabled && variantStyles.hover,
    !isDisabled && variantStyles.active,
    isDisabled && variantStyles.disabled,
    
    // 尺寸样式
    sizeStyles,
    
    // 全宽样式
    fullWidth && 'w-full',
    
    // 自定义类名
    className
  )

  const buttonContent = (
    <>
      {loading && (
        <ButtonLoading size={size === 'sm' ? 'sm' : size === 'xl' ? 'lg' : 'md'} />
      )}
      {!loading && leftIcon && (
        <span className={cn('flex-shrink-0', children && 'mr-2')}>
          {leftIcon}
        </span>
      )}
      {children && (
        <span className={loading ? 'ml-2' : ''}>
          {children}
        </span>
      )}
      {!loading && rightIcon && (
        <span className={cn('flex-shrink-0', children && 'ml-2')}>
          {rightIcon}
        </span>
      )}
    </>
  )

  if (animated) {
    const { 
      // 移除未使用的事件处理器
      onDrag, onDragEnd, onDragStart, 
      onAnimationStart, onAnimationEnd, onAnimationIteration,
      onTransitionEnd, onTransitionStart,
      ...restProps 
    } = props
    // 忽略未使用的事件处理器
    void onDrag; void onDragEnd; void onDragStart;
    void onAnimationStart; void onAnimationEnd; void onAnimationIteration;
    void onTransitionEnd; void onTransitionStart;
    return (
      <motion.button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...motionProps}
        {...restProps}
      >
        {buttonContent}
      </motion.button>
    )
  }

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={isDisabled}
      {...props}
    >
      {buttonContent}
    </button>
  )
})

Button.displayName = 'Button'

export default Button

/**
 * 图标按钮组件
 */
export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'leftIcon' | 'rightIcon'> & {
  icon: React.ReactNode
  'aria-label': string
}>((
  {
    icon,
    size = 'md',
    variant = 'ghost',
    className,
    ...props
  },
  ref
) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'p-0 rounded-full',
        iconSizes[size],
        className
      )}
      {...props}
    >
      {icon}
    </Button>
  )
})

IconButton.displayName = 'IconButton'

/**
 * 浮动操作按钮组件
 */
export const FloatingActionButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant' | 'size'> & {
  icon: React.ReactNode
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}>((
  {
    icon,
    position = 'bottom-right',
    className,
    ...props
  },
  ref
) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  }

  return (
    <Button
      ref={ref}
      variant="primary"
      size="lg"
      className={cn(
        'w-14 h-14 rounded-full shadow-2xl z-50',
        'hover:shadow-3xl transform-gpu',
        positionClasses[position],
        className
      )}
      motionProps={{
        whileHover: { scale: 1.1, rotate: 5 },
        whileTap: { scale: 0.9 },
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      }}
      {...props}
    >
      {icon}
    </Button>
  )
})

FloatingActionButton.displayName = 'FloatingActionButton'

/**
 * 按钮组组件
 */
export function ButtonGroup({
  children,
  className,
  orientation = 'horizontal'
}: {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}) {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        '[&>button]:rounded-none',
        '[&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg',
        orientation === 'vertical' && '[&>button:first-child]:rounded-t-lg [&>button:first-child]:rounded-l-none [&>button:last-child]:rounded-b-lg [&>button:last-child]:rounded-r-none',
        '[&>button:not(:first-child)]:border-l-0',
        orientation === 'vertical' && '[&>button:not(:first-child)]:border-l [&>button:not(:first-child)]:border-t-0',
        className
      )}
    >
      {children}
    </div>
  )
}