import React from 'react';
import { motion } from 'framer-motion';
import { Home, TrendingUp, Heart, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

/**
 * 顶部导航栏组件
 * 实现毛玻璃效果和半透明设计
 */
const Header: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/rankings', label: '排行榜', icon: TrendingUp },
    { path: '/recommendations', label: '推荐', icon: Heart },
    { path: '/articles', label: '鉴赏', icon: BookOpen },
  ];

  /**
   * 检查当前路径是否激活
   */
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2"
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Pixiv Gallery
              </span>
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`
                      relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2
                      ${active 
                        ? 'bg-white/30 text-purple-600 shadow-md' 
                        : 'text-gray-700 hover:bg-white/20 hover:text-purple-500'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-500/20 rounded-lg"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 rounded-lg bg-white/20 backdrop-blur-sm"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
              <div className="w-4 h-0.5 bg-gray-700 rounded"></div>
              <div className="w-4 h-0.5 bg-gray-700 rounded"></div>
              <div className="w-4 h-0.5 bg-gray-700 rounded"></div>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;