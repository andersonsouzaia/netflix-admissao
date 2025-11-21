import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    
    const { data: modules, error } = await supabase
      .from('step_evaluation_modules')
      .select('*')
      .eq('evaluation_id', Number(resolvedParams.id))
      .order('order_index', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json(modules || [])
  } catch (error) {
    console.error('Error fetching evaluation modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluation modules' },
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

    const { name, content, order_index } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: module, error } = await supabase
      .from('step_evaluation_modules')
      .insert({
        evaluation_id: Number(resolvedParams.id),
        name,
        content: content || null,
        order_index: order_index || 0
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(module, { status: 201 })
  } catch (error) {
    console.error('Error creating evaluation module:', error)
    return NextResponse.json(
      { error: 'Failed to create evaluation module' },
      { status: 500 }
    )
  }
}
