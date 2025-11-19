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
      .prepare(
        'SELECT * FROM step_documents WHERE step_id = ? ORDER BY order_index ASC'
      )
      .all(Number(resolvedParams.id))

    // Parse JSON fields
    const parsedDocuments = documents.map((doc: any) => {
      if (doc.accepted_types) {
        try {
          doc.accepted_types = JSON.parse(doc.accepted_types)
        } catch (e) {
          doc.accepted_types = []
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
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const body = await request.json()

    const { name, description, is_required, accepted_types, max_size_mb, order_index } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = db
      .prepare(
        `INSERT INTO step_documents (step_id, name, description, is_required, accepted_types, max_size_mb, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        Number(resolvedParams.id),
        name,
        description || null,
        is_required !== undefined ? (is_required ? 1 : 0) : 1,
        accepted_types ? JSON.stringify(accepted_types) : null,
        max_size_mb || 10,
        order_index || 0
      )

    const document = db
      .prepare('SELECT * FROM step_documents WHERE id = ?')
      .get(result.lastInsertRowid)

    // Parse JSON
    if (document.accepted_types) {
      try {
        document.accepted_types = JSON.parse(document.accepted_types)
      } catch (e) {
        document.accepted_types = []
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

