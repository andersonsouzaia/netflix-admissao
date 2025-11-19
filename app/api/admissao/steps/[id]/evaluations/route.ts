import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const evaluations = db
      .prepare(
        'SELECT * FROM step_evaluations WHERE step_id = ? ORDER BY order_index ASC'
      )
      .all(Number(resolvedParams.id))

    return NextResponse.json(evaluations)
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
    const db = getDatabase()
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

    const result = db
      .prepare(
        `INSERT INTO step_evaluations (step_id, name, description, type, location, date, instructions, duration_minutes, is_required, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        Number(resolvedParams.id),
        name,
        description || null,
        type,
        location || null,
        date || null,
        instructions || null,
        duration_minutes || null,
        is_required !== undefined ? (is_required ? 1 : 0) : 1,
        order_index || 0
      )

    const evaluation = db
      .prepare('SELECT * FROM step_evaluations WHERE id = ?')
      .get(result.lastInsertRowid)

    return NextResponse.json(evaluation, { status: 201 })
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    )
  }
}

