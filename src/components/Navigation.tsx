/**
 * 导航栏组件
 * 实现毛玻璃效果的现代化导航栏，支持响应式设计
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, TrendingUp, Heart, BookOpen } from 'lucide-react'
import { cn } from '../lib/utils'
import { useBreakpoint, useScrollPosition } from '../hooks'

/**
 * 导航菜单项接口
 */
interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

/**
 * 导航菜单配置
 */
const navItems: NavItem[] = [
  { href: '/', label: '首页', icon: Home },
  { href: '/rankings', label: '排行榜', icon: TrendingUp },
  { href: '/recommendations', label: '推荐', icon: Heart },
  { href: '/articles', label: '鉴赏', icon: BookOpen },
]

/**
 * 导航栏组件
 */
export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const pathname = usePathname()
  const { isMd } = useBreakpoint()
  const { y: scrollY } = useScrollPosition()

  // 根据滚动位置调整导航栏样式
  const isScrolled = scrollY > 20

  // 关闭移动端菜单
  const closeMenu = () => setIsMenuOpen(false)



  // 响应式处理：桌面端自动关闭移动菜单
  useEffect(() => {
    if (isMd) {
      setIsMenuOpen(false)
    }
  }, [isMd])

  // 路由变化时关闭移动菜单
  useEffect(() => {
    closeMenu()
  }, [pathname])

  return (
    <>
      {/* 主导航栏 */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'glass-nav backdrop-blur-xl bg-white/80 shadow-lg'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-sm">P</span>
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Pixiv Gallery
              </span>
            </Link>

            {/* 桌面端导航菜单 */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 shadow-sm'
                          : 'text-gray-600 hover:text-green-600 hover:bg-green-50/50'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                )
              })}
            </div>

            {/* 移动端菜单按钮 */}
            <div className="flex items-center">
              {/* 移动端菜单按钮 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50/50 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />

            {/* 菜单内容 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] glass-card z-50 md:hidden"
            >
              <div className="p-6">
                {/* 移动端导航菜单 */}
                <nav className="space-y-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link href={item.href} onClick={closeMenu}>
                          <div
                            className={cn(
                              'flex items-center space-x-3 p-4 rounded-xl transition-all duration-200',
                              isActive
                                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 shadow-sm'
                              : 'text-gray-600 hover:text-green-600 hover:bg-green-50/50'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium text-lg">{item.label}</span>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 导航栏占位符，防止内容被遮挡 */}
      <div className="h-16" />
    </>
  )
}