'use client'

import { X, Play, Plus, ThumbsUp, Volume2, VolumeX, Info, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useState } from 'react'
import { useContentProgress } from '@/hooks/use-content-progress'

interface Episode {
  id: number
  number: number
  title: string
  description: string
  duration: string
  thumbnail: string
}

interface Module {
  id: number
  name: string
  episodes: Episode[]
}

interface CourseModalProps {
  isOpen: boolean
  onClose: () => void
  course: {
    id: number
    title: string
    image: string
    duration: string
    description: string
    year: string
    rating: string
    quality: string
    genres: string[]
    cast: string[]
    modules?: Module[]
  }
  similarCourses: Array<{
    id: number
    title: string
    image: string
    duration: string
    year?: string
    rating?: string
    description?: string
    genres?: string[]
  }>
}

export function CourseModal({ isOpen, onClose, course, similarCourses }: CourseModalProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [selectedModule, setSelectedModule] = useState(0)
  const { getProgress, updateProgress, markAsCompleted } = useContentProgress()
  const progress = getProgress('video', course.id.toString())
  const progressPercentage = progress?.progress || 0

  const handleStartCourse = () => {
    updateProgress('video', course.id.toString(), 5)
    console.log('[v0] Starting course:', course.id)
  }

  const modules: Module[] = course.modules || [
    {
      id: 1,
      name: 'Módulo 1: Fundamentos',
      episodes: [
        {
          id: 1,
          number: 1,
          title: 'Introdução ao Curso',
          description: 'Visão geral completa do que você vai aprender neste curso, metodologia e estrutura das aulas.',
          duration: '12min',
          thumbnail: course.image
        },
        {
          id: 2,
          number: 2,
          title: 'Conceitos Básicos',
          description: 'Aprenda os conceitos fundamentais e a base teórica necessária para dominar o conteúdo.',
          duration: '18min',
          thumbnail: course.image
        },
        {
          id: 3,
          number: 3,
          title: 'Primeiros Passos Práticos',
          description: 'Coloque a mão na massa com exercícios práticos e exemplos reais do dia a dia.',
          duration: '25min',
          thumbnail: course.image
        },
        {
          id: 4,
          number: 4,
          title: 'Técnicas Avançadas',
          description: 'Aprenda técnicas avançadas e estratégias utilizadas por profissionais de elite.',
          duration: '22min',
          thumbnail: course.image
        }
      ]
    },
    {
      id: 2,
      name: 'Módulo 2: Intermediário',
      episodes: [
        {
          id: 5,
          number: 1,
          title: 'Aprofundando Conhecimentos',
          description: 'Vá além do básico e explore conceitos mais complexos com exemplos detalhados.',
          duration: '28min',
          thumbnail: course.image
        },
        {
          id: 6,
          number: 2,
          title: 'Estudos de Caso',
          description: 'Analise casos reais de sucesso e aprenda com experiências práticas do mercado.',
          duration: '32min',
          thumbnail: course.image
        }
      ]
    }
  ]

  const currentModule = modules[selectedModule]

  const enhancedSimilarCourses = similarCourses.map((similar, index) => ({
    ...similar,
    year: similar.year || '2025',
    rating: similar.rating || '16+',
    description: similar.description || 'Aprenda técnicas avançadas e estratégias comprovadas com profissionais de elite da indústria.',
    genres: similar.genres || ['Desenvolvimento', 'Carreira']
  }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 bg-background border-none rounded-t-xl overflow-hidden">
        <div className="relative">
          <div className="relative aspect-video w-full rounded-t-xl overflow-hidden">
            <img
              src={course.image || '/placeholder.svg'}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-background/80 hover:bg-background text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground drop-shadow-lg">
                {course.title}
              </h1>

              <div className="flex items-center gap-3">
                <Button 
                  size="lg" 
                  className="bg-foreground text-background hover:bg-foreground/90 gap-2 font-semibold px-8 rounded-lg"
                  onClick={handleStartCourse}
                >
                  <Play className="h-5 w-5" fill="currentColor" />
                  {progressPercentage > 0 ? 'Continuar' : 'Assistir'}
                </Button>
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full bg-background/20 border-muted hover:bg-background/40 backdrop-blur-sm">
                  <Plus className="h-5 w-5 text-foreground" />
                </Button>
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full bg-background/20 border-muted hover:bg-background/40 backdrop-blur-sm">
                  <ThumbsUp className="h-5 w-5 text-foreground" />
                </Button>
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full bg-background/20 border-muted hover:bg-background/40 backdrop-blur-sm">
                  <Info className="h-5 w-5 text-foreground" />
                </Button>
                <div className="flex-1" />
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-10 w-10 rounded-full bg-background/20 border-muted hover:bg-background/40 backdrop-blur-sm"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-foreground" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-foreground" />
                  )}
                </Button>
              </div>

              {progressPercentage > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progressPercentage)}% assistido</span>
                  </div>
                  <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-primary font-semibold">{course.year}</span>
              <span className="text-muted-foreground">{course.duration}</span>
              <span className="px-2 py-0.5 border border-muted text-muted-foreground text-xs font-medium">
                {course.quality}
              </span>
              <span className="px-2 py-0.5 border border-muted text-muted-foreground text-xs font-medium">
                {course.rating}
              </span>
            </div>

            <p className="text-foreground leading-relaxed">
              {course.description}
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground min-w-[80px]">Elenco:</span>
                <span className="text-foreground">{course.cast.join(', ')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground min-w-[80px]">Gêneros:</span>
                <span className="text-foreground">{course.genres.join(', ')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground min-w-[80px]">Este filme é:</span>
                <span className="text-foreground">{course.genres[0]}, {course.genres[1]}</span>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-foreground">Episódios</h3>
                
                {modules.length > 1 && (
                  <div className="relative">
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(Number(e.target.value))}
                      className="appearance-none bg-muted border border-border rounded-lg px-4 py-2 pr-10 text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                    >
                      {modules.map((module, index) => (
                        <option key={module.id} value={index}>
                          {module.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {currentModule.episodes.map((episode) => {
                  const episodeProgress = getProgress('video', `${course.id}-episode-${episode.id}`)
                  const episodePercentage = episodeProgress?.progress || 0

                  return (
                    <div
                      key={episode.id}
                      className="group flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        console.log('[v0] Playing episode:', episode.id)
                        updateProgress('video', `${course.id}-episode-${episode.id}`, 10)
                      }}
                    >
                      <div className="flex-shrink-0 text-2xl font-bold text-muted-foreground w-8 text-center">
                        {episode.number}
                      </div>
                      
                      <div className="relative flex-shrink-0 w-32 h-18 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={episode.thumbnail || '/placeholder.svg'}
                          alt={episode.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-foreground/90 flex items-center justify-center">
                            <Play className="h-4 w-4 text-background ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                        {episodePercentage > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${episodePercentage}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors line-clamp-1">
                            {episode.title}
                          </h4>
                          <span className="text-sm text-muted-foreground flex-shrink-0">
                            {episode.duration}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {episode.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="text-xl font-semibold text-foreground">Títulos semelhantes</h3>
              <div className="grid grid-cols-3 gap-4">
                {enhancedSimilarCourses.slice(0, 9).map((similar) => (
                  <div
                    key={similar.id}
                    className="group relative cursor-pointer rounded-lg overflow-hidden bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="relative aspect-video w-full overflow-hidden">
                      <img
                        src={similar.image || '/placeholder.svg'}
                        alt={similar.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-4 space-y-3 bg-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary">{similar.year}</span>
                          <span className="px-1.5 py-0.5 border border-muted-foreground/30 text-muted-foreground text-[10px] font-medium rounded">
                            {similar.rating}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{similar.duration}</span>
                      </div>

                      <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                        {similar.description}
                      </p>

                      {similar.genres && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {similar.genres.slice(0, 3).map((genre, idx) => (
                            <span 
                              key={idx}
                              className="text-[11px] text-muted-foreground"
                            >
                              {genre}{idx < Math.min(similar.genres!.length, 3) - 1 ? ' •' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
