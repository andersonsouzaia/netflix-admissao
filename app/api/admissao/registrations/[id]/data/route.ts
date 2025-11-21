import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const searchParams = request.nextUrl.searchParams
    const stepId = searchParams.get('step_id')

    let query = supabase
      .from('registration_data')
      .select('*')
      .eq('registration_id', Number(resolvedParams.id))

    if (stepId) {
      query = query.eq('step_id', Number(stepId))
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching registration data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration data' },
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

    const { step_id, data: formData } = body

    if (!step_id || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Deletar dados existentes para este passo
    await supabase
      .from('registration_data')
      .delete()
      .eq('registration_id', Number(resolvedParams.id))
      .eq('step_id', step_id)

    // Preparar dados para inserção
    const dataToInsert = Object.entries(formData).map(([fieldName, fieldValue]) => ({
      registration_id: Number(resolvedParams.id),
      step_id,
      field_name: fieldName,
      field_value: typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue)
    }))

    // Inserir novos dados
    const { data: savedData, error } = await supabase
      .from('registration_data')
      .insert(dataToInsert)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json(savedData || [], { status: 201 })
  } catch (error) {
    console.error('Error saving registration data:', error)
    return NextResponse.json(
      { error: 'Failed to save registration data' },
      { status: 500 }
    )
  }
}
