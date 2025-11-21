import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const stepId = searchParams.get('step_id')

    if (!stepId) {
      return NextResponse.json(
        { error: 'step_id is required' },
        { status: 400 }
      )
    }

    const { data: evaluations, error } = await supabase
      .from('step_evaluations')
      .select('*')
      .eq('step_id', Number(stepId))

    if (error) {
      throw error
    }

    // Buscar módulos para cada avaliação
    const evaluationsWithModules = await Promise.all(
      (evaluations || []).map(async (evaluation: any) => {
        const { data: modules } = await supabase
          .from('step_evaluation_modules')
          .select('*')
          .eq('evaluation_id', evaluation.id)
          .order('order_index', { ascending: true })
        return { ...evaluation, modules: modules || [] }
    })
    )

    return NextResponse.json(evaluationsWithModules)
  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const body = await request.json()

    const { step_id, name, description, evaluation_type, location, date, instructions, time_limit_minutes } = body

    if (!step_id || !name || !evaluation_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: evaluation, error } = await supabase
      .from('step_evaluations')
      .insert({
        step_id,
        name,
        description: description || null,
        evaluation_type,
        location: location || null,
        date: date || null,
        instructions: instructions || null,
        time_limit_minutes: time_limit_minutes || null
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
