'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Clipboard,
  Image as ImageIcon,
  Search,
  Upload,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface SearchResult {
  similarity: number
  thumbnail: string
  title?: string
  author?: string
  source?: string
  url?: string
}

function getProxyThumbnailUrl(src: string) {
  return `/api/image-proxy?src=${encodeURIComponent(src)}`
}

export default function SearchPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploadSource, setUploadSource] = useState<'file' | 'paste' | null>(null)

  const pasteAreaRef = useRef<HTMLDivElement>(null)

  const clearPreviewUrl = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const processImageFile = useCallback(
    (file: File, source: 'file' | 'paste') => {
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件')
        return false
      }

      if (file.size > 15 * 1024 * 1024) {
        setError('图片文件不能超过 15MB')
        return false
      }

      clearPreviewUrl()
      const nextPreviewUrl = URL.createObjectURL(file)

      setSelectedFile(file)
      setPreviewUrl(nextPreviewUrl)
      setUploadSource(source)
      setSearchResults([])
      setError(null)

      return true
    },
    [clearPreviewUrl]
  )

  useEffect(() => {
    return () => {
      clearPreviewUrl()
    }
  }, [clearPreviewUrl])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processImageFile(file, 'file')
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      processImageFile(file, 'file')
    }
  }

  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) {
        return
      }

      for (let index = 0; index < items.length; index += 1) {
        const item = items[index]
        if (!item.type.startsWith('image/')) {
          continue
        }

        const file = item.getAsFile()
        if (!file) {
          continue
        }

        event.preventDefault()
        processImageFile(file, 'paste')
        break
      }
    },
    [processImageFile]
  )

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  const handleSearch = async () => {
    if (!selectedFile) {
      setError('请先选择或粘贴图片')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
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
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : '搜索失败')
    } finally {
      setIsSearching(false)
    }
  }

  const clearFile = () => {
    clearPreviewUrl()
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadSource(null)
    setSearchResults([])
    setError(null)
  }

  const hasImage = selectedFile !== null

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_30%),linear-gradient(180deg,#fafffb_0%,#f3fbf6_100%)]">
      <div className="mx-auto max-w-5xl px-4 py-8 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] border border-emerald-100/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">
            Reverse Search
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            以图搜图
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            上传一张图片，查找相近作品、作者信息和来源链接。
          </p>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {hasImage ? (
            <div className="text-center">
              {previewUrl && (
                <div className="relative inline-flex max-w-full rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
                  <Image
                    src={previewUrl}
                    alt="预览图片"
                    width={960}
                    height={960}
                    unoptimized
                    className="max-h-80 w-auto rounded-xl object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute -right-3 -top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
                    title="删除图片"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                  <ImageIcon className="h-4 w-4 text-emerald-600" />
                  {selectedFile?.name}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                  {uploadSource === 'paste' ? '剪贴板粘贴' : '文件上传'}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
                className="rounded-[1.5rem] border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/70"
              >
                <input
                  id="search-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="search-file-upload" className="block cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-emerald-500" />
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">选择或拖拽图片</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    点击选择文件，或者把图片直接拖进这个区域。
                  </p>
                  <p className="mt-2 text-xs text-slate-400">支持 JPG、PNG、GIF，最大 15MB</p>
                </label>
              </div>

              <div
                ref={pasteAreaRef}
                className="rounded-[1.5rem] border-2 border-dashed border-teal-300 bg-teal-50/40 p-8 text-center transition hover:border-teal-400 hover:bg-teal-50/70"
                onClick={() => pasteAreaRef.current?.focus()}
                tabIndex={0}
              >
                <Clipboard className="mx-auto h-12 w-12 text-teal-500" />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">粘贴图片</h2>
                <p className="mt-2 text-sm text-slate-500">
                  使用 `Ctrl+V` 或 `Cmd+V`，直接把剪贴板里的图片贴进来。
                </p>
                <p className="mt-2 text-xs text-slate-400">上传图片即可搜索相近结果。</p>
              </div>
            </div>
          )}
        </section>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching || !hasImage}
            className={cn(
              'inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-medium transition',
              hasImage && !isSearching
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700'
                : 'cursor-not-allowed bg-slate-200 text-slate-400'
            )}
          >
            <Search className="h-5 w-5" />
            <span>{isSearching ? '搜索中...' : '开始搜索'}</span>
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">搜索结果</h2>
              <span className="text-sm text-slate-500">{searchResults.length} 条匹配结果</span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.url || result.title || 'search'}-${index}`}
                  className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
                    <Image
                      src={getProxyThumbnailUrl(result.thumbnail)}
                      alt={result.title || '搜索结果'}
                      fill
                      unoptimized
                      sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                      相似度 {(result.similarity * 100).toFixed(1)}%
                    </div>

                    {result.title && (
                      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                        {result.title}
                      </h3>
                    )}

                    <div className="space-y-1 text-sm text-slate-500">
                      {result.author && <p>作者：{result.author}</p>}
                      {result.source && <p>来源：{result.source}</p>}
                    </div>

                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        查看原图
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
