'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, Save } from 'lucide-react'
import { MIN_BACKGROUND_WIDTH, MIN_BACKGROUND_HEIGHT } from '@/lib/utils/certificate'

interface CertificateConfig {
  id?: number
  course_id: number
  background_image_url?: string
  background_image_width?: number
  background_image_height?: number
  title?: string
  subtitle?: string
  signature_line?: string
}

export default function ConfigureCertificatePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<CertificateConfig>({
    course_id: parseInt(courseId),
    title: 'CERTIFICADO',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch(`/api/certificates/configs?courseId=${courseId}`)
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setConfig(data)
            if (data.background_image_url) {
              // Se for caminho relativo, adicionar prefixo da API
              const imageUrl = data.background_image_url.startsWith('/')
                ? `/api${data.background_image_url}`
                : data.background_image_url
              setImagePreview(imageUrl)
            }
          }
        }
      } catch (error) {
        console.error('Error loading config:', error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      loadConfig()
    }
  }, [courseId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione um arquivo de imagem',
          variant: 'destructive',
        })
        return
      }

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: 'A imagem deve ter no máximo 10MB',
          variant: 'destructive',
        })
        return
      }

      setImageFile(file)

      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const img = new Image()
        img.onload = () => {
          // Validar dimensões mínimas
          if (img.width < MIN_BACKGROUND_WIDTH || img.height < MIN_BACKGROUND_HEIGHT) {
            toast({
              title: 'Aviso',
              description: `A imagem deve ter no mínimo ${MIN_BACKGROUND_WIDTH}x${MIN_BACKGROUND_HEIGHT} pixels (A4 paisagem em 72dpi)`,
              variant: 'destructive',
            })
          }
          setImagePreview(reader.result as string)
          setConfig((prev) => ({
            ...prev,
            background_image_width: img.width,
            background_image_height: img.height,
          }))
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let backgroundImageUrl = config.background_image_url

      // Upload da imagem se houver
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('courseId', courseId)

        const uploadResponse = await fetch('/api/certificates/configs/upload', {
          method: 'POST',
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          backgroundImageUrl = uploadData.url
        } else {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Erro ao fazer upload da imagem')
        }
      }

      // Salvar configuração
      const response = await fetch('/api/certificates/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          backgroundImageUrl,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Configuração do certificado salva com sucesso',
        })
        router.refresh()
      } else {
        throw new Error('Erro ao salvar configuração')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração do certificado',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Configurar Certificado</CardTitle>
            <CardDescription>
              Configure as opções de personalização do certificado para este curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Imagem de Fundo */}
              <div className="space-y-2">
                <Label htmlFor="backgroundImage">Imagem de Fundo</Label>
                <div className="space-y-2">
                  <Input
                    id="backgroundImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    Tamanho mínimo: {MIN_BACKGROUND_WIDTH}x{MIN_BACKGROUND_HEIGHT} pixels (A4
                    paisagem em 72dpi)
                  </p>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full h-auto border rounded"
                        style={{ maxHeight: '300px' }}
                      />
                      {config.background_image_width && config.background_image_height && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Dimensões: {config.background_image_width}x{config.background_image_height} pixels
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título do Certificado</Label>
                <Input
                  id="title"
                  value={config.title || ''}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="CERTIFICADO"
                />
              </div>

              {/* Subtítulo */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
                <Input
                  id="subtitle"
                  value={config.subtitle || ''}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  placeholder="Ex: de Conclusão de Curso"
                />
              </div>

              {/* Linha de Assinatura */}
              <div className="space-y-2">
                <Label htmlFor="signatureLine">Linha de Assinatura (opcional)</Label>
                <Input
                  id="signatureLine"
                  value={config.signature_line || ''}
                  onChange={(e) => setConfig({ ...config, signature_line: e.target.value })}
                  placeholder="Ex: Diretor Geral"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configuração
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

