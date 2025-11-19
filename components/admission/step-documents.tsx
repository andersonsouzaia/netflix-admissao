'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Document {
  id: number
  name: string
  description: string | null
  is_required: number
  accepted_formats: string[]
  max_size_mb: number
}

interface UploadedDocument {
  id: number
  document_id: number
  file_name: string
  file_path: string
  status: string
  rejection_reason: string | null
  uploaded_at: string
  document_name: string
}

interface StepDocumentsProps {
  step: any
  registrationId: number | null
  userId: string
  initialData: any
  onComplete: (data: any) => void
}

export function StepDocuments({
  step,
  registrationId,
  onComplete
}: StepDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [uploading, setUploading] = useState<Record<number, boolean>>({})
  const [allDocumentsUploaded, setAllDocumentsUploaded] = useState(false)

  useEffect(() => {
    fetchDocuments()
    if (registrationId) {
      fetchUploadedDocuments()
    }
  }, [step.id, registrationId])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/admissao/steps/documents?step_id=${step.id}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const fetchUploadedDocuments = async () => {
    if (!registrationId) return

    try {
      const response = await fetch(`/api/admissao/registrations/${registrationId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setUploadedDocuments(data)
        checkAllDocumentsUploaded(data)
      }
    } catch (error) {
      console.error('Error fetching uploaded documents:', error)
    }
  }

  const checkAllDocumentsUploaded = (uploaded: UploadedDocument[]) => {
    const requiredDocs = documents.filter(doc => doc.is_required)
    const uploadedRequired = requiredDocs.every(doc =>
      uploaded.some(uploaded => uploaded.document_id === doc.id && uploaded.status === 'approved')
    )
    setAllDocumentsUploaded(uploadedRequired && uploaded.length >= documents.length)
  }

  const handleFileUpload = async (documentId: number, file: File) => {
    if (!registrationId) return

    setUploading(prev => ({ ...prev, [documentId]: true }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('registration_id', registrationId.toString())
      formData.append('document_id', documentId.toString())

      const response = await fetch('/api/admissao/documents', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await fetchUploadedDocuments()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao fazer upload do documento')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Erro ao fazer upload do documento')
    } finally {
      setUploading(prev => ({ ...prev, [documentId]: false }))
    }
  }

  const handleFileChange = (documentId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(documentId, file)
    }
  }

  const getDocumentStatus = (documentId: number) => {
    const uploaded = uploadedDocuments.find(doc => doc.document_id === documentId)
    if (!uploaded) return null
    return uploaded
  }

  const handleContinue = () => {
    if (allDocumentsUploaded) {
      onComplete({ completed: true })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{step.name}</h2>
        <p className="text-muted-foreground">
          Envie os documentos solicitados. Você pode enviar um documento por vez.
        </p>
      </div>

      <div className="space-y-4">
        {documents.map((document) => {
          const uploaded = getDocumentStatus(document.id)
          const isUploading = uploading[document.id]

          return (
            <Card key={document.id} className="p-6 bg-card border-border">
              <div className="flex items-start justify-between gap-6">
                {/* Informações do documento à esquerda */}
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {document.name}
                      {document.is_required && <span className="text-destructive ml-1">*</span>}
                    </h3>
                    {document.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {document.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Formatos aceitos: {document.accepted_formats.join(', ').toUpperCase()}
                      {' • '}Tamanho máximo: {document.max_size_mb}MB
                    </p>
                  </div>

                  {uploaded && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Arquivo: <span className="font-medium text-foreground">{uploaded.file_name}</span>
                      </p>
                      {uploaded.status === 'rejected' && uploaded.rejection_reason && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertDescription>
                            <strong>Motivo da rejeição:</strong> {uploaded.rejection_reason}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>

                {/* Botão de envio e status à direita */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  {uploaded ? (
                    <>
                      {/* Status */}
                      <div className="flex items-center gap-2">
                        {uploaded.status === 'approved' ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-green-500 font-medium whitespace-nowrap">
                              Aprovado
                            </span>
                          </>
                        ) : uploaded.status === 'rejected' ? (
                          <>
                            <XCircle className="h-5 w-5 text-destructive" />
                            <span className="text-sm text-destructive font-medium whitespace-nowrap">
                              Rejeitado
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            <span className="text-sm text-yellow-500 font-medium whitespace-nowrap">
                              Aguardando análise
                            </span>
                          </>
                        )}
                      </div>

                      {/* Botão de reenvio/substituição */}
                      {(uploaded.status === 'rejected' || uploaded.status === 'pending') && (
                        <label className="inline-block">
                          <input
                            type="file"
                            accept={document.accepted_formats.map(f => `.${f}`).join(',')}
                            onChange={(e) => handleFileChange(document.id, e)}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                            className="cursor-pointer"
                            asChild
                          >
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              {isUploading ? 'Enviando...' : uploaded.status === 'rejected' ? 'Reenviar' : 'Substituir'}
                            </span>
                          </Button>
                        </label>
                      )}
                    </>
                  ) : (
                    <label className="inline-block">
                      <input
                        type="file"
                        accept={document.accepted_formats.map(f => `.${f}`).join(',')}
                        onChange={(e) => handleFileChange(document.id, e)}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        disabled={isUploading}
                        className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? 'Enviando...' : 'Enviar Documento'}
                        </span>
                      </Button>
                    </label>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {allDocumentsUploaded && (
        <Button
          onClick={handleContinue}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Continuar
        </Button>
      )}
    </div>
  )
}
