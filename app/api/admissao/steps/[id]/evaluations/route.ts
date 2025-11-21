import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    
    const { data: evaluations, error } = await supabase
      .from('step_evaluations')
      .select('*')
      .eq('step_id', Number(resolvedParams.id))
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json(evaluations || [])
  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const body = await request.json()

    const {
      name,
      description,
      type,
      location,
      date,
      instructions,
      duration_minutes,
      is_required,
      order_index,
    } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Mapear campos: type -> evaluation_type, duration_minutes -> time_limit_minutes
    const { data: evaluation, error } = await supabase
      .from('step_evaluations')
      .insert({
        step_id: Number(resolvedParams.id),
        name,
        description: description || null,
        evaluation_type: type,
        location: location || null,
        date: date || null,
        instructions: instructions || null,
        time_limit_minutes: duration_minutes || null
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(evaluation, { status: 201 })
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    )
  }
}
