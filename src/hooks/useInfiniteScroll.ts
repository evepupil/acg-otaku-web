/**
 * 无限滚动Hook
 * 监听滚动事件，在接近页面底部时触发加载更多数据
 */

import { useEffect, useCallback } from 'react'

/**
 * 无限滚动Hook
 * @param loadMore 加载更多数据的函数
 * @param hasMore 是否还有更多数据
 * @param threshold 触发加载的距离阈值（像素）
 */
export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  hasMore: boolean,
  threshold: number = 200
) {
  const handleScroll = useCallback(async () => {
    // 检查是否接近页面底部
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight
    
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold
    
    if (isNearBottom && hasMore) {
      await loadMore()
    }
  }, [loadMore, hasMore, threshold])

  useEffect(() => {
    // 添加滚动事件监听器
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])
}

export default useInfiniteScroll