/**
 * 搜图页面
 * 允许用户上传图片进行反向图像搜索
 * 支持拖拽上传、文件选择、粘贴图片三种方式
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, Search, Image as ImageIcon, AlertCircle, Clipboard, X } from 'lucide-react'
import { cn } from '../../src/lib/utils'

/**
 * 搜索结果接口
 */
interface SearchResult {
  similarity: number
  thumbnail: string
  title?: string
  author?: string
  source?: string
  url?: string
}

/**
 * 搜图页面组件
 */
export default function SearchPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploadSource, setUploadSource] = useState<'file' | 'paste' | null>(null)

  // 粘贴区域引用
  const pasteAreaRef = useRef<HTMLDivElement>(null)

  /**
   * 验证并处理图片文件
   * @param file 文件对象
   * @param source 来源：file(文件选择/拖拽) 或 paste(粘贴)
   * @returns 是否处理成功
   */
  const processImageFile = useCallback((file: File, source: 'file' | 'paste'): boolean => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return false
    }

    // 验证文件大小 (最大15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('图片文件不能超过15MB')
      return false
    }

    setSelectedFile(file)
    setUploadSource(source)
    setError(null)

    // 创建预览URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return true
  }, [])

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 如果已有图片，不允许再上传
    if (selectedFile) return

    const file = event.target.files?.[0]
    if (file) {
      processImageFile(file, 'file')
    }
  }

  /**
   * 处理拖拽上传
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    // 如果已有图片，不允许再上传
    if (selectedFile) return

    const file = event.dataTransfer.files[0]
    if (file) {
      processImageFile(file, 'file')
    }
  }

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  /**
   * 处理粘贴事件
   */
  const handlePaste = useCallback((event: ClipboardEvent) => {
    // 如果已有图片，不允许再粘贴
    if (selectedFile) return

    const items = event.clipboardData?.items
    if (!items) return

    // 遍历剪贴板内容，查找图片
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          event.preventDefault()
          processImageFile(file, 'paste')
          break
        }
      }
    }
  }, [selectedFile, processImageFile])

  /**
   * 监听全局粘贴事件
   */
  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  /**
   * 执行搜索
   */
  const handleSearch = async () => {
    if (!selectedFile) {
      setError('请先选择或粘贴图片')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      // 调用搜索API
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/search-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('搜索失败，请稍后重试')
      }

      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败')
    } finally {
      setIsSearching(false)
    }
  }

  /**
   * 清除选择的文件
   */
  const clearFile = () => {
    setSelectedFile(null)
    setUploadSource(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setSearchResults([])
    setError(null)
  }

  /**
   * 判断是否已上传图片
   */
  const hasImage = selectedFile !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            以图搜图
          </h1>
          <p className="text-gray-600 text-lg">
            上传或粘贴图片，找到相似的作品和来源信息
          </p>
        </motion.div>

        {/* 上传区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-6"
        >
          {/* 已上传图片时显示预览 */}
          {hasImage ? (
            <div className="text-center">
              {/* 图片预览 */}
              {previewUrl && (
                <div className="relative inline-block mb-4">
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="max-w-md max-h-64 mx-auto rounded-lg shadow-lg object-contain"
                  />
                  {/* 删除按钮 */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={clearFile}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    title="删除图片"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              )}

              {/* 文件信息 */}
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{selectedFile?.name}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span>
                  {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-green-600">
                  {uploadSource === 'paste' ? '粘贴上传' : '文件上传'}
                </span>
              </div>
            </div>
          ) : (
            /* 未上传图片时显示左右两栏上传区域 */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 左侧：拖拽/选择文件区域 */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-400 hover:bg-green-50/50 transition-all cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    选择或拖拽图片
                  </h3>
                  <p className="text-gray-500 text-sm">
                    点击选择文件或将图片拖拽到此处
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    支持 JPG、PNG、GIF，最大 15MB
                  </p>
                </label>
              </div>

              {/* 右侧：粘贴图片区域 */}
              <div
                ref={pasteAreaRef}
                className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer"
                onClick={() => pasteAreaRef.current?.focus()}
                tabIndex={0}
              >
                <Clipboard className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  粘贴图片
                </h3>
                <p className="text-gray-500 text-sm">
                  使用 Ctrl+V (Mac: Cmd+V) 粘贴
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  支持从剪贴板直接粘贴图片
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* 搜索按钮区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <motion.button
            whileHover={{ scale: hasImage ? 1.05 : 1 }}
            whileTap={{ scale: hasImage ? 0.95 : 1 }}
            onClick={handleSearch}
            disabled={isSearching || !hasImage}
            className={cn(
              'flex items-center space-x-3 px-8 py-4 rounded-xl font-medium text-lg transition-all shadow-md',
              !hasImage
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isSearching
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl hover:from-green-600 hover:to-emerald-600'
            )}
          >
            <Search className="w-6 h-6" />
            <span>{isSearching ? '搜索中...' : '开始搜索'}</span>
          </motion.button>
        </motion.div>

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-8 border-l-4 border-red-500"
          >
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* 搜索结果 */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">搜索结果</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <img
                    src={result.thumbnail}
                    alt={result.title || '搜索结果'}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        相似度: {(result.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    {result.title && (
                      <h3 className="font-medium text-gray-800 truncate">
                        {result.title}
                      </h3>
                    )}
                    {result.author && (
                      <p className="text-sm text-gray-600">作者: {result.author}</p>
                    )}
                    {result.source && (
                      <p className="text-sm text-gray-500">来源: {result.source}</p>
                    )}
                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm text-green-600 hover:text-green-700 underline"
                      >
                        查看原图
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
