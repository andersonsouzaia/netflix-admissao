import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const fields = db
      .prepare(
        'SELECT * FROM step_fields WHERE step_id = ? ORDER BY order_index ASC'
      )
      .all(Number(resolvedParams.id))

    // Parse JSON fields
    const parsedFields = fields.map((field: any) => {
      if (field.options) {
        try {
          field.options = JSON.parse(field.options)
        } catch (e) {
          field.options = null
        }
      }
      if (field.validation_rules) {
        try {
          field.validation_rules = JSON.parse(field.validation_rules)
        } catch (e) {
          field.validation_rules = null
        }
      }
      return field
    })

    return NextResponse.json(parsedFields)
  } catch (error) {
    console.error('Error fetching fields:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fields' },
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

    const { name, label, type, is_required, options, validation_rules, order_index } = body

    if (!name || !label || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = db
      .prepare(
        `INSERT INTO step_fields (step_id, name, label, type, is_required, options, validation_rules, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        Number(resolvedParams.id),
        name,
        label,
        type,
        is_required !== undefined ? (is_required ? 1 : 0) : 0,
        options ? JSON.stringify(options) : null,
        validation_rules ? JSON.stringify(validation_rules) : null,
        order_index || 0
      )

    const field = db
      .prepare('SELECT * FROM step_fields WHERE id = ?')
      .get(result.lastInsertRowid)

    // Parse JSON fields
    if (field.options) {
      try {
        field.options = JSON.parse(field.options)
      } catch (e) {
        field.options = null
      }
    }
    if (field.validation_rules) {
      try {
        field.validation_rules = JSON.parse(field.validation_rules)
      } catch (e) {
        field.validation_rules = null
      }
    }

    return NextResponse.json(field, { status: 201 })
  } catch (error) {
    console.error('Error creating field:', error)
    return NextResponse.json(
      { error: 'Failed to create field' },
      { status: 500 }
    )
  }
}

