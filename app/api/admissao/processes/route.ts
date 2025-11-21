import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const unitId = searchParams.get('unit_id')
    const isActive = searchParams.get('is_active')

    let query = supabase.from('admission_processes').select('*')

    if (unitId) {
      query = query.eq('unit_id', Number(unitId))
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    query = query.order('created_at', { ascending: false })

    const { data: processes, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json(processes || [])
  } catch (error) {
    console.error('Error fetching processes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch processes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const body = await request.json()

    const { unit_id, name, description, is_active } = body

    if (!unit_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: process, error } = await supabase
      .from('admission_processes')
      .insert({
        unit_id,
        name,
        description: description || null,
        is_active: is_active !== false
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(process, { status: 201 })
  } catch (error) {
    console.error('Error creating process:', error)
    return NextResponse.json(
      { error: 'Failed to create process' },
      { status: 500 }
    )
  }
}
