/**
 * React Hooks库
 * 提供常用的自定义Hook和状态管理
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { debounce, throttle } from '../lib/utils'

/**
 * 本地存储Hook
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @returns [value, setValue] 状态值和设置函数
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

/**
 * 防抖Hook
 * @param value - 要防抖的值
 * @param delay - 延迟时间
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 节流Hook
 * @param callback - 回调函数
 * @param delay - 延迟时间
 * @returns 节流后的函数
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  )

  return throttledCallback as T
}

/**
 * 窗口尺寸Hook
 * @returns 窗口尺寸对象
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

/**
 * 滚动位置Hook
 * @returns 滚动位置对象
 */
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    function handleScroll() {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollPosition
}

/**
 * 元素可见性Hook
 * @param ref - 元素引用
 * @param options - Intersection Observer选项
 * @returns 是否可见
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      options
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, options])

  return isIntersecting
}

/**
 * 点击外部Hook
 * @param ref - 元素引用
 * @param handler - 点击外部时的处理函数
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [ref, handler])
}

/**
 * 键盘事件Hook
 * @param key - 键名
 * @param handler - 处理函数
 * @param options - 选项
 */
export function useKeyPress(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options: {
    target?: React.RefObject<HTMLElement>
    preventDefault?: boolean
  } = {}
) {
  const { target, preventDefault = false } = options

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      if (event.key === key) {
        if (preventDefault) {
          event.preventDefault()
        }
        handler(event)
      }
    }

    const element = target?.current || document
    element.addEventListener('keydown', handleKeyPress as any)

    return () => {
      element.removeEventListener('keydown', handleKeyPress as any)
    }
  }, [key, handler, target, preventDefault])
}

/**
 * 异步状态Hook
 * @param asyncFunction - 异步函数
 * @param immediate - 是否立即执行
 * @returns 异步状态对象
 */
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle'
  )
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    setData(null)
    setError(null)

    try {
      const response = await asyncFunction()
      setData(response)
      setStatus('success')
      return response
    } catch (error) {
      setError(error as E)
      setStatus('error')
      throw error
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return {
    execute,
    status,
    data,
    error,
    isLoading: status === 'pending',
    isError: status === 'error',
    isSuccess: status === 'success',
    isIdle: status === 'idle',
  }
}

/**
 * 复制到剪贴板Hook
 * @returns 复制函数和状态
 */
export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      return true
    } catch (error) {
      console.error('Failed to copy text: ', error)
      setIsCopied(false)
      return false
    }
  }, [])

  return { copyToClipboard, isCopied }
}

/**
 * 媒体查询Hook
 * @param query - 媒体查询字符串
 * @returns 是否匹配
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * 响应式断点Hook
 * @returns 当前断点信息
 */
export function useBreakpoint() {
  const isSm = useMediaQuery('(min-width: 640px)')
  const isMd = useMediaQuery('(min-width: 768px)')
  const isLg = useMediaQuery('(min-width: 1024px)')
  const isXl = useMediaQuery('(min-width: 1280px)')
  const is2Xl = useMediaQuery('(min-width: 1536px)')

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isBase: !isSm,
    current: is2Xl ? '2xl' : isXl ? 'xl' : isLg ? 'lg' : isMd ? 'md' : isSm ? 'sm' : 'base'
  }
}

/**
 * 图片懒加载Hook
 * @param src - 图片源
 * @param options - 选项
 * @returns 图片状态
 */
export function useLazyImage(
  src: string,
  options: {
    placeholder?: string
    threshold?: number
  } = {}
) {
  const [imageSrc, setImageSrc] = useState(options.placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const isInView = useIntersectionObserver(imgRef, {
    threshold: options.threshold || 0.1,
  })

  useEffect(() => {
    if (isInView && src && !isLoaded && !isError) {
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
      }
      img.onerror = () => {
        setIsError(true)
      }
      img.src = src
    }
  }, [isInView, src, isLoaded, isError])

  return {
    ref: imgRef,
    src: imageSrc,
    isLoaded,
    isError,
    isLoading: isInView && !isLoaded && !isError,
  }
}

/**
 * 无限滚动Hook
 * @param fetchMore - 获取更多数据的函数
 * @param hasMore - 是否还有更多数据
 * @param threshold - 触发阈值
 * @returns 加载状态和引用
 */
export function useInfiniteScroll(
  fetchMore: () => Promise<void>,
  hasMore: boolean,
  threshold = 0.8
) {
  const [isFetching, setIsFetching] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const isInView = useIntersectionObserver(loadMoreRef, {
    threshold,
  })

  useEffect(() => {
    if (isInView && hasMore && !isFetching) {
      setIsFetching(true)
      fetchMore().finally(() => {
        setIsFetching(false)
      })
    }
  }, [isInView, hasMore, isFetching, fetchMore])

  return {
    ref: loadMoreRef,
    isFetching,
  }
}