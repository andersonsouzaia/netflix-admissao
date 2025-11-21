import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { MIN_BACKGROUND_WIDTH, MIN_BACKGROUND_HEIGHT } from '@/lib/utils/certificate'

// Função para ler dimensões da imagem (fallback se sharp não estiver disponível)
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  try {
    // Tentar usar sharp se disponível
    const sharp = require('sharp')
    const metadata = await sharp(buffer).metadata()
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    }
  } catch (error) {
    // Fallback: tentar ler manualmente para PNG e JPEG
    // PNG: bytes 16-23 contêm width e height (big-endian)
    // JPEG: mais complexo, precisa procurar SOF markers
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      // PNG
      const width = buffer.readUInt32BE(16)
      const height = buffer.readUInt32BE(20)
      return { width, height }
    } else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      // JPEG - procurar SOF marker
      let i = 2
      while (i < buffer.length - 8) {
        if (buffer[i] === 0xff && buffer[i + 1] >= 0xc0 && buffer[i + 1] <= 0xc3) {
          const height = buffer.readUInt16BE(i + 5)
          const width = buffer.readUInt16BE(i + 7)
          return { width, height }
        }
        i++
      }
    }
    return { width: 0, height: 0 }
  }
}

// POST - Upload de imagem de fundo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const courseId = formData.get('courseId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Ler arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Verificar dimensões
    const { width, height } = await getImageDimensions(buffer)

    // Validar dimensões mínimas
    if (width > 0 && height > 0) {
      if (width < MIN_BACKGROUND_WIDTH || height < MIN_BACKGROUND_HEIGHT) {
        return NextResponse.json(
          {
            error: `Image dimensions must be at least ${MIN_BACKGROUND_WIDTH}x${MIN_BACKGROUND_HEIGHT} pixels`,
            width,
            height,
          },
          { status: 400 }
        )
      }
    }

    // Criar diretório de uploads se não existir
    const uploadsDir = join(process.cwd(), 'uploads', 'certificates', 'backgrounds')
    mkdirSync(uploadsDir, { recursive: true })

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop()
    const fileName = `background-${courseId}-${Date.now()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Salvar arquivo
    writeFileSync(filePath, buffer)

    // Retornar URL relativa
    const url = `/uploads/certificates/backgrounds/${fileName}`

    return NextResponse.json({
      url,
      width,
      height,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

