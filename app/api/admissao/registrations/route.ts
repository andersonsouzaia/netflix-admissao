import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('user_id')
    const processId = searchParams.get('process_id')

    let query = 'SELECT * FROM registrations WHERE 1=1'
    const params: any[] = []

    if (userId) {
      query += ' AND user_id = ?'
      params.push(userId)
    }

    if (processId) {
      query += ' AND process_id = ?'
      params.push(Number(processId))
    }

    query += ' ORDER BY created_at DESC'

    const registrations = db.prepare(query).all(...params)

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase()
    const body = await request.json()

    const { process_id, user_id, current_step_id } = body

    if (!process_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma inscrição para este processo e usuário
    const existing = db
      .prepare('SELECT * FROM registrations WHERE process_id = ? AND user_id = ?')
      .get(process_id, user_id) as any

    if (existing) {
      return NextResponse.json(existing)
    }

    const result = db
      .prepare(
        'INSERT INTO registrations (process_id, user_id, current_step_id, status) VALUES (?, ?, ?, ?)'
      )
      .run(
        process_id,
        user_id,
        current_step_id || null,
        'in_progress'
      )

    const registration = db
      .prepare('SELECT * FROM registrations WHERE id = ?')
      .get(result.lastInsertRowid) as any

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}
