import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { generateCertificatePDF, generateCertificateCode } from '@/lib/utils/certificate'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// POST - Gerar certificado
export async function POST(request: NextRequest) {
  try {
    const supabase = getDatabase()
    
    const body = await request.json()

    const { registrationId, courseId, userId, studentName } = body

    if (!registrationId || !courseId || !userId || !studentName) {
      return NextResponse.json(
        { error: 'Missing required fields: registrationId, courseId, userId, studentName' },
        { status: 400 }
      )
    }

    // Buscar informações do curso
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', parseInt(courseId))
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Buscar configuração do certificado
    const { data: config } = await supabase
      .from('certificate_configs')
      .select('*')
      .eq('course_id', parseInt(courseId))
      .single()

    // Gerar código único e URL pública
    const certificateCode = generateCertificateCode()
    // Usar a URL base do ambiente ou detectar automaticamente
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    'http://localhost:3000'
    const publicUrl = `${baseUrl}/certificados/validar/${certificateCode}`
    
    console.log('Certificate code:', certificateCode)
    console.log('Public URL:', publicUrl)

    // Gerar PDF do certificado
    const pdfBytes = await generateCertificatePDF({
      studentName,
      courseName: course.name,
      issuedAt: new Date(),
      certificateCode,
      publicUrl,
      backgroundImageUrl: config?.background_image_url,
      title: config?.title,
      subtitle: config?.subtitle,
      signatureLine: config?.signature_line,
    })

    // Salvar PDF no sistema de arquivos
    const uploadsDir = join(process.cwd(), 'uploads', 'certificates')
    mkdirSync(uploadsDir, { recursive: true })
    
    const pdfFileName = `certificate-${certificateCode}.pdf`
    const pdfPath = join(uploadsDir, pdfFileName)
    writeFileSync(pdfPath, pdfBytes)

    // Salvar no banco de dados
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert({
        registration_id: parseInt(registrationId),
        course_id: parseInt(courseId),
        user_id: userId,
        certificate_code: certificateCode,
        public_url: publicUrl,
        student_name: studentName,
        course_name: course.name,
        pdf_path: `/uploads/certificates/${pdfFileName}`
      })
      .select()
      .single()

    if (certError) {
      throw new Error(`Error saving certificate: ${certError.message}`)
    }

    return NextResponse.json(certificate, { status: 201 })
  } catch (error: any) {
    console.error('Error generating certificate:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate certificate',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
