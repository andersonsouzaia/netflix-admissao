import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

// GET - Buscar certificado por ID
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

    if (error || !certificate) {
      return NextResponse.json(
        { error: 'Certificado não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(certificate)
  } catch (error) {
    console.error('Error fetching certificate:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
      { status: 500 }
    )
  }
}

// GET - Baixar PDF do certificado
export async function downloadPDF(
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

    const pdfPath = join(process.cwd(), certificate.pdf_path)
    const pdfBytes = readFileSync(pdfPath)

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado-${certificate.certificate_code}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error downloading certificate PDF:', error)
    return NextResponse.json(
      { error: 'Failed to download certificate PDF' },
      { status: 500 }
    )
  }
}
