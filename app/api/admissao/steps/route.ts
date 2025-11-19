import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const processId = searchParams.get('process_id')

    if (!processId) {
      return NextResponse.json(
        { error: 'process_id is required' },
        { status: 400 }
      )
    }

    const steps = db
      .prepare('SELECT * FROM admission_steps WHERE process_id = ? ORDER BY order_index ASC')
      .all(Number(processId))

    return NextResponse.json(steps)
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
    const db = getDatabase()
    const body = await request.json()

    const { process_id, step_type, name, order_index, is_required, config } = body

    if (!process_id || !step_type || !name || order_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = db
      .prepare(
        'INSERT INTO admission_steps (process_id, step_type, name, order_index, is_required, config) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(
        process_id,
        step_type,
        name,
        order_index,
        is_required !== false ? 1 : 0,
        config ? JSON.stringify(config) : null
      )

    const step = db
      .prepare('SELECT * FROM admission_steps WHERE id = ?')
      .get(result.lastInsertRowid) as any

    return NextResponse.json(step, { status: 201 })
  } catch (error) {
    console.error('Error creating step:', error)
    return NextResponse.json(
      { error: 'Failed to create step' },
      { status: 500 }
    )
  }
}
