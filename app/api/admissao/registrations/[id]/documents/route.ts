import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const documents = db
      .prepare(`
        SELECT rd.*, sd.name as document_name, sd.description as document_description
        FROM registration_documents rd
        JOIN step_documents sd ON rd.document_id = sd.id
        WHERE rd.registration_id = ?
        ORDER BY rd.uploaded_at DESC
      `)
      .all(Number(resolvedParams.id))

    return NextResponse.json(documents)
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
    const db = getDatabase()
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

    db.prepare(
      'UPDATE registration_documents SET status = ?, rejection_reason = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ? AND registration_id = ?'
    ).run(
      status,
      rejection_reason || null,
      Number(documentId),
      Number(resolvedParams.id)
    )

    const document = db
      .prepare('SELECT * FROM registration_documents WHERE id = ? AND registration_id = ?')
      .get(Number(documentId), Number(resolvedParams.id)) as any

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
}
