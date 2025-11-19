import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const modality = searchParams.get('modality')

    let query = 'SELECT * FROM courses WHERE 1=1'
    const params: any[] = []

    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }

    if (modality) {
      query += ' AND modality = ?'
      params.push(modality)
    }

    query += ' ORDER BY created_at DESC'

    const courses = db.prepare(query).all(...params)

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase()
    const body = await request.json()

    const { name, description, image_url, type, modality } = body

    if (!name || !type || !modality) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = db
      .prepare(
        'INSERT INTO courses (name, description, image_url, type, modality) VALUES (?, ?, ?, ?, ?)'
      )
      .run(name, description || null, image_url || null, type, modality)

    const course = db
      .prepare('SELECT * FROM courses WHERE id = ?')
      .get(result.lastInsertRowid) as any

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
