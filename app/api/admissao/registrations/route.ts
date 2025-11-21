import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('user_id')
    const processId = searchParams.get('process_id')

    let query = supabase.from('registrations').select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (processId) {
      query = query.eq('process_id', Number(processId))
    }

    query = query.order('created_at', { ascending: false })

    const { data: registrations, error } = await query

    if (error) {
      console.error('Supabase error fetching registrations:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch registrations',
          details: error.message || 'Database error'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(registrations || [])
  } catch (error: any) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch registrations',
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

    const { process_id, user_id, current_step_id } = body

    if (!process_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma inscrição para este processo e usuário
    const { data: existing } = await supabase
      .from('registrations')
      .select('*')
      .eq('process_id', process_id)
      .eq('user_id', user_id)
      .single()

    if (existing) {
      return NextResponse.json(existing)
    }

    const { data: registration, error } = await supabase
      .from('registrations')
      .insert({
        process_id,
        user_id,
        current_step_id: current_step_id || null,
        status: 'in_progress'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}
