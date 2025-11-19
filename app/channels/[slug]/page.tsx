'use client'

import { useState, use } from 'react'
import { MembersHeader } from '@/components/members-header'
import { HeroSection } from '@/components/hero-section'
import { ContentRow } from '@/components/content-row'
import { CourseModal } from '@/components/course-modal'
import { ContinueWatching } from '@/components/continue-watching'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const channelContent: Record<string, any> = {
  'desenvolvimento-pessoal': {
    name: 'Desenvolvimento Pessoal',
    hero: {
      title: 'Os 7 Hábitos das Pessoas Altamente Eficazes',
      description: 'Transforme sua vida com princípios fundamentais para alcançar excelência pessoal e profissional.',
      image: '/productivity-habits-success.jpg'
    },
    rows: [
      {
        title: 'Produtividade e Hábitos',
        content: [
          { id: 1, title: 'Os 7 Hábitos das Pessoas Altamente Eficazes', image: '/productivity-habits-success.jpg', badge: 'Vídeo', duration: '52 min' },
          { id: 2, title: 'A Cura da Procrastinação', image: '/overcoming-procrastination-time.jpg', badge: 'Vídeo', duration: '35 min' },
          { id: 3, title: 'Execução: A Disciplina para Atingir Resultados', image: '/business-execution-discipline.jpg', badge: 'Vídeo', duration: '45 min' }
        ]
      },
      {
        title: 'Inteligência Emocional',
        content: [
          { id: 4, title: 'O Estilo Emocional do Cérebro', image: '/emotional-intelligence-brain.jpg', badge: 'Vídeo', duration: '41 min' },
          { id: 5, title: 'Inteligência Emocional', image: '/emotional-intelligence-mind.jpg', badge: 'Vídeo', duration: '48 min' }
        ]
      }
    ]
  },
  'negocios': {
    name: 'Negócios',
    hero: {
      title: 'As Cartas de Bezos: 14 Princípios para Crescer',
      description: 'Aprenda os segredos do crescimento empresarial com as estratégias do fundador da Amazon.',
      image: '/jeff-bezos-business-principles.jpg'
    },
    rows: [
      {
        title: 'Estratégia Empresarial',
        content: [
          { id: 8, title: 'As Cartas de Bezos: 14 Princípios para Crescer', image: '/jeff-bezos-business-principles.jpg', badge: 'Vídeo', duration: '44 min' },
          { id: 13, title: 'Estratégia Competitiva', image: '/competitive-strategy-business.jpg', badge: 'Vídeo', duration: '46 min' },
          { id: 14, title: 'Oceano Azul: Criando Novos Mercados', image: '/blue-ocean-strategy.jpg', badge: 'Vídeo', duration: '53 min' }
        ]
      }
    ]
  },
  'tecnologia': {
    name: 'Tecnologia',
    hero: {
      title: 'Ativos Digitais: Tecnologia, Contabilidade e Futuro',
      description: 'Explore o futuro da tecnologia e as tendências que moldarão os próximos anos.',
      image: '/digital-technology-innovation.png'
    },
    rows: [
      {
        title: 'Inovação Digital',
        content: [
          { id: 7, title: 'Ativos Digitais: Tecnologia, Contabilidade e Futuro', image: '/digital-technology-innovation.png', badge: 'Vídeo', duration: '55 min' },
          { id: 12, title: 'Lean Agile: Design Thinking', image: '/lean-agile-design-thinking.jpg', badge: 'Vídeo', duration: '50 min' }
        ]
      }
    ]
  },
  'lideranca': {
    name: 'Liderança',
    hero: {
      title: 'Liderança em Tempos de Crise',
      description: 'Desenvolva habilidades essenciais para liderar equipes em qualquer situação.',
      image: '/leadership-crisis-management.jpg'
    },
    rows: [
      {
        title: 'Gestão de Equipes',
        content: [
          { id: 9, title: 'Liderança em Tempos de Crise', image: '/leadership-crisis-management.jpg', badge: 'Vídeo', duration: '39 min' },
          { id: 11, title: 'Como Liderar com Sucesso: Uma Equipe Remota', image: '/remote-team-leadership.jpg', badge: 'Vídeo', duration: '37 min' },
          { id: 2, title: 'Como Moderar Palestras, Painéis e Reuniões', image: '/public-speaking-moderator.jpg', badge: 'Vídeo', duration: '38 min' }
        ]
      }
    ]
  },
  'marketing': {
    name: 'Marketing',
    hero: {
      title: 'Marketing Digital Avançado',
      description: 'Domine as estratégias mais eficazes do marketing digital moderno.',
      image: '/digital-marketing-advanced.jpg'
    },
    rows: [
      {
        title: 'Marketing Digital',
        content: [
          { id: 15, title: 'Marketing Digital Avançado', image: '/digital-marketing-advanced.jpg', badge: 'Vídeo', duration: '49 min' }
        ]
      }
    ]
  },
  'inovacao': {
    name: 'Inovação',
    hero: {
      title: 'Reimaginando a Colaboração',
      description: 'Descubra novas formas de trabalhar e colaborar em um mundo digital.',
      image: '/team-collaboration-remote.jpg'
    },
    rows: [
      {
        title: 'Inovação e Transformação',
        content: [
          { id: 10, title: 'Reimaginando a Colaboração', image: '/team-collaboration-remote.jpg', badge: 'Vídeo', duration: '42 min' },
          { id: 12, title: 'Lean Agile: Design Thinking', image: '/lean-agile-design-thinking.jpg', badge: 'Vídeo', duration: '50 min' }
        ]
      }
    ]
  }
}

export default function ChannelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const channel = channelContent[slug]

  if (!channel) {
    return <div>Canal não encontrado</div>
  }

  const allContent = channel.rows.flatMap((row: any) => row.content)

  const getCourseDetails = (id: number) => {
    const course = allContent.find((c: any) => c.id === id)
    
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
      
      <div className="pt-20 px-4 container mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos Canais
        </Link>
      </div>

      <HeroSection 
        title={channel.hero.title}
        description={channel.hero.description}
        image={channel.hero.image}
      />
      
      <div className="pt-8">
        <ContinueWatching />
      </div>
      
      <div className="space-y-8 pb-20 pt-8">
        {channel.rows.map((row: any, index: number) => (
          <ContentRow 
            key={index}
            title={row.title} 
            content={row.content} 
            onItemClick={handleCourseClick} 
          />
        ))}
      </div>

      {selectedCourse && (
        <CourseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          course={getCourseDetails(selectedCourse)}
          similarCourses={allContent.filter((c: any) => c.id !== selectedCourse)}
        />
      )}
    </div>
  )
}
