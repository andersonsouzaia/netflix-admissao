import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

// GET - Listar certificados
export async function GET(request: NextRequest) {
  try {
    const supabase = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')
    const registrationId = searchParams.get('registrationId')

    let query = supabase.from('certificates').select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (courseId) {
      query = query.eq('course_id', parseInt(courseId))
    }

    if (registrationId) {
      query = query.eq('registration_id', parseInt(registrationId))
    }

    query = query.order('issued_at', { ascending: false })

    const { data: certificates, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json(certificates || [])
  } catch (error: any) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch certificates',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
