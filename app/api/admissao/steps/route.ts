import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const processId = searchParams.get('process_id')

    if (!processId) {
      return NextResponse.json(
        { error: 'process_id is required' },
        { status: 400 }
      )
    }

    const { data: steps, error } = await supabase
      .from('admission_steps')
      .select('*')
      .eq('process_id', Number(processId))
      .order('order_index', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json(steps || [])
  } catch (error) {
    console.error('Error fetching steps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch steps' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const body = await request.json()

    const { process_id, step_type, name, order_index, is_required, config } = body

    if (!process_id || !step_type || !name || order_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: step, error } = await supabase
      .from('admission_steps')
      .insert({
        process_id,
        step_type,
        name,
        order_index,
        is_required: is_required !== false,
        config: config ? JSON.stringify(config) : null
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(step, { status: 201 })
  } catch (error) {
    console.error('Error creating step:', error)
    return NextResponse.json(
      { error: 'Failed to create step' },
      { status: 500 }
    )
  }
}
