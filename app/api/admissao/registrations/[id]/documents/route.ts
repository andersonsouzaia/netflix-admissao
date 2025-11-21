import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    
    // Buscar documentos da inscrição
    const { data: documents, error: docsError } = await supabase
      .from('registration_documents')
      .select('*')
      .eq('registration_id', Number(resolvedParams.id))
      .order('uploaded_at', { ascending: false })

    if (docsError) {
      throw docsError
    }

    // Buscar informações dos documentos (step_documents)
    if (documents && documents.length > 0) {
      const documentIds = documents.map(doc => doc.document_id)
      const { data: stepDocuments } = await supabase
        .from('step_documents')
        .select('id, name, description')
        .in('id', documentIds)

      // Combinar dados
      const documentsWithInfo = documents.map(doc => {
        const stepDoc = stepDocuments?.find(sd => sd.id === doc.document_id)
        return {
          ...doc,
          document_name: stepDoc?.name,
          document_description: stepDoc?.description
        }
      })

      return NextResponse.json(documentsWithInfo)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching registration documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration documents' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const body = await request.json()
    const searchParams = request.nextUrl.searchParams
    const documentId = searchParams.get('document_id')

    if (!documentId) {
      return NextResponse.json(
        { error: 'document_id is required' },
        { status: 400 }
      )
    }

    const { status, rejection_reason } = body

    if (status === 'rejected' && !rejection_reason) {
      return NextResponse.json(
        { error: 'rejection_reason is required when status is rejected' },
        { status: 400 }
      )
    }

    const { data: document, error } = await supabase
      .from('registration_documents')
      .update({
        status,
        rejection_reason: rejection_reason || null,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', Number(documentId))
      .eq('registration_id', Number(resolvedParams.id))
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
}
