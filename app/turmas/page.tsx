'use client'

import { MembersHeader } from '@/components/members-header'
import { Users, BookOpen, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const turmas = [
  {
    id: 1,
    nome: 'Turma de Liderança e Gestão - Turno Manhã',
    descricao: 'Desenvolva habilidades essenciais de liderança e gestão de equipes',
    alunos: 24,
    modulos: 8,
    dataInicio: '15 Jan 2025',
    horario: '09:00 - 12:00',
    progresso: 45,
    status: 'Em andamento',
    cor: 'bg-blue-500'
  },
  {
    id: 2,
    nome: 'Turma de Marketing Digital Avançado',
    descricao: 'Estratégias avançadas de marketing digital e growth hacking',
    alunos: 32,
    modulos: 12,
    dataInicio: '20 Jan 2025',
    horario: '14:00 - 17:00',
    progresso: 30,
    status: 'Em andamento',
    cor: 'bg-purple-500'
  },
  {
    id: 3,
    nome: 'Turma de Desenvolvimento Pessoal',
    descricao: 'Inteligência emocional, produtividade e crescimento pessoal',
    alunos: 18,
    modulos: 6,
    dataInicio: '01 Fev 2025',
    horario: '19:00 - 21:00',
    progresso: 15,
    status: 'Iniciando',
    cor: 'bg-green-500'
  },
  {
    id: 4,
    nome: 'Turma de Inovação e Tecnologia',
    descricao: 'Transformação digital, IA e tendências tecnológicas',
    alunos: 28,
    modulos: 10,
    dataInicio: '05 Fev 2025',
    horario: '10:00 - 13:00',
    progresso: 60,
    status: 'Em andamento',
    cor: 'bg-orange-500'
  }
]

export default function TurmasPage() {
  return (
    <div className="min-h-screen bg-background">
      <MembersHeader />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Minhas Turmas</h1>
          <p className="text-muted-foreground">Acompanhe suas turmas e progresso de aprendizado</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {turmas.map((turma) => (
            <Card key={turma.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-2 ${turma.cor}`} />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{turma.nome}</h3>
                    <p className="text-sm text-muted-foreground">{turma.descricao}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    turma.status === 'Em andamento' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {turma.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{turma.alunos} alunos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{turma.modulos} módulos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{turma.dataInicio}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{turma.horario}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Progresso</span>
                    <span className="text-sm font-semibold text-primary">{turma.progresso}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${turma.cor}`}
                      style={{ width: `${turma.progresso}%` }}
                    />
                  </div>
                </div>

                <Button className="w-full" variant="default">
                  Acessar Turma
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
