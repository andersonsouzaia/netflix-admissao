import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const registration = db
      .prepare('SELECT * FROM registrations WHERE id = ?')
      .get(Number(resolvedParams.id)) as any

    if (!registration) {
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
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const body = await request.json()

    const { status, current_step_id, submitted_at } = body

    const updates: string[] = []
    const values: any[] = []

    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
    }

    if (current_step_id !== undefined) {
      updates.push('current_step_id = ?')
      values.push(current_step_id)
    }

    if (submitted_at !== undefined) {
      updates.push('submitted_at = ?')
      values.push(submitted_at)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(Number(resolvedParams.id))

    const query = `UPDATE registrations SET ${updates.join(', ')} WHERE id = ?`
    db.prepare(query).run(...values)

    const registration = db
      .prepare('SELECT * FROM registrations WHERE id = ?')
      .get(Number(resolvedParams.id)) as any

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    )
  }
}
