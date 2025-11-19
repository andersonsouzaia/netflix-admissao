import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const questions = db
      .prepare('SELECT * FROM step_evaluation_questions WHERE evaluation_id = ? ORDER BY order_index ASC')
      .all(Number(resolvedParams.id))

    // Parse JSON fields
    const parsedQuestions = questions.map((question: any) => ({
      ...question,
      options: question.options ? JSON.parse(question.options) : null,
      correct_answer: question.correct_answer ? JSON.parse(question.correct_answer) : null,
    }))

    return NextResponse.json(parsedQuestions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
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

    const { question_text, question_type, options, correct_answer, points, order_index } = body

    if (!question_text || !question_type || order_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = db
      .prepare(
        'INSERT INTO step_evaluation_questions (evaluation_id, question_text, question_type, options, correct_answer, points, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        Number(resolvedParams.id),
        question_text,
        question_type,
        options ? JSON.stringify(options) : null,
        correct_answer ? JSON.stringify(correct_answer) : null,
        points || 1.0,
        order_index
      )

    const question = db
      .prepare('SELECT * FROM step_evaluation_questions WHERE id = ?')
      .get(result.lastInsertRowid) as any

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}

