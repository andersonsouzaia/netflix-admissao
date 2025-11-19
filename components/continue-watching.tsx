'use client'

import { useState, useRef, useEffect } from 'react'
import { useContentProgress } from '@/hooks/use-content-progress'
import { Play, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export function ContinueWatching() {
  const { getContinueWatching } = useContentProgress()
  const continueWatching = getContinueWatching()
  
  const [showNavigation, setShowNavigation] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (continueWatching.length === 0) {
    return null
  }

  const getCourseData = (contentId: string) => ({
    id: contentId,
    title: 'JavaScript Moderno (ES6+)',
    thumbnail: '/business-execution-discipline.jpg',
    duration: 2700,
  })

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const maxScroll = container.scrollWidth - container.clientWidth
      
      setHasScrolled(scrollLeft > 10)
      setCanScrollRight(scrollLeft < maxScroll - 10)
    }

    handleScroll()

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = 300 // Scroll one card width + gap
      const newPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount
      container.scrollTo({ left: newPosition, behavior: 'smooth' })
    }
  }

  return (
    <div 
      className="group/row relative px-4 md:px-12 mb-8"
      onMouseEnter={() => setShowNavigation(true)}
      onMouseLeave={() => setShowNavigation(false)}
    >
      <h2 className="text-2xl font-bold text-foreground mb-4">Continuar Assistindo</h2>
      
      {showNavigation && hasScrolled && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] flex items-center justify-center h-12 w-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all duration-300 shadow-lg hover:scale-110 opacity-0 group-hover/row:opacity-100"
        >
          <ChevronLeft className="h-7 w-7 text-primary drop-shadow-lg" strokeWidth={3} />
        </button>
      )}

      {showNavigation && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] flex items-center justify-center h-12 w-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all duration-300 shadow-lg hover:scale-110 opacity-0 group-hover/row:opacity-100"
        >
          <ChevronRight className="h-7 w-7 text-primary drop-shadow-lg" strokeWidth={3} />
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {continueWatching.map((item) => {
          const course = getCourseData(item.contentId)
          const progressPercentage = ((item.lastPosition || 0) / course.duration) * 100

          return (
            <div
              key={item.contentId}
              className="flex-none w-[280px] group cursor-pointer"
            >
              <div className="relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/20">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                  <Progress value={progressPercentage} className="h-1 rounded-none" />
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.floor((course.duration - (item.lastPosition || 0)) / 60)} min restantes
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
