import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

// GET - Validar certificado pelo código (público)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    // Next.js 15+ pode passar params como Promise
    const resolvedParams = params instanceof Promise ? await params : params
    const code = resolvedParams.code
    
    console.log('Validating certificate code:', code)
    
    if (!code) {
      return NextResponse.json(
        { error: 'Código do certificado não fornecido', valid: false },
        { status: 400 }
      )
    }

    const supabase = getDatabase()

    const { data: certificate, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_code', code)
      .single()

    console.log('Certificate found:', certificate ? 'Yes' : 'No')

    if (error || !certificate) {
      return NextResponse.json(
        { error: 'Certificado não encontrado', valid: false },
        { status: 404 }
      )
    }

    // Retornar informações públicas do certificado
    return NextResponse.json({
      valid: true,
      studentName: certificate.student_name,
      courseName: certificate.course_name,
      issuedAt: certificate.issued_at,
      certificateCode: certificate.certificate_code,
    })
  } catch (error: any) {
    console.error('Error validating certificate:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { 
        error: 'Failed to validate certificate', 
        valid: false,
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}
