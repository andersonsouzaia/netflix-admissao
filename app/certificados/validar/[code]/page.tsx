'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CertificateValidation {
  valid: boolean
  studentName?: string
  courseName?: string
  issuedAt?: string
  certificateCode?: string
  error?: string
}

export default function ValidateCertificatePage() {
  const params = useParams()
  const code = params.code as string
  
  const [validation, setValidation] = useState<CertificateValidation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function validateCertificate() {
      if (!code) {
        setValidation({
          valid: false,
          error: 'Código do certificado não fornecido',
        })
        setLoading(false)
        return
      }

      try {
        console.log('Validating certificate with code:', code)
        const response = await fetch(`/api/certificates/validate/${encodeURIComponent(code)}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Validation response:', data)
        setValidation(data)
      } catch (error: any) {
        console.error('Error validating certificate:', error)
        setValidation({
          valid: false,
          error: error.message || 'Erro ao validar certificado',
        })
      } finally {
        setLoading(false)
      }
    }

    validateCertificate()
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Validando certificado...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            {validation?.valid ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <CardTitle>
                {validation?.valid ? 'Certificado Válido' : 'Certificado Inválido'}
              </CardTitle>
              <CardDescription>
                {validation?.valid
                  ? 'Este certificado foi verificado e é válido'
                  : validation?.error || 'Certificado não encontrado ou inválido'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {validation?.valid && (
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome do Aluno</p>
                <p className="text-lg font-semibold">{validation.studentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Curso</p>
                <p className="text-lg font-semibold">{validation.courseName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Emissão</p>
                <p className="text-lg">
                  {validation.issuedAt &&
                    format(new Date(validation.issuedAt), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Código do Certificado</p>
                <Badge variant="outline" className="font-mono">
                  {validation.certificateCode}
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

