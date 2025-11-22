import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const modality = searchParams.get('modality')

    let query = supabase.from('courses').select('*')

    if (type) {
      query = query.eq('type', type)
    }

    if (modality) {
      query = query.eq('modality', modality)
    }

    query = query.order('created_at', { ascending: false })

    const { data: courses, error } = await query

    if (error) {
      console.error('Supabase error fetching courses:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch courses',
          details: error.message || 'Database error',
          hint: 'Verifique se as políticas RLS estão configuradas e se há dados no banco'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(courses || [])
  } catch (error: any) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch courses',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const body = await request.json()

    const { name, description, image_url, type, modality } = body

    if (!name || !type || !modality) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        name,
        description: description || null,
        image_url: image_url || null,
        type,
        modality
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
