import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const stepId = searchParams.get('step_id')

    if (!stepId) {
      return NextResponse.json(
        { error: 'step_id is required' },
        { status: 400 }
      )
    }

    const evaluations = db
      .prepare('SELECT * FROM step_evaluations WHERE step_id = ?')
      .all(Number(stepId))

    // Buscar módulos para cada avaliação
    const evaluationsWithModules = evaluations.map((evaluation: any) => {
      const modules = db
        .prepare('SELECT * FROM step_evaluation_modules WHERE evaluation_id = ? ORDER BY order_index ASC')
        .all(evaluation.id)
      return { ...evaluation, modules }
    })

    return NextResponse.json(evaluationsWithModules)
  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase()
    const body = await request.json()

    const { step_id, name, description, evaluation_type, location, date, instructions, time_limit_minutes } = body

    if (!step_id || !name || !evaluation_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = db
      .prepare(
        'INSERT INTO step_evaluations (step_id, name, description, evaluation_type, location, date, instructions, time_limit_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        step_id,
        name,
        description || null,
        evaluation_type,
        location || null,
        date || null,
        instructions || null,
        time_limit_minutes || null
      )

    const evaluation = db
      .prepare('SELECT * FROM step_evaluations WHERE id = ?')
      .get(result.lastInsertRowid) as any

    return NextResponse.json(evaluation, { status: 201 })
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    )
  }
}

