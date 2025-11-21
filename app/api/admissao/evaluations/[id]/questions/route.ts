import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    
    const { data: questions, error } = await supabase
      .from('step_evaluation_questions')
      .select('*')
      .eq('evaluation_id', Number(resolvedParams.id))
      .order('order_index', { ascending: true })

    if (error) {
      throw error
    }

    // Parse JSON fields
    const parsedQuestions = (questions || []).map((question: any) => ({
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
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const body = await request.json()

    const { question_text, question_type, options, correct_answer, points, order_index } = body

    if (!question_text || !question_type || order_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: question, error } = await supabase
      .from('step_evaluation_questions')
      .insert({
        evaluation_id: Number(resolvedParams.id),
        question_text,
        question_type,
        options: options ? JSON.stringify(options) : null,
        correct_answer: correct_answer ? JSON.stringify(correct_answer) : null,
        points: points || 1.0,
        order_index
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
