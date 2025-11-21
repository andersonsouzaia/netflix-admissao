import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    
    const { data: documents, error } = await supabase
      .from('step_documents')
      .select('*')
      .eq('step_id', Number(resolvedParams.id))
      .order('order_index', { ascending: true })

    if (error) {
      throw error
    }

    // Parse JSON fields
    const parsedDocuments = (documents || []).map((doc: any) => {
      if (doc.accepted_formats) {
        try {
          doc.accepted_formats = JSON.parse(doc.accepted_formats)
        } catch (e) {
          doc.accepted_formats = []
        }
      }
      return doc
    })

    return NextResponse.json(parsedDocuments)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
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

    const { name, description, is_required, accepted_types, max_size_mb, order_index } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: document, error } = await supabase
      .from('step_documents')
      .insert({
        step_id: Number(resolvedParams.id),
        name,
        description: description || null,
        is_required: is_required !== undefined ? is_required : true,
        accepted_formats: accepted_types ? JSON.stringify(accepted_types) : null,
        max_size_mb: max_size_mb || 10,
        order_index: order_index || 0
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Parse JSON
    if (document.accepted_formats) {
      try {
        document.accepted_formats = JSON.parse(document.accepted_formats)
      } catch (e) {
        document.accepted_formats = []
      }
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
