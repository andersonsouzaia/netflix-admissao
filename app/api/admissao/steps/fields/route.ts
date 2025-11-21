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

    const { data: fields, error } = await supabase
      .from('step_fields')
      .select('*')
      .eq('step_id', Number(stepId))
      .order('order_index', { ascending: true })

    if (error) {
      throw error
    }

    // Parse JSON fields
    const parsedFields = (fields || []).map((field: any) => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : null,
      validation_rules: field.validation_rules ? JSON.parse(field.validation_rules) : null,
    }))

    return NextResponse.json(parsedFields)
  } catch (error) {
    console.error('Error fetching fields:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fields' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const body = await request.json()

    const { step_id, field_name, field_label, field_type, is_required, options, validation_rules, order_index } = body

    if (!step_id || !field_name || !field_label || !field_type || order_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: field, error } = await supabase
      .from('step_fields')
      .insert({
        step_id,
        field_name,
        field_label,
        field_type,
        is_required: is_required !== false,
        options: options ? JSON.stringify(options) : null,
        validation_rules: validation_rules ? JSON.stringify(validation_rules) : null,
        order_index
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(field, { status: 201 })
  } catch (error) {
    console.error('Error creating field:', error)
    return NextResponse.json(
      { error: 'Failed to create field' },
      { status: 500 }
    )
  }
}
