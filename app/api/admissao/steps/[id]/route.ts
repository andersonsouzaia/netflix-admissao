import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    
    const { data: step, error } = await supabase
      .from('admission_steps')
      .select('*')
      .eq('id', Number(resolvedParams.id))
      .single()

    if (error || !step) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      )
    }

    // Buscar dados relacionados baseado no tipo do passo
    if (step.step_type === 'complementary_data') {
      const { data: fields } = await supabase
        .from('step_fields')
        .select('*')
        .eq('step_id', step.id)
        .order('order_index', { ascending: true })
      step.fields = fields || []
    } else if (step.step_type === 'documents') {
      const { data: documents } = await supabase
        .from('step_documents')
        .select('*')
        .eq('step_id', step.id)
        .order('order_index', { ascending: true })
      step.documents = documents || []
    } else if (step.step_type === 'evaluation') {
      const { data: evaluations } = await supabase
        .from('step_evaluations')
        .select('*')
        .eq('step_id', step.id)
      
      // Buscar módulos para cada avaliação
      if (evaluations) {
      for (const evaluation of evaluations) {
          const { data: modules } = await supabase
            .from('step_evaluation_modules')
            .select('*')
            .eq('evaluation_id', evaluation.id)
            .order('order_index', { ascending: true })
          evaluation.modules = modules || []
        }
      }
      
      step.evaluations = evaluations || []
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
