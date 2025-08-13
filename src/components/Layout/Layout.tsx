import React from 'react';
import { motion } from 'framer-motion';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 主布局组件
 * 包含顶部导航和页面内容区域
 */
const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50">
      <Header />
      
      {/* 主内容区域 */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`pt-16 ${className}`}
      >
        {children}
      </motion.main>
      
      {/* 背景装饰元素 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Layout;