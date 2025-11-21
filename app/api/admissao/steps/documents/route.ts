import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const stepId = searchParams.get('step_id')

    if (!stepId) {
      return NextResponse.json(
        { error: 'step_id is required' },
        { status: 400 }
      )
    }

    const { data: documents, error } = await supabase
      .from('step_documents')
      .select('*')
      .eq('step_id', Number(stepId))
      .order('order_index', { ascending: true })

    if (error) {
      throw error
    }

    // Parse JSON fields
    const parsedDocuments = (documents || []).map((doc: any) => ({
      ...doc,
      accepted_formats: doc.accepted_formats ? JSON.parse(doc.accepted_formats) : [],
    }))

    return NextResponse.json(parsedDocuments)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const body = await request.json()

    const { step_id, name, description, is_required, accepted_formats, max_size_mb, order_index } = body

    if (!step_id || !name || order_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: document, error } = await supabase
      .from('step_documents')
      .insert({
        step_id,
        name,
        description: description || null,
        is_required: is_required !== false,
        accepted_formats: accepted_formats ? JSON.stringify(accepted_formats) : null,
        max_size_mb: max_size_mb || 10,
        order_index
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
