import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const db = getDatabase()
    const resolvedParams = params instanceof Promise ? await params : params
    const process = db
      .prepare('SELECT * FROM admission_processes WHERE id = ?')
      .get(Number(resolvedParams.id)) as any

    if (!process) {
      return NextResponse.json(
        { error: 'Process not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(process)
  } catch (error) {
    console.error('Error fetching process:', error)
    return NextResponse.json(
      { error: 'Failed to fetch process' },
      { status: 500 }
    )
  }
}
