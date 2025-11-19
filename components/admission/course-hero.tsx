'use client'

import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface CourseHeroProps {
  course: {
    id: number
    name: string
    description: string | null
    image_url: string | null
    type: string
    modality: string
  }
}

export function CourseHero({ course }: CourseHeroProps) {
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      livre: 'Curso Livre',
      graduacao: 'Graduação',
      pos_graduacao: 'Pós-Graduação'
    }
    return labels[type] || type
  }

  const getModalityLabel = (modality: string) => {
    const labels: Record<string, string> = {
      ead: 'EAD',
      presencial: 'Presencial',
      hibrido: 'Híbrido'
    }
    return labels[modality] || modality
  }

  return (
    <section className="relative h-[85vh] flex items-center">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={course.image_url || '/placeholder.svg'}
          alt={course.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="px-4 md:px-12 relative z-10 pt-20 w-full">
        <div className="max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-md text-sm font-semibold">
              {getTypeLabel(course.type)}
            </span>
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm font-semibold">
              {getModalityLabel(course.modality)}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance">
            {course.name}
          </h1>

          {course.description && (
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
