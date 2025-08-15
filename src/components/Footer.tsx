/**
 * 页脚组件
 * 提供网站信息、链接和版权声明
 */

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Github, Twitter, Mail, ExternalLink } from 'lucide-react'
import { cn } from '../lib/utils'

/**
 * 页脚链接接口
 */
interface FooterLink {
  href: string
  label: string
  external?: boolean
}

/**
 * 页脚链接组配置
 */
const footerSections = [
  {
    title: '浏览',
    links: [
      { href: '/', label: '首页' },
      { href: '/rankings', label: '排行榜' },
      { href: '/recommendations', label: '推荐' },
      { href: '/articles', label: '鉴赏' },
    ] as FooterLink[]
  },
  {
    title: '关于',
    links: [
      { href: '/about', label: '关于我们' },
      { href: '/contact', label: '联系我们' },
      { href: '/privacy', label: '隐私政策' },
      { href: '/terms', label: '使用条款' },
    ] as FooterLink[]
  },
  {
    title: '社区',
    links: [
      { href: 'https://github.com', label: 'GitHub', external: true },
      { href: 'https://twitter.com', label: 'Twitter', external: true },
      { href: 'mailto:contact@example.com', label: '邮箱联系', external: true },
    ] as FooterLink[]
  }
]

/**
 * 社交媒体链接配置
 */
const socialLinks = [
  {
    href: 'https://github.com',
    icon: Github,
    label: 'GitHub',
    color: 'hover:text-gray-900'
  },
  {
    href: 'https://twitter.com',
    icon: Twitter,
    label: 'Twitter',
    color: 'hover:text-blue-500'
  },
  {
    href: 'mailto:contact@example.com',
    icon: Mail,
    label: 'Email',
    color: 'hover:text-red-500'
  }
]

/**
 * 页脚组件
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-20 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200/50">
      {/* 装饰性背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-purple-50/30" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 主要内容区域 */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* 品牌信息 */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 group mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Pixiv Gallery
                  </span>
                </Link>
                
                {/* 描述 */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  发现最美的插画作品，探索艺术的无限可能。
                  专注于为您提供高质量的插画鉴赏体验。
                </p>
                
                {/* 社交媒体链接 */}
                <div className="flex items-center space-x-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                          'p-2 rounded-lg bg-white/50 text-gray-500 transition-all duration-200',
                          'hover:bg-white hover:shadow-md',
                          social.color
                        )}
                        aria-label={social.label}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.a>
                    )
                  })}
                </div>
              </motion.div>
            </div>
            
            {/* 链接组 */}
            {footerSections.map((section, sectionIndex) => (
              <div key={section.title} className="">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (sectionIndex + 1) * 0.1 }}
                >
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.4, 
                          delay: (sectionIndex + 1) * 0.1 + linkIndex * 0.05 
                        }}
                      >
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-200"
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-200"
                          >
                            {link.label}
                          </Link>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 分割线 */}
        <div className="border-t border-gray-200/50" />
        
        {/* 版权信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="py-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0"
        >
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>&copy; {currentYear} Pixiv Gallery. 保留所有权利。</span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span>用</span>
            <Heart className="w-4 h-4 text-red-500 mx-1" />
            <span>制作</span>
          </div>
        </motion.div>
      </div>
      
      {/* 装饰性元素 */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent via-pink-200 to-transparent" />
    </footer>
  )
}