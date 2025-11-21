'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Certificate {
  id: number
  certificate_code: string
  student_name: string
  course_name: string
  issued_at: string
  public_url: string
}

interface CertificateListProps {
  userId?: string
  courseId?: string
  registrationId?: string
}

export function CertificateList({ userId, courseId, registrationId }: CertificateListProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<number | null>(null)

  useEffect(() => {
    async function loadCertificates() {
      try {
        const params = new URLSearchParams()
        if (userId) params.append('userId', userId)
        if (courseId) params.append('courseId', courseId)
        if (registrationId) params.append('registrationId', registrationId)

        const response = await fetch(`/api/certificates?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setCertificates(data)
        }
      } catch (error) {
        console.error('Error loading certificates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCertificates()
  }, [userId, courseId, registrationId])

  const handleDownload = async (certificateId: number) => {
    setDownloading(certificateId)
    try {
      const response = await fetch(`/api/certificates/${certificateId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `certificado-${certificateId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading certificate:', error)
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum certificado encontrado</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {certificates.map((certificate) => (
        <Card key={certificate.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{certificate.course_name}</CardTitle>
                <CardDescription>
                  Emitido para {certificate.student_name}
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {certificate.certificate_code}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(certificate.public_url, '_blank')}
                >
                  Validar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDownload(certificate.id)}
                  disabled={downloading === certificate.id}
                >
                  {downloading === certificate.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Baixando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Baixar PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

