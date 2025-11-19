import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('course_id')

    let query = 'SELECT * FROM units WHERE 1=1'
    const params: any[] = []

    if (courseId) {
      query += ' AND course_id = ?'
      params.push(Number(courseId))
    }

    query += ' ORDER BY created_at DESC'

    const units = db.prepare(query).all(...params)

    return NextResponse.json(units)
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase()
    const body = await request.json()

    const { course_id, name, description } = body

    if (!course_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = db
      .prepare(
        'INSERT INTO units (course_id, name, description) VALUES (?, ?, ?)'
      )
      .run(course_id, name, description || null)

    const unit = db
      .prepare('SELECT * FROM units WHERE id = ?')
      .get(result.lastInsertRowid) as any

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json(
      { error: 'Failed to create unit' },
      { status: 500 }
    )
  }
}
