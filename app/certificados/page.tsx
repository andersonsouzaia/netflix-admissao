'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MembersHeader } from '@/components/members-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CertificateList } from '@/components/certificate/certificate-list'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { FileText, Award, Loader2, Download } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Registration {
  id: number
  process_id: number
  status: string
  created_at: string
  submitted_at: string | null
  process?: {
    id: number
    name: string
    unit_id: number
  }
  unit?: {
    id: number
    name: string
    course_id: number
  }
  course?: {
    id: number
    name: string
  }
  hasCertificate?: boolean
}

export default function CertificatesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<number | null>(null)
  const [mockCertificate, setMockCertificate] = useState<any>(null)
  const [generatingMock, setGeneratingMock] = useState(false)

  const fetchApprovedRegistrations = useCallback(async () => {
    if (!user) return

    try {
      // Buscar inscrições do usuário
      const registrationsResponse = await fetch(`/api/admissao/registrations?user_id=${user.id}`)
      if (!registrationsResponse.ok) {
        throw new Error('Erro ao buscar inscrições')
      }

      const registrationsData = await registrationsResponse.json()

      // Filtrar apenas inscrições aprovadas
      const approvedRegistrations = registrationsData.filter(
        (reg: Registration) => reg.status === 'approved'
      )

      // Para cada inscrição aprovada, buscar informações completas
      const registrationsWithDetails = await Promise.all(
        approvedRegistrations.map(async (reg: Registration) => {
          try {
            // Buscar processo
            const processResponse = await fetch(`/api/admissao/processes/${reg.process_id}`)
            const process = processResponse.ok ? await processResponse.json() : null

            if (!process) return { ...reg, hasCertificate: false }

            // Buscar unidade
            const unitsResponse = await fetch('/api/admissao/units')
            const units = unitsResponse.ok ? await unitsResponse.json() : []
            const unit = units.find((u: any) => u.id === process.unit_id)

            if (!unit) return { ...reg, process, hasCertificate: false }

            // Buscar curso - usar a rota correta
            const courseResponse = await fetch(`/api/admissao/courses/${unit.course_id}`)
            let course = null
            if (courseResponse.ok) {
              course = await courseResponse.json()
            } else {
              // Tentar buscar da lista de cursos
              const allCoursesResponse = await fetch('/api/admissao/courses')
              if (allCoursesResponse.ok) {
                const allCourses = await allCoursesResponse.json()
                course = allCourses.find((c: any) => c.id === unit.course_id)
              }
            }

            // Verificar se já existe certificado
            const certificatesResponse = await fetch(
              `/api/certificates?registrationId=${reg.id}`
            )
            const certificates = certificatesResponse.ok ? await certificatesResponse.json() : []
            const hasCertificate = certificates.length > 0

            return {
              ...reg,
              process,
              unit,
              course,
              hasCertificate,
            }
          } catch (error) {
            console.error(`Error fetching details for registration ${reg.id}:`, error)
            return { ...reg, hasCertificate: false }
          }
        })
      )

      setRegistrations(registrationsWithDetails)
    } catch (error) {
      console.error('Error fetching approved registrations:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar inscrições aprovadas',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const registrationsWithoutCertificate = useMemo(
    () => registrations.filter((reg) => !reg.hasCertificate),
    [registrations]
  )
  const registrationsWithCertificate = useMemo(
    () => registrations.filter((reg) => reg.hasCertificate),
    [registrations]
  )

  useEffect(() => {
    if (user) {
      fetchApprovedRegistrations()
    } else {
      setLoading(false)
    }
  }, [user, fetchApprovedRegistrations])

  // Buscar certificado mockado se não houver certificados reais
  useEffect(() => {
    async function checkMockCertificate() {
      if (!user || loading) return
      
      // Se houver certificados reais, não mostrar mockado
      if (registrationsWithCertificate.length > 0) {
        setMockCertificate(null)
        return
      }

      try {
        // Verificar se já existe certificado mockado
        const response = await fetch(`/api/certificates?userId=${user.id}`)
        if (response.ok) {
          const certificates = await response.json()
          const mock = certificates.find((c: any) => c.certificate_code?.startsWith('MOCK-'))
          if (mock) {
            setMockCertificate(mock)
          }
        }
      } catch (error) {
        console.error('Error checking mock certificate:', error)
      }
    }

    checkMockCertificate()
  }, [user, loading, registrationsWithCertificate.length])

  const handleGenerateCertificate = async (registration: Registration) => {
    if (!user || !registration.course) {
      toast({
        title: 'Erro',
        description: 'Dados insuficientes para gerar certificado',
        variant: 'destructive',
      })
      return
    }

    setGenerating(registration.id)

    try {
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: registration.id,
          courseId: registration.course.id,
          userId: user.id,
          studentName: user.name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar certificado')
      }

      const certificate = await response.json()

      toast({
        title: 'Sucesso',
        description: 'Certificado gerado com sucesso!',
      })

      // Atualizar lista
      await fetchApprovedRegistrations()

      // Iniciar download do PDF
      setTimeout(() => {
        window.location.href = `/api/certificates/${certificate.id}/download`
      }, 500)
    } catch (error: any) {
      console.error('Error generating certificate:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao gerar certificado',
        variant: 'destructive',
      })
    } finally {
      setGenerating(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MembersHeader />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <MembersHeader />
        <div className="flex items-center justify-center h-screen">
          <Card className="p-8 text-center">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Você precisa estar logado para ver seus certificados
              </p>
              <Button onClick={() => router.push('/admissao')} variant="outline">
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }


  const handleGenerateMockCertificate = async () => {
    if (!user) return

    setGeneratingMock(true)
    try {
      const response = await fetch('/api/certificates/mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          studentName: user.name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar certificado mockado')
      }

      const certificate = await response.json()
      setMockCertificate(certificate)

      toast({
        title: 'Sucesso',
        description: 'Certificado mockado gerado com sucesso!',
      })

      // Iniciar download do PDF
      setTimeout(() => {
        window.location.href = `/api/certificates/${certificate.id}/download`
      }, 500)
    } catch (error: any) {
      console.error('Error generating mock certificate:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao gerar certificado mockado',
        variant: 'destructive',
      })
    } finally {
      setGeneratingMock(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MembersHeader />

      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Certificados</h1>
          <p className="text-muted-foreground">
            Gerar e gerenciar seus certificados de conclusão de curso
          </p>
        </div>

        {/* Seção: Gerar Novo Certificado */}
        {registrationsWithoutCertificate.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-6 w-6" />
              Gerar Novo Certificado
            </h2>
            <div className="space-y-4">
              {registrationsWithoutCertificate.map((registration) => (
                <Card
                  key={registration.id}
                  className="p-6 bg-card border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-foreground">
                          {registration.course?.name || registration.process?.name || 'Curso'}
                        </h3>
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                          Aprovado
                        </Badge>
                      </div>
                      {registration.process?.name && (
                        <p className="text-sm text-muted-foreground">
                          Processo: {registration.process.name}
                        </p>
                      )}
                      {registration.submitted_at && (
                        <p className="text-xs text-muted-foreground">
                          Aprovado em:{' '}
                          {format(new Date(registration.submitted_at), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleGenerateCertificate(registration)}
                      disabled={generating === registration.id || !registration.course}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {generating === registration.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Gerar Certificado
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Seção: Certificados Emitidos */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Certificados Emitidos
          </h2>
          
          {/* Mostrar certificado mockado se não houver certificados reais */}
          {mockCertificate && registrationsWithCertificate.length === 0 && (
            <div className="mb-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{mockCertificate.course_name}</CardTitle>
                      <CardDescription>
                        Emitido para {mockCertificate.student_name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {mockCertificate.certificate_code}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(mockCertificate.issued_at), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(mockCertificate.public_url, '_blank')}
                      >
                        Validar
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          window.location.href = `/api/certificates/${mockCertificate.id}/download`
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600 dark:text-yellow-400">
                    ⚠️ Certificado mockado para testes - Inclui QR code funcional
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Botão para gerar certificado mockado se não existir */}
          {!mockCertificate && registrationsWithCertificate.length === 0 && (
            <Card className="mb-4 p-6 bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Gerar Certificado Mockado para Testes
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Gere um certificado de teste completo com QR code, PDF e validação pública
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateMockCertificate}
                    disabled={generatingMock}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {generatingMock ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Award className="mr-2 h-4 w-4" />
                        Gerar Certificado Mockado
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de certificados reais */}
          {registrationsWithCertificate.length > 0 && (
            <CertificateList userId={user.id} />
          )}
        </div>

        {/* Empty State - só mostra se não houver certificados mockados nem reais */}
        {registrationsWithoutCertificate.length === 0 && 
         registrationsWithCertificate.length === 0 && 
         !mockCertificate && (
          <Card className="p-12 text-center bg-card border-border">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum certificado disponível
            </h3>
            <p className="text-muted-foreground mb-6">
              Você ainda não possui inscrições aprovadas para gerar certificados.
            </p>
            <Button
              onClick={() => router.push('/admissao')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Ver Processos de Admissão
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}

