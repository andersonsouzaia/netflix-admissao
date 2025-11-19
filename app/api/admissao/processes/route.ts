import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const unitId = searchParams.get('unit_id')
    const isActive = searchParams.get('is_active')

    let query = 'SELECT * FROM admission_processes WHERE 1=1'
    const params: any[] = []

    if (unitId) {
      query += ' AND unit_id = ?'
      params.push(Number(unitId))
    }

    if (isActive !== null) {
      query += ' AND is_active = ?'
      params.push(isActive === 'true' ? 1 : 0)
    }

    query += ' ORDER BY created_at DESC'

    const processes = db.prepare(query).all(...params)

    return NextResponse.json(processes)
  } catch (error) {
    console.error('Error fetching processes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch processes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase()
    const body = await request.json()

    const { unit_id, name, description, is_active } = body

    if (!unit_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = db
      .prepare(
        'INSERT INTO admission_processes (unit_id, name, description, is_active) VALUES (?, ?, ?, ?)'
      )
      .run(unit_id, name, description || null, is_active !== false ? 1 : 0)

    const process = db
      .prepare('SELECT * FROM admission_processes WHERE id = ?')
      .get(result.lastInsertRowid) as any

    return NextResponse.json(process, { status: 201 })
  } catch (error) {
    console.error('Error creating process:', error)
    return NextResponse.json(
      { error: 'Failed to create process' },
      { status: 500 }
    )
  }
}
