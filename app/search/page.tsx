/**
 * 搜图页面
 * 允许用户上传图片进行反向图像搜索
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Search, Image as ImageIcon, AlertCircle } from 'lucide-react'
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

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件')
        return
      }

      // 验证文件大小 (最大10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('图片文件不能超过10MB')
        return
      }

      setSelectedFile(file)
      setError(null)

      // 创建预览URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  /**
   * 处理拖拽上传
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(fakeEvent)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  /**
   * 执行搜索
   */
  const handleSearch = async () => {
    if (!selectedFile) {
      setError('请先选择图片')
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setSearchResults([])
    setError(null)
  }

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
            上传图片，找到相似的作品和来源信息
          </p>
        </motion.div>

        {/* 上传区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 mb-8"
        >
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-green-300 rounded-xl p-12 text-center hover:border-green-400 transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  选择或拖拽图片到此处
                </h3>
                <p className="text-gray-500">
                  支持 JPG、PNG、GIF 格式，最大 10MB
                </p>
              </label>
            </div>
          ) : (
            <div className="text-center">
              {/* 图片预览 */}
              {previewUrl && (
                <div className="mb-6">
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="max-w-md max-h-64 mx-auto rounded-lg shadow-lg object-contain"
                  />
                </div>
              )}
              
              {/* 文件信息 */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <ImageIcon className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 font-medium">{selectedFile.name}</span>
                <span className="text-gray-500 text-sm">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  disabled={isSearching}
                  className={cn(
                    'flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all',
                    isSearching
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                  )}
                >
                  <Search className="w-5 h-5" />
                  <span>{isSearching ? '搜索中...' : '开始搜索'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFile}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  重新选择
                </motion.button>
              </div>
            </div>
          )}
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