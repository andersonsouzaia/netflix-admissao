import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const searchParams = request.nextUrl.searchParams
    const stepId = searchParams.get('step_id')

    let query = 'SELECT * FROM registration_data WHERE registration_id = ?'
    const queryParams: any[] = [Number(resolvedParams.id)]

    if (stepId) {
      query += ' AND step_id = ?'
      queryParams.push(Number(stepId))
    }

    const data = db.prepare(query).all(...queryParams)

    return NextResponse.json(data)
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
    const db = getDatabase()
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
    db.prepare('DELETE FROM registration_data WHERE registration_id = ? AND step_id = ?')
      .run(Number(resolvedParams.id), step_id)

    // Inserir novos dados
    const insertStmt = db.prepare(
      'INSERT INTO registration_data (registration_id, step_id, field_name, field_value) VALUES (?, ?, ?, ?)'
    )

    const transaction = db.transaction((data: Record<string, any>) => {
      for (const [fieldName, fieldValue] of Object.entries(data)) {
        insertStmt.run(
          Number(resolvedParams.id),
          step_id,
          fieldName,
          typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue)
        )
      }
    })

    transaction(formData)

    const savedData = db
      .prepare('SELECT * FROM registration_data WHERE registration_id = ? AND step_id = ?')
      .all(Number(resolvedParams.id), step_id)

    return NextResponse.json(savedData, { status: 201 })
  } catch (error) {
    console.error('Error saving registration data:', error)
    return NextResponse.json(
      { error: 'Failed to save registration data' },
      { status: 500 }
    )
  }
}
