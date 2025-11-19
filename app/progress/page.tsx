'use client'

import { useAuth } from '@/contexts/auth-context'
import { useContentProgress } from '@/hooks/use-content-progress'
import { MembersHeader } from '@/components/members-header'
import { Progress } from '@/components/ui/progress'
import { Trophy, TrendingUp, Award, Flame, Target, Video, FileText, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProgressPage() {
  const { user } = useAuth()
  const { progress, getRecentActivity } = useContentProgress()
  const recentActivity = getRecentActivity(10)

  // Calculate statistics
  const totalCompleted = Object.values(progress).filter(p => p.completed).length
  const totalQuizzes = Object.values(progress).reduce((acc, p) => acc + (p.quizAttempts?.length || 0), 0)
  
  // Mock data for courses
  const coursesProgress = [
    { id: '1', title: 'Execução: A Disciplina para Atingir Resultados', progress: 75, totalLessons: 12, completedLessons: 9 },
    { id: '2', title: 'Como Moderar Palestras, Painéis e Reuniões', progress: 50, totalLessons: 8, completedLessons: 4 },
    { id: '3', title: 'Os 7 Hábitos das Pessoas Altamente Eficazes', progress: 100, totalLessons: 15, completedLessons: 15 },
    { id: '4', title: 'Liderança em Tempos de Crise', progress: 30, totalLessons: 10, completedLessons: 3 },
  ]

  const completedCourses = coursesProgress.filter(c => c.progress === 100).length
  const overallProgress = coursesProgress.reduce((acc, c) => acc + c.progress, 0) / coursesProgress.length

  // Mock achievements
  const achievements = [
    { id: '1', name: 'Primeira Conquista', icon: Trophy, unlocked: true },
    { id: '2', name: 'Sequência de 7 dias', icon: Flame, unlocked: true },
    { id: '3', name: 'Mestre em Liderança', icon: Award, unlocked: false },
    { id: '4', name: 'Perfeccionista', icon: Target, unlocked: false },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'video_completed': return Video
      case 'quiz_completed': return CheckCircle
      case 'dissertation_completed': return FileText
      default: return CheckCircle
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) return 'Agora mesmo'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-background">
      <MembersHeader />
      
      <div className="container mx-auto px-4 pt-24 pb-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Meu Progresso</h1>
          <p className="text-muted-foreground">Acompanhe seu desenvolvimento e conquistas</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
              <Trophy className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{user?.level || 1}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {user?.xp || 0} XP total
              </p>
              <Progress value={((user?.xp || 0) % 1000) / 10} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{user?.streak || 0} dias</div>
              <p className="text-xs text-muted-foreground mt-1">
                Continue aprendendo!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conteúdos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalCompleted}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Concluídos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos</CardTitle>
              <Award className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{completedCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Finalizados
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses Progress */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Progresso por Curso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {coursesProgress.map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground line-clamp-1">
                        {course.title}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {course.completedLessons}/{course.totalLessons} aulas
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{course.progress}% concluído</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhuma atividade recente
                    </p>
                  ) : (
                    recentActivity.map((activity) => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {activity.type === 'video_completed' && 'Vídeo concluído'}
                              {activity.type === 'quiz_completed' && 'Quiz finalizado'}
                              {activity.type === 'dissertation_completed' && 'Dissertação enviada'}
                              {activity.type === 'content_completed' && 'Conteúdo finalizado'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {activity.contentTitle || `Conteúdo ${activity.contentId}`}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conquistas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement) => {
                    const Icon = achievement.icon
                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border ${
                          achievement.unlocked
                            ? 'bg-primary/5 border-primary/20'
                            : 'bg-muted/20 border-muted opacity-50'
                        } flex flex-col items-center gap-2 text-center`}
                      >
                        <Icon className={`h-8 w-8 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="text-xs font-medium text-foreground">{achievement.name}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Vídeos assistidos</span>
                  <span className="text-sm font-semibold text-foreground">{totalCompleted}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Quizzes realizados</span>
                  <span className="text-sm font-semibold text-foreground">{totalQuizzes}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Progresso geral</span>
                  <span className="text-sm font-semibold text-foreground">{Math.round(overallProgress)}%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Cursos concluídos</span>
                  <span className="text-sm font-semibold text-foreground">{completedCourses}/{coursesProgress.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
