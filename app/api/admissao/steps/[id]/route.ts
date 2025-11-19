import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const step = db
      .prepare('SELECT * FROM admission_steps WHERE id = ?')
      .get(Number(resolvedParams.id)) as any

    if (!step) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      )
    }

    // Buscar dados relacionados baseado no tipo do passo
    if (step.step_type === 'complementary_data') {
      const fields = db
        .prepare('SELECT * FROM step_fields WHERE step_id = ? ORDER BY order_index ASC')
        .all(step.id)
      step.fields = fields
    } else if (step.step_type === 'documents') {
      const documents = db
        .prepare('SELECT * FROM step_documents WHERE step_id = ? ORDER BY order_index ASC')
        .all(step.id)
      step.documents = documents
    } else if (step.step_type === 'evaluation') {
      const evaluations = db
        .prepare('SELECT * FROM step_evaluations WHERE step_id = ?')
        .all(step.id)
      
      // Buscar módulos para cada avaliação
      for (const evaluation of evaluations) {
        const modules = db
          .prepare('SELECT * FROM step_evaluation_modules WHERE evaluation_id = ? ORDER BY order_index ASC')
          .all(evaluation.id)
        evaluation.modules = modules
      }
      
      step.evaluations = evaluations
    }

    return NextResponse.json(step)
  } catch (error) {
    console.error('Error fetching step:', error)
    return NextResponse.json(
      { error: 'Failed to fetch step' },
      { status: 500 }
    )
  }
}
