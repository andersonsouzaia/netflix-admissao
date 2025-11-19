'use client'

import { useState, useEffect } from 'react'
import { MembersHeader } from '@/components/members-header'
import { HeroSection } from '@/components/hero-section'
import { CourseCatalog } from '@/components/admission/course-catalog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Course {
  id: number
  name: string
  description: string
  image_url: string | null
  type: string
  modality: string
}

interface Unit {
  id: number
  name: string
  course_id: number
}

export default function AdmissionCatalogPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedModality, setSelectedModality] = useState<string>('all')
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
    fetchUnits()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, selectedType, selectedModality, selectedUnit])

  const fetchCourses = async () => {
      try {
        const response = await fetch('/api/admissao/courses')
        if (response.ok) {
          const data = await response.json()
          setCourses(data)
        setFilteredCourses(data)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/admissao/units')
      if (response.ok) {
        const data = await response.json()
        setUnits(data)
      }
    } catch (error) {
      console.error('Error fetching units:', error)
    }
  }

  const filterCourses = async () => {
    let filtered = [...courses]

    if (selectedType !== 'all') {
      filtered = filtered.filter(course => course.type === selectedType)
    }

    if (selectedModality !== 'all') {
      filtered = filtered.filter(course => course.modality === selectedModality)
    }

    // Filtrar por unidade
    if (selectedUnit !== 'all') {
      const unitId = Number(selectedUnit)
      const unit = units.find(u => u.id === unitId)
      if (unit) {
        filtered = filtered.filter(course => course.id === unit.course_id)
      }
    }

    setFilteredCourses(filtered)
  }

  const handleCourseClick = (course: Course) => {
    router.push(`/admissao/${course.id}`)
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

  return (
    <div className="min-h-screen bg-background">
      <MembersHeader />
      
      <HeroSection
        title="Processos de Admissão"
        description="Encontre o curso ideal para você. Explore nossos cursos de graduação, pós-graduação e cursos livres."
        image="/placeholder.svg?height=1080&width=1920"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full bg-card border-border">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="livre">Curso Livre</SelectItem>
                <SelectItem value="graduacao">Graduação</SelectItem>
                <SelectItem value="pos_graduacao">Pós-Graduação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={selectedModality} onValueChange={setSelectedModality}>
              <SelectTrigger className="w-full bg-card border-border">
                <SelectValue placeholder="Filtrar por modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as modalidades</SelectItem>
                <SelectItem value="ead">EAD</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-full bg-card border-border">
                <SelectValue placeholder="Filtrar por unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as unidades</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(selectedType !== 'all' || selectedModality !== 'all' || selectedUnit !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedType('all')
                setSelectedModality('all')
                setSelectedUnit('all')
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Cursos Disponíveis
          </h2>
          <p className="text-muted-foreground">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
          </p>
        </div>

        <CourseCatalog courses={filteredCourses} onCourseClick={handleCourseClick} />
      </div>
    </div>
  )
}
