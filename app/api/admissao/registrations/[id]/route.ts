import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    
    const { data: registration, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', Number(resolvedParams.id))
      .single()

    if (error || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error fetching registration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const body = await request.json()

    const { status, current_step_id, submitted_at } = body

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (status !== undefined) {
      updates.status = status
    }

    if (current_step_id !== undefined) {
      updates.current_step_id = current_step_id
    }

    if (submitted_at !== undefined) {
      updates.submitted_at = submitted_at
    }

    const { data: registration, error } = await supabase
      .from('registrations')
      .update(updates)
      .eq('id', Number(resolvedParams.id))
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    )
  }
}
