'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface Course {
  id: number
  name: string
  description: string
  image_url: string | null
  type: string
  modality: string
}

interface CourseCatalogProps {
  courses: Course[]
  onCourseClick?: (course: Course) => void
}

export function CourseCatalog({ courses, onCourseClick }: CourseCatalogProps) {
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

  if (courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Nenhum curso encontrado</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <Card
              key={course.id}
          className="group relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer"
          onClick={() => onCourseClick?.(course)}
            >
          <div className="relative aspect-video w-full overflow-hidden">
                  <img
              src={course.image_url || '/placeholder.svg'}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  onCourseClick?.(course)
                }}
              >
                <Play className="h-5 w-5 mr-2" fill="currentColor" />
                Ver Detalhes
              </Button>
                </div>
                  </div>
          
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
            </div>
            
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded">
                {getTypeLabel(course.type)}
              </span>
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded">
                {getModalityLabel(course.modality)}
              </span>
            </div>
                </div>
              </Card>
          ))}
    </div>
  )
}
