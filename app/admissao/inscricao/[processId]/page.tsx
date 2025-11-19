'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MembersHeader } from '@/components/members-header'
import { MultiStepForm } from '@/components/admission/multi-step-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface Step {
  id: number
  step_type: string
  name: string
  order_index: number
  is_required: number
  config: string | null
}

interface Process {
  id: number
  name: string
  description: string | null
  unit_id: number
}

interface Unit {
  id: number
  course_id: number
}

export default function RegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const processId = Number(params.processId)

  const [process, setProcess] = useState<Process | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [registrationId, setRegistrationId] = useState<number | null>(null)
  const [courseId, setCourseId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchProcessData()
    }
  }, [processId, user])

  const fetchProcessData = async () => {
    try {
      // Buscar processo
      const processResponse = await fetch(`/api/admissao/processes/${processId}`)
      if (!processResponse.ok) {
        setError('Processo seletivo não encontrado')
        setLoading(false)
        return
      }
      const processData = await processResponse.json()
      setProcess(processData)

      // Buscar unidade para obter courseId
      if (processData.unit_id) {
        try {
          // Buscar todas as unidades e filtrar pela unit_id
          const unitResponse = await fetch(`/api/admissao/units`)
          if (unitResponse.ok) {
            const units = await unitResponse.json()
            const unit = units.find((u: any) => u.id === processData.unit_id)
            if (unit && unit.course_id) {
              setCourseId(unit.course_id)
            }
          }
        } catch (error) {
          console.error('Error fetching unit:', error)
        }
      }

      // Buscar passos
      const stepsResponse = await fetch(`/api/admissao/steps?process_id=${processId}`)
      if (stepsResponse.ok) {
        const stepsData = await stepsResponse.json()
        setSteps(stepsData)
      }

      // Verificar se já existe inscrição
      if (user) {
        const registrationResponse = await fetch(
          `/api/admissao/registrations?user_id=${user.id}&process_id=${processId}`
        )
        if (registrationResponse.ok) {
          const registrations = await registrationResponse.json()
          if (registrations.length > 0) {
            setRegistrationId(registrations[0].id)
          } else {
            // Criar nova inscrição
            await createRegistration()
          }
        }
      }
    } catch (error) {
      console.error('Error fetching process data:', error)
      setError('Erro ao carregar dados do processo seletivo')
    } finally {
      setLoading(false)
    }
  }

  const createRegistration = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/admissao/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          process_id: processId,
          user_id: user.id,
        }),
      })

      if (response.ok) {
        const registration = await response.json()
        setRegistrationId(registration.id)
      }
    } catch (error) {
      console.error('Error creating registration:', error)
    }
  }

  const handleComplete = async () => {
    if (!registrationId) return

    try {
      // Marcar inscrição como completa
      await fetch(`/api/admissao/registrations/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          submitted_at: new Date().toISOString(),
        }),
      })

      // Redirecionar para página de sucesso ou minhas admissões
      router.push('/admissao/minhas')
    } catch (error) {
      console.error('Error completing registration:', error)
    }
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

  if (error || !process) {
    return (
      <div className="min-h-screen bg-background">
        <MembersHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">{error || 'Processo não encontrado'}</p>
            <Button onClick={() => router.push('/admissao')} variant="outline">
              Voltar para Catálogo
            </Button>
          </div>
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
            <p className="text-muted-foreground">Você precisa estar logado para se inscrever</p>
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
        <Button
          variant="ghost"
          onClick={() => {
            if (courseId) {
              router.push(`/admissao/${courseId}`)
            } else {
              router.back()
            }
          }}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o Curso
        </Button>

        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Inscrição: {process.name}
            </h1>
            {process.description && (
              <p className="text-muted-foreground">{process.description}</p>
            )}
          </div>

          {steps.length > 0 ? (
            <MultiStepForm
              steps={steps}
              processId={processId}
              registrationId={registrationId}
              userId={user.id}
              onComplete={handleComplete}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum passo configurado para este processo seletivo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
