import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const registrationId = formData.get('registration_id') as string
    const documentId = formData.get('document_id') as string
    const file = formData.get('file') as File

    if (!registrationId || !documentId || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = getDatabase()

    // Verificar se o documento existe
    const document = db
      .prepare('SELECT * FROM step_documents WHERE id = ?')
      .get(Number(documentId)) as any

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Validar formato
    const acceptedFormats = document.accepted_formats 
      ? JSON.parse(document.accepted_formats) 
      : ['pdf', 'jpg', 'png']
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Formato não aceito. Formatos aceitos: ${acceptedFormats.join(', ')}` },
        { status: 400 }
      )
    }

    // Validar tamanho
    const maxSizeBytes = (document.max_size_mb || 10) * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Tamanho máximo: ${document.max_size_mb || 10}MB` },
        { status: 400 }
      )
    }

    // Criar diretório de uploads
    const uploadsDir = join(process.cwd(), 'uploads', 'documents')
    await mkdir(uploadsDir, { recursive: true })

    // Gerar nome único para o arquivo
    const uniqueName = `${randomBytes(16).toString('hex')}.${fileExtension}`
    const filePath = join(uploadsDir, uniqueName)

    // Salvar arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Salvar no banco de dados
    const result = db
      .prepare(
        'INSERT INTO registration_documents (registration_id, document_id, file_path, file_name, file_size, mime_type, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        Number(registrationId),
        Number(documentId),
        `/uploads/documents/${uniqueName}`,
        file.name,
        file.size,
        file.type,
        'pending'
      )

    const savedDocument = db
      .prepare('SELECT * FROM registration_documents WHERE id = ?')
      .get(result.lastInsertRowid) as any

    return NextResponse.json(savedDocument, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

