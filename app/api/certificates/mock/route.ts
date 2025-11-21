import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { generateCertificatePDF, generateCertificateCode } from '@/lib/utils/certificate'

// POST - Gerar certificado mockado para testes
export async function POST(request: NextRequest) {
  try {
    const supabase = getDatabase()
    
    const body = await request.json()

    const { userId, studentName } = body

    if (!userId || !studentName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, studentName' },
        { status: 400 }
      )
    }

    // Criar curso mockado se não existir
    let { data: mockCourse } = await supabase
      .from('courses')
      .select('*')
      .eq('name', 'Curso de Teste - Certificado Mockado')
      .single()

    if (!mockCourse) {
      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          name: 'Curso de Teste - Certificado Mockado',
          description: 'Curso mockado para testes do sistema de certificados',
          type: 'livre',
          modality: 'ead'
        })
        .select()
        .single()

      if (courseError) {
        throw new Error(`Error creating mock course: ${courseError.message}`)
      }
      mockCourse = newCourse
    }

    // Criar inscrição mockada se não existir
    let { data: mockRegistration } = await supabase
      .from('registrations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .single()

    if (!mockRegistration) {
      // Criar unidade mockada
      let { data: mockUnit } = await supabase
        .from('units')
        .select('*')
        .eq('course_id', mockCourse.id)
        .single()

      if (!mockUnit) {
        const { data: newUnit, error: unitError } = await supabase
          .from('units')
          .insert({
            course_id: mockCourse.id,
            name: 'Unidade Mockada'
          })
          .select()
          .single()

        if (unitError) {
          throw new Error(`Error creating mock unit: ${unitError.message}`)
        }
        mockUnit = newUnit
      }

      // Criar processo mockado
      let { data: mockProcess } = await supabase
        .from('admission_processes')
        .select('*')
        .eq('unit_id', mockUnit.id)
        .single()

      if (!mockProcess) {
        const { data: newProcess, error: processError } = await supabase
          .from('admission_processes')
          .insert({
            unit_id: mockUnit.id,
            name: 'Processo Mockado',
            is_active: true
          })
          .select()
          .single()

        if (processError) {
          throw new Error(`Error creating mock process: ${processError.message}`)
        }
        mockProcess = newProcess
      }

      // Criar inscrição mockada
      const { data: newRegistration, error: registrationError } = await supabase
        .from('registrations')
        .insert({
          process_id: mockProcess.id,
          user_id: userId,
          status: 'approved',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (registrationError) {
        throw new Error(`Error creating mock registration: ${registrationError.message}`)
      }
      mockRegistration = newRegistration
    }

    // Verificar se já existe certificado mockado para este usuário
    const { data: existingCertificates } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', mockCourse.id)
      .like('certificate_code', 'MOCK-%')
    
    const existingCertificate = existingCertificates && existingCertificates.length > 0 
      ? existingCertificates[0] 
      : null

    if (existingCertificate) {
      // Retornar certificado existente
      return NextResponse.json(existingCertificate)
    }

    // Buscar configuração do certificado (ou usar padrão)
    const { data: config } = await supabase
      .from('certificate_configs')
      .select('*')
      .eq('course_id', mockCourse.id)
      .single()

    // Gerar código único e URL pública
    const certificateCode = `MOCK-${generateCertificateCode()}`
    // Usar a URL base do ambiente ou detectar automaticamente
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.DEPLOY_PRIME_URL || // Netlify
                    process.env.URL || // Netlify (alternativa)
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    'http://localhost:3000'
    const publicUrl = `${baseUrl}/certificados/validar/${certificateCode}`
    
    console.log('Mock certificate code:', certificateCode)
    console.log('Mock public URL:', publicUrl)

    // Gerar PDF do certificado
    const pdfBytes = await generateCertificatePDF({
      studentName,
      courseName: mockCourse.name,
      issuedAt: new Date(),
      certificateCode,
      publicUrl,
      backgroundImageUrl: config?.background_image_url,
      title: config?.title || 'CERTIFICADO',
      subtitle: config?.subtitle || 'de Conclusão de Curso',
      signatureLine: config?.signature_line || 'Diretor Geral',
    })

    // Upload PDF para Supabase Storage
    const pdfFileName = `certificate-${certificateCode}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(pdfFileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading PDF to storage:', uploadError)
      throw new Error(`Failed to upload certificate PDF: ${uploadError.message}`)
    }

    // Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('certificates')
      .getPublicUrl(pdfFileName)

    const pdfUrl = urlData?.publicUrl || `/api/certificates/${certificateCode}/download`

    // Salvar no banco de dados
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert({
        registration_id: mockRegistration.id,
        course_id: mockCourse.id,
        user_id: userId,
        certificate_code: certificateCode,
        public_url: publicUrl,
        student_name: studentName,
        course_name: mockCourse.name,
        pdf_path: pdfUrl
      })
      .select()
      .single()

    if (certError) {
      throw new Error(`Error saving certificate: ${certError.message}`)
    }

    return NextResponse.json(certificate, { status: 201 })
  } catch (error: any) {
    console.error('Error generating mock certificate:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate mock certificate',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
