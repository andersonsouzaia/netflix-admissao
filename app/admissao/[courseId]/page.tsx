'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MembersHeader } from '@/components/members-header'
import { CourseHero } from '@/components/admission/course-hero'
import { UnitsAccordion } from '@/components/admission/units-accordion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, GraduationCap, MapPin, Users } from 'lucide-react'

interface Course {
  id: number
  name: string
  description: string | null
  image_url: string | null
  type: string
  modality: string
  created_at: string
}

interface Unit {
  id: number
  name: string
  description: string | null
}


export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number(params.courseId)

  const [course, setCourse] = useState<Course | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [totalProcesses, setTotalProcesses] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId && !isNaN(courseId)) {
      fetchCourseData()
    } else {
      setLoading(false)
      setCourse(null)
    }
  }, [courseId])

  const fetchCourseData = async () => {
      try {
      // Buscar curso
      const courseResponse = await fetch(`/api/admissao/courses/${courseId}`)
      let courseFound = false
      
      if (courseResponse.ok) {
        const courseData = await courseResponse.json()
        if (courseData.error) {
          console.error('API Error:', courseData.error)
          setCourse(null)
        } else {
          setCourse(courseData)
          courseFound = true
        }
      } else {
        const errorData = await courseResponse.json().catch(() => ({}))
        console.error('Failed to fetch course:', courseResponse.status, errorData)
        setCourse(null)
      }

      // Buscar unidades apenas se o curso foi encontrado
      if (courseFound) {
        try {
          const unitsResponse = await fetch(`/api/admissao/units?course_id=${courseId}`)
          if (unitsResponse.ok) {
            const unitsData = await unitsResponse.json()
            setUnits(unitsData)

            // Contar processos totais
            let processCount = 0
            for (const unit of unitsData) {
              try {
                const processesResponse = await fetch(
                  `/api/admissao/processes?unit_id=${unit.id}&is_active=true`
                )
                if (processesResponse.ok) {
                  const processes = await processesResponse.json()
                  processCount += processes.length
                }
              } catch (error) {
                console.error(`Error counting processes for unit ${unit.id}:`, error)
              }
            }
            setTotalProcesses(processCount)
          }
        } catch (error) {
          console.error('Error fetching units:', error)
        }
        }
      } catch (error) {
      console.error('Error fetching course data:', error)
      setCourse(null)
      } finally {
        setLoading(false)
      }
    }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MembersHeader />
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <MembersHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Curso não encontrado</p>
            <Button onClick={() => router.push('/admissao')} variant="outline">
              Voltar para Catálogo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MembersHeader />
      
      <CourseHero course={course} />

      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => router.push('/admissao')}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Catálogo
        </Button>

        {/* Informações do Curso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">Tipo de Curso</h3>
            </div>
            <p className="text-lg font-semibold text-foreground">{getTypeLabel(course.type)}</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">Modalidade</h3>
            </div>
            <p className="text-lg font-semibold text-foreground">{getModalityLabel(course.modality)}</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">Processos Disponíveis</h3>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {totalProcesses} {totalProcesses === 1 ? 'processo' : 'processos'}
            </p>
          </Card>
        </div>

        {/* Descrição Expandida */}
        {course.description && (
          <Card className="p-6 mb-12 bg-card border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Sobre o Curso</h2>
            <p className="text-muted-foreground leading-relaxed">{course.description}</p>
          </Card>
        )}

        {/* Unidades e Processos Seletivos */}
        <UnitsAccordion units={units} courseId={courseId} />
      </div>
    </div>
  )
}
