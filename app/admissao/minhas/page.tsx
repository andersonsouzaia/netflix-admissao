'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MembersHeader } from '@/components/members-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface Registration {
  id: number
  process_id: number
  status: string
  current_step_id: number | null
  created_at: string
  updated_at: string
  submitted_at: string | null
  process?: {
    id: number
    name: string
    description: string | null
  }
}

export default function MyAdmissionsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchRegistrations()
    }
  }, [user])

  const fetchRegistrations = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/admissao/registrations?user_id=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        
        // Buscar informações dos processos
        const registrationsWithProcesses = await Promise.all(
          data.map(async (reg: Registration) => {
            try {
              const processResponse = await fetch(`/api/admissao/processes/${reg.process_id}`)
              if (processResponse.ok) {
                const process = await processResponse.json()
                return { ...reg, process }
              }
            } catch (error) {
              console.error(`Error fetching process ${reg.process_id}:`, error)
            }
            return reg
          })
        )
        
        setRegistrations(registrationsWithProcesses)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completa
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aprovada
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/50">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeitada
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
            <Clock className="h-3 w-3 mr-1" />
            Em Andamento
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <MembersHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Você precisa estar logado para ver suas admissões</p>
            <Button onClick={() => router.push('/admissao')} variant="outline">
              Voltar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MembersHeader />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Admissões</h1>
          <p className="text-muted-foreground">
            Acompanhe o status de suas inscrições em processos seletivos
          </p>
        </div>

        {registrations.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma inscrição encontrada
            </h3>
            <p className="text-muted-foreground mb-6">
              Você ainda não se inscreveu em nenhum processo seletivo.
            </p>
            <Button
              onClick={() => router.push('/admissao')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Ver Processos Disponíveis
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <Card
                key={registration.id}
                className="p-6 bg-card border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-foreground">
                        {registration.process?.name || `Processo #${registration.process_id}`}
                      </h3>
                      {getStatusBadge(registration.status)}
                    </div>

                    {registration.process?.description && (
                      <p className="text-sm text-muted-foreground">
                        {registration.process.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Inscrito em: {formatDate(registration.created_at)}
                      </span>
                      {registration.submitted_at && (
                        <span>
                          Enviado em: {formatDate(registration.submitted_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {registration.status === 'in_progress' ? (
                      <Button
                        onClick={() => router.push(`/admissao/inscricao/${registration.process_id}`)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Continuar Inscrição
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/admissao/inscricao/${registration.process_id}`)}
                      >
                        Ver Detalhes
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

