import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDatabase()
    // Next.js 15+ pode passar params como Promise
    const resolvedParams = params instanceof Promise ? await params : params
    const courseId = Number(resolvedParams.id)
    
    const course = db
      .prepare('SELECT * FROM courses WHERE id = ?')
      .get(courseId) as any

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
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

    const { name, description, image_url, type, modality } = body

    db.prepare(
      'UPDATE courses SET name = ?, description = ?, image_url = ?, type = ?, modality = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(
      name || null,
      description || null,
      image_url || null,
      type || null,
      modality || null,
      Number(resolvedParams.id)
    )

    const course = db
      .prepare('SELECT * FROM courses WHERE id = ?')
      .get(Number(resolvedParams.id)) as any

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    db.prepare('DELETE FROM courses WHERE id = ?').run(Number(resolvedParams.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
