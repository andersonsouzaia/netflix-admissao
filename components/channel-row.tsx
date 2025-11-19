'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Briefcase, Code, Users, TrendingUp, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const channels = [
  {
    id: 'desenvolvimento-pessoal',
    name: 'Desenvolvimento Pessoal',
    icon: BookOpen,
  },
  {
    id: 'negocios',
    name: 'Negócios',
    icon: Briefcase,
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia',
    icon: Code,
  },
  {
    id: 'lideranca',
    name: 'Liderança',
    icon: Users,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: TrendingUp,
  },
  {
    id: 'inovacao',
    name: 'Inovação',
    icon: Lightbulb,
  }
]

export function ChannelRow() {
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null)
  const [showNavigation, setShowNavigation] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
      const scrollAmount = 250 // Scroll approximately one card width
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
      <h2 className="text-2xl font-bold text-foreground mb-4">Explore por Categoria</h2>
      
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
        {channels.map((channel) => {
          const Icon = channel.icon
          const isHovered = hoveredChannel === channel.id

          return (
            <Link
              key={channel.id}
              href={`/channels/${channel.id}`}
              onMouseEnter={() => setHoveredChannel(channel.id)}
              onMouseLeave={() => setHoveredChannel(null)}
              className={cn(
                "flex-none w-[180px] group/card relative overflow-hidden rounded-xl transition-all duration-300",
                isHovered && "scale-105 shadow-2xl shadow-primary/20"
              )}
            >
              <div className="bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 aspect-[4/3] flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/5 backdrop-blur-sm">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                <div className="relative z-10 p-4">
                  <div className={cn(
                    "mb-2 transform transition-all duration-300",
                    isHovered && "scale-110 -translate-y-1"
                  )}>
                    <Icon className="w-10 h-10 text-white/90 mx-auto" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-semibold text-white/95 leading-tight">
                    {channel.name}
                  </h3>
                </div>

                <div 
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-white/10 to-transparent transition-opacity duration-300",
                    isHovered ? "opacity-100" : "opacity-0"
                  )}
                />
                
                <div 
                  className={cn(
                    "absolute inset-0 rounded-xl transition-all duration-300",
                    isHovered && "ring-2 ring-white/20"
                  )}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
