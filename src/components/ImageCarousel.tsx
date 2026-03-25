'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { getImageUrl, preloadImage } from '@/lib/pixiv-proxy'
import type { Artwork } from '@/types'

interface ImageCarouselProps {
  images: Artwork[]
  autoPlayInterval?: number
  showControls?: boolean
  showIndicators?: boolean
  height?: string
}

export default function ImageCarousel({
  images,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  height = '100vh',
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const slides = useMemo(
    () =>
      images.map((image) => ({
        ...image,
        src: image.id
          ? getImageUrl(image.id.toString(), 'regular', image.imagePath)
          : image.imageUrl,
      })),
    [images]
  )

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (slides.length === 0) return 0
      return prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    })
  }, [slides.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (slides.length === 0) return 0
      return prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    })
  }, [slides.length])

  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0)
    }
  }, [currentIndex, slides.length])

  useEffect(() => {
    if (slides.length <= 1 || !isPlaying || isHovered) {
      return
    }

    const timer = window.setInterval(() => {
      goToNext()
    }, autoPlayInterval)

    return () => window.clearInterval(timer)
  }, [autoPlayInterval, goToNext, isHovered, isPlaying, slides.length])

  useEffect(() => {
    if (slides.length <= 1) {
      return
    }

    const nextIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1
    void preloadImage(slides[nextIndex].src)
  }, [currentIndex, slides])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious()
      }

      if (event.key === 'ArrowRight') {
        goToNext()
      }

      if (event.key === ' ') {
        event.preventDefault()
        setIsPlaying((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  if (slides.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_42%),linear-gradient(180deg,#0f172a_0%,#111827_100%)]"
        style={{ height }}
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-center text-white/70 backdrop-blur">
          暂无精选作品
        </div>
      </div>
    )
  }

  const currentSlide = slides[currentIndex]

  return (
    <div
      className="relative isolate overflow-hidden bg-slate-950"
      style={{ height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => {
        const isActive = index === currentIndex

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <Image
              src={slide.src}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.24)_0%,rgba(2,6,23,0.42)_44%,rgba(2,6,23,0.88)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_28%,rgba(2,6,23,0.16)_72%)]" />
          </div>
        )
      })}

      <button
        type="button"
        onClick={() => router.push(`/artwork/${currentSlide.id}`)}
        className="absolute inset-0 z-10"
        aria-label={`查看作品 ${currentSlide.title}`}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/80 backdrop-blur">
            Latest Pick
          </div>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white drop-shadow-[0_8px_24px_rgba(15,23,42,0.35)] md:text-6xl">
            {currentSlide.title}
          </h2>
          <p className="mt-4 text-base text-white/72 md:text-lg">
            by {typeof currentSlide.artist === 'object' ? currentSlide.artist.name : currentSlide.artist}
          </p>
        </div>
      </div>

      {showControls && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-3 text-white/85 backdrop-blur transition hover:bg-black/35 hover:text-white"
            aria-label="上一张图片"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-3 text-white/85 backdrop-blur transition hover:bg-black/35 hover:text-white"
            aria-label="下一张图片"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {showControls && slides.length > 1 && (
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          className="absolute bottom-8 left-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-sm text-white/85 backdrop-blur transition hover:bg-black/35 hover:text-white"
          aria-label={isPlaying ? '暂停轮播' : '开始轮播'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span>{isPlaying ? '暂停' : '播放'}</span>
        </button>
      )}

      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-8 right-4 z-20 flex items-center gap-2">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex

            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive ? 'w-10 bg-white' : 'w-2 bg-white/45 hover:bg-white/75'
                }`}
                aria-label={`切换到第 ${index + 1} 张图片`}
              />
            )
          })}
        </div>
      )}

      {isPlaying && !isHovered && slides.length > 1 && (
        <div className="absolute bottom-0 left-0 z-20 h-1 w-full bg-white/10">
          <div
            key={currentSlide.id}
            className="h-full origin-left bg-white/70 animate-[growX_var(--carousel-duration)_linear_forwards]"
            style={{ ['--carousel-duration' as string]: `${autoPlayInterval}ms` }}
          />
        </div>
      )}
    </div>
  )
}
