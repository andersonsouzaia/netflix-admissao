import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

// GET - Buscar configurações de certificado por curso
export async function GET(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      )
    }

    const { data: config, error } = await supabase
      .from('certificate_configs')
      .select('*')
      .eq('course_id', parseInt(courseId))
      .single()

    if (error || !config) {
      return NextResponse.json(null)
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching certificate config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certificate config' },
      { status: 500 }
    )
  }
}

// POST - Criar ou atualizar configuração de certificado
export async function POST(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const body = await request.json()

    const {
      courseId,
      backgroundImageUrl,
      backgroundImageWidth,
      backgroundImageHeight,
      title,
      subtitle,
      signatureLine,
    } = body

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      )
    }

    // Verificar se já existe configuração para este curso
    const { data: existing } = await supabase
      .from('certificate_configs')
      .select('id')
      .eq('course_id', parseInt(courseId))
      .single()

    const configData = {
      background_image_url: backgroundImageUrl || null,
      background_image_width: backgroundImageWidth || null,
      background_image_height: backgroundImageHeight || null,
      title: title || null,
      subtitle: subtitle || null,
      signature_line: signatureLine || null,
      updated_at: new Date().toISOString()
    }

    let result
    if (existing) {
      // Atualizar
      const { data: config, error } = await supabase
        .from('certificate_configs')
        .update(configData)
        .eq('course_id', parseInt(courseId))
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json(config)
    } else {
      // Criar novo
      const { data: config, error } = await supabase
        .from('certificate_configs')
        .insert({
          course_id: parseInt(courseId),
          ...configData
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json(config, { status: 201 })
    }
  } catch (error) {
    console.error('Error saving certificate config:', error)
    return NextResponse.json(
      { error: 'Failed to save certificate config' },
      { status: 500 }
    )
  }
}
