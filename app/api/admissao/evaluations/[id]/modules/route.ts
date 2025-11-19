import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const modules = db
      .prepare(
        'SELECT * FROM step_evaluation_modules WHERE evaluation_id = ? ORDER BY order_index ASC'
      )
      .all(Number(resolvedParams.id))

    return NextResponse.json(modules)
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
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const body = await request.json()

    const { name, content, order_index } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = db
      .prepare(
        `INSERT INTO step_evaluation_modules (evaluation_id, name, content, order_index)
         VALUES (?, ?, ?, ?)`
      )
      .run(Number(resolvedParams.id), name, content || null, order_index || 0)

    const module = db
      .prepare('SELECT * FROM step_evaluation_modules WHERE id = ?')
      .get(result.lastInsertRowid)

    return NextResponse.json(module, { status: 201 })
  } catch (error) {
    console.error('Error creating evaluation module:', error)
    return NextResponse.json(
      { error: 'Failed to create evaluation module' },
      { status: 500 }
    )
  }
}

