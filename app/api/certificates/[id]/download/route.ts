import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

// GET - Baixar PDF do certificado
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getDatabase()

    const { data: certificate, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', parseInt(id))
      .single()

    if (error || !certificate || !certificate.pdf_path) {
      return NextResponse.json(
        { error: 'Certificado ou PDF não encontrado' },
        { status: 404 }
      )
    }

    let pdfBytes: Uint8Array

    // Verificar se é URL do Supabase Storage ou caminho local
    if (certificate.pdf_path.startsWith('http://') || certificate.pdf_path.startsWith('https://')) {
      // Buscar do Supabase Storage ou URL externa
      try {
        // Se for URL do Supabase Storage, extrair o nome do arquivo
        const urlParts = certificate.pdf_path.split('/')
        const fileName = urlParts[urlParts.length - 1]
        
        const { data, error: downloadError } = await supabase.storage
          .from('certificates')
          .download(fileName)

        if (downloadError || !data) {
          // Tentar buscar diretamente da URL
          const response = await fetch(certificate.pdf_path)
          if (!response.ok) {
            throw new Error('Failed to fetch PDF from URL')
          }
          const arrayBuffer = await response.arrayBuffer()
          pdfBytes = new Uint8Array(arrayBuffer)
        } else {
          const arrayBuffer = await data.arrayBuffer()
          pdfBytes = new Uint8Array(arrayBuffer)
        }
      } catch (fetchError) {
        console.error('Error fetching PDF from URL:', fetchError)
        throw new Error('Failed to download PDF from storage')
      }
    } else {
      // Caminho local (fallback para desenvolvimento)
      try {
        const pdfPath = join(process.cwd(), certificate.pdf_path)
        pdfBytes = readFileSync(pdfPath)
      } catch (fileError) {
        console.error('Error reading local PDF file:', fileError)
        return NextResponse.json(
          { error: 'PDF file not found' },
          { status: 404 }
        )
      }
    }

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado-${certificate.certificate_code}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error downloading certificate PDF:', error)
    return NextResponse.json(
      { 
        error: 'Failed to download certificate PDF',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
