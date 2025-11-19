'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play, Plus, ThumbsUp, ChevronDown, Video, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useContentProgress } from '@/hooks/use-content-progress'

interface ContentItem {
  id: number
  title: string
  image: string
  badge: string
  duration: string
  episodes?: number
  rating?: string
  genres?: string[]
  year?: number
}

interface ContentRowProps {
  title: string
  content: ContentItem[]
  onItemClick?: (id: number) => void
}

export function ContentRow({ title, content, onItemClick }: ContentRowProps) {
  const [isHovering, setIsHovering] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [showNavigation, setShowNavigation] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { getProgress, isCompleted } = useContentProgress()

  const itemsPerPage = 5
  const totalPages = Math.ceil(content.length / itemsPerPage)

  const scrollToPage = (page: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const itemWidth = 280 + 12 // card width + gap
      const scrollPosition = page * itemWidth * itemsPerPage
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' })
      setCurrentPage(page)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    const newPage = direction === 'left' 
      ? Math.max(0, currentPage - 1)
      : Math.min(totalPages - 1, currentPage + 1)
    scrollToPage(newPage)
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const maxScroll = container.scrollWidth - container.clientWidth
      
      setHasScrolled(scrollLeft > 10)
      
      setCanScrollRight(scrollLeft < maxScroll - 10)
      
      const itemWidth = 280 + 12
      const page = Math.round(scrollLeft / (itemWidth * itemsPerPage))
      setCurrentPage(page)
    }

    handleScroll()

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [itemsPerPage])

  return (
    <div 
      className="group/row relative px-4 md:px-12 mb-16"
      onMouseEnter={() => setShowNavigation(true)}
      onMouseLeave={() => setShowNavigation(false)}
    >
      <h2 className="text-2xl font-bold text-foreground mb-4 px-4 md:px-0">{title}</h2>
      
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

      {/* Content Cards */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-16 pt-8 px-4 -mx-4 hide-scrollbar"
        style={{ scrollbarWidth: 'none', overflowY: 'visible' }}
      >
        {content.map((item, index) => {
          const progress = getProgress('video', item.id.toString())
          const completed = isCompleted('video', item.id.toString())
          const progressPercentage = progress?.progress || 0
          const isExpanded = isHovering === item.id
          
          const isFirstInView = index === currentPage * itemsPerPage
          const isLastInView = index === (currentPage + 1) * itemsPerPage - 1 || index === content.length - 1

          return (
            <div
              key={item.id}
              className={cn(
                "flex-none w-[280px] group/card cursor-pointer transition-all duration-300",
                isExpanded ? "z-50" : "z-0"
              )}
              onMouseEnter={() => setIsHovering(item.id)}
              onMouseLeave={() => setIsHovering(null)}
            >
              <div 
                className={cn(
                  "relative transition-all duration-300 ease-out rounded-lg",
                  isExpanded && "transform scale-125 shadow-2xl"
                )}
                style={{ 
                  transformOrigin: isFirstInView ? 'left center' : 
                                   isLastInView ? 'right center' : 
                                   'center center' 
                }}
                onClick={() => onItemClick?.(item.id)}
              >
                <div className="relative rounded-lg overflow-hidden">
                  {/* Thumbnail */}
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full aspect-[7/10] object-cover"
                  />

                  {progressPercentage > 0 && !completed && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  )}

                  {completed && !isExpanded && (
                    <div className="absolute top-3 right-3 bg-primary rounded-full p-1">
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}

                  {/* Badge */}
                  {!isExpanded && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-foreground">
                      <Video className="h-3 w-3 text-primary" />
                      <span>{item.badge}</span>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/30 flex flex-col justify-end p-4 rounded-lg">
                      <div className="space-y-3">
                        <h3 className="text-base font-bold text-foreground line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                        
                        {/* Action Buttons Row */}
                        <div className="flex items-center gap-2">
                          <Button 
                            size="icon"
                            className="h-10 w-10 bg-white text-black hover:bg-white/90 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              onItemClick?.(item.id)
                            }}
                          >
                            <Play className="h-5 w-5" fill="currentColor" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-10 w-10 rounded-full border-2 border-muted-foreground/50 hover:border-foreground bg-background/40 hover:bg-background/60"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-10 w-10 rounded-full border-2 border-muted-foreground/50 hover:border-foreground bg-background/40 hover:bg-background/60"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-10 w-10 rounded-full border-2 border-muted-foreground/50 hover:border-foreground bg-background/40 hover:bg-background/60 ml-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ChevronDown className="h-5 w-5" />
                          </Button>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-3 text-xs">
                          {item.rating && (
                            <span className="px-1.5 py-0.5 border border-muted-foreground/50 text-muted-foreground font-semibold">
                              {item.rating}
                            </span>
                          )}
                          {item.episodes && (
                            <span className="text-muted-foreground font-medium">
                              {item.episodes} episódios
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 border border-muted-foreground/50 text-muted-foreground font-semibold">
                            HD
                          </span>
                        </div>

                        {/* Genres */}
                        {item.genres && item.genres.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground leading-tight">
                            {item.genres.map((genre, idx) => (
                              <span key={idx}>
                                {genre}
                                {idx < item.genres!.length - 1 && <span className="mx-1">•</span>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {!isExpanded && (
                  <div className="mt-2 space-y-1">
                    <h3 className="text-sm font-medium text-foreground/90 line-clamp-1">
                      {item.title}
                    </h3>
                    {progressPercentage > 0 && !completed && (
                      <p className="text-xs text-muted-foreground">
                        {Math.round(progressPercentage)}% assistido
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end gap-1.5 mt-2 px-4 md:px-0">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToPage(index)}
              className={cn(
                "h-0.5 transition-all duration-300 rounded-full",
                index === currentPage 
                  ? "w-8 bg-foreground/80" 
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              )}
              aria-label={`Página ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
