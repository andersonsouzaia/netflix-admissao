import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('course_id')

    let query = supabase.from('units').select('*')

    if (courseId) {
      query = query.eq('course_id', Number(courseId))
    }

    query = query.order('created_at', { ascending: false })

    const { data: units, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json(units || [])
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const body = await request.json()

    const { course_id, name, description } = body

    if (!course_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: unit, error } = await supabase
      .from('units')
      .insert({
        course_id,
        name,
        description: description || null
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json(
      { error: 'Failed to create unit' },
      { status: 500 }
    )
  }
}
