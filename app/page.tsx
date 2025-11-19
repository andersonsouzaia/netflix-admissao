'use client'

import { useState } from 'react'
import { MembersHeader } from '@/components/members-header'
import { HeroSection } from '@/components/hero-section'
import { ChannelRow } from '@/components/channel-row'
import { ContentRow } from '@/components/content-row'
import { CourseModal } from '@/components/course-modal'
import { ContinueWatching } from '@/components/continue-watching'

const mindBodyContent = [
  { id: 1, title: 'Execução: A Disciplina para Atingir Resultados', image: '/business-execution-discipline.jpg', badge: 'Vídeo', duration: '45 min' },
  { id: 2, title: 'Como Moderar Palestras, Painéis e Reuniões', image: '/public-speaking-moderator.jpg', badge: 'Vídeo', duration: '38 min' },
  { id: 3, title: 'Os 7 Hábitos das Pessoas Altamente Eficazes', image: '/productivity-habits-success.jpg', badge: 'Vídeo', duration: '52 min' },
  { id: 4, title: 'O Estilo Emocional do Cérebro', image: '/emotional-intelligence-brain.jpg', badge: 'Vídeo', duration: '41 min' },
  { id: 5, title: 'A Cura da Procrastinação', image: '/overcoming-procrastination-time.jpg', badge: 'Vídeo', duration: '35 min' },
  { id: 6, title: 'Inteligência Emocional', image: '/emotional-intelligence-mind.jpg', badge: 'Vídeo', duration: '48 min' }
]

const innovationContent = [
  { id: 7, title: 'Ativos Digitais: Tecnologia, Contabilidade e Futuro', image: '/digital-technology-innovation.png', badge: 'Vídeo', duration: '55 min' },
  { id: 8, title: 'As Cartas de Bezos: 14 Princípios para Crescer', image: '/jeff-bezos-business-principles.jpg', badge: 'Vídeo', duration: '44 min' },
  { id: 9, title: 'Liderança em Tempos de Crise', image: '/leadership-crisis-management.jpg', badge: 'Vídeo', duration: '39 min' },
  { id: 10, title: 'Reimaginando a Colaboração', image: '/team-collaboration-remote.jpg', badge: 'Vídeo', duration: '42 min' },
  { id: 11, title: 'Como Liderar com Sucesso: Uma Equipe Remota', image: '/remote-team-leadership.jpg', badge: 'Vídeo', duration: '37 min' },
  { id: 12, title: 'Lean Agile: Design Thinking', image: '/lean-agile-design-thinking.jpg', badge: 'Vídeo', duration: '50 min' }
]

const strategyContent = [
  { id: 13, title: 'Estratégia Competitiva', image: '/competitive-strategy-business.jpg', badge: 'Vídeo', duration: '46 min' },
  { id: 14, title: 'Oceano Azul: Criando Novos Mercados', image: '/blue-ocean-strategy.jpg', badge: 'Vídeo', duration: '53 min' },
  { id: 15, title: 'Marketing Digital Avançado', image: '/digital-marketing-advanced.jpg', badge: 'Vídeo', duration: '49 min' },
  { id: 16, title: 'Gestão de Produtos Tech', image: '/product-management-tech.jpg', badge: 'Vídeo', duration: '41 min' }
]

export default function Home() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getCourseDetails = (id: number) => {
    const allContent = [...mindBodyContent, ...innovationContent, ...strategyContent]
    const course = allContent.find(c => c.id === id)
    
    return {
      ...course!,
      description: 'Um curso transformador que explora os princípios fundamentais para alcançar excelência pessoal e profissional.',
      year: '2025',
      rating: '16+',
      quality: 'HD',
      genres: ['Desenvolvimento', 'Negócios', 'Produtividade'],
      cast: ['João Silva', 'Maria Santos', 'Pedro Costa']
    }
  }

  const handleCourseClick = (id: number) => {
    setSelectedCourse(id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedCourse(null), 300)
  }

  return (
    <div className="min-h-screen bg-background">
      <MembersHeader />
      <HeroSection />
      
      <div className="py-6">
        <ChannelRow />
      </div>

      <div className="pt-6">
        <ContinueWatching />
      </div>
      
      <div className="space-y-8 pb-20 pt-8">
        <ContentRow title="Mente e Corpo" content={mindBodyContent} onItemClick={handleCourseClick} />
        <ContentRow title="Inovação e Negócios" content={innovationContent} onItemClick={handleCourseClick} />
        <ContentRow title="Estratégia e Crescimento" content={strategyContent} onItemClick={handleCourseClick} />
      </div>

      {selectedCourse && (
        <CourseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          course={getCourseDetails(selectedCourse)}
          similarCourses={[...mindBodyContent, ...innovationContent, ...strategyContent].filter(c => c.id !== selectedCourse)}
        />
      )}
    </div>
  )
}
