'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Briefcase, Code, Users, TrendingUp, Lightbulb } from 'lucide-react'

const channels = [
  {
    id: 'desenvolvimento-pessoal',
    name: 'Desenvolvimento Pessoal',
    icon: BookOpen,
    color: 'from-blue-600 to-blue-800',
    description: 'Cresça pessoal e profissionalmente'
  },
  {
    id: 'negocios',
    name: 'Negócios',
    icon: Briefcase,
    color: 'from-green-600 to-green-800',
    description: 'Empreendedorismo e gestão'
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia',
    icon: Code,
    color: 'from-purple-600 to-purple-800',
    description: 'Inovação e programação'
  },
  {
    id: 'lideranca',
    name: 'Liderança',
    icon: Users,
    color: 'from-orange-600 to-orange-800',
    description: 'Gestão de equipes e pessoas'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: TrendingUp,
    color: 'from-pink-600 to-pink-800',
    description: 'Marketing digital e vendas'
  },
  {
    id: 'inovacao',
    name: 'Inovação',
    icon: Lightbulb,
    color: 'from-yellow-600 to-yellow-800',
    description: 'Criatividade e novos negócios'
  }
]

export function ChannelSelector() {
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null)

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Escolha seu Canal
          </h1>
          <p className="text-lg text-muted-foreground">
            Selecione uma categoria para explorar conteúdos exclusivos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {channels.map((channel) => {
            const Icon = channel.icon
            const isHovered = hoveredChannel === channel.id

            return (
              <Link
                key={channel.id}
                href={`/channels/${channel.id}`}
                onMouseEnter={() => setHoveredChannel(channel.id)}
                onMouseLeave={() => setHoveredChannel(null)}
                className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.3)' : '0 10px 20px rgba(0,0,0,0.2)'
                }}
              >
                <div className={`bg-gradient-to-br ${channel.color} p-8 h-64 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '40px 40px'
                    }} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`mb-4 transform transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                      <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {channel.name}
                    </h2>
                    <p className="text-white/90 text-sm">
                      {channel.description}
                    </p>
                  </div>

                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/browse" 
            className="inline-block text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Ou navegue por todo o conteúdo →
          </Link>
        </div>
      </div>
    </div>
  )
}
