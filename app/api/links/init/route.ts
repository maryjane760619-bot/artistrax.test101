import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const status: any = { table: 'unknown', links_api: 'unknown', error: null }
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    
    // Test query
    const { data, error } = await supabase.from('social_links').select('id').limit(1)
    
    if (error) {
      status.table = 'missing'
      status.error = error.message
      // Try with service role
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      if (serviceKey) {
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          serviceKey
        )
        const { error: adminError } = await admin.from('social_links').select('id').limit(1)
        if (adminError && adminError.message?.includes('does not exist')) {
          status.table = 'missing_confirmed'
          status.fix_url = 'https://supabase.com/dashboard/project/' + 
            (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace('https://', '').split('.')[0] + 
            '/sql/new'
          status.sql_file = 'supabase-links-schema.sql'
        }
      }
    } else {
      status.table = 'exists'
      status.row_count = data?.length || 0
    }
    
    // Test the links API directly
    const linksRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/links?artistId=test`
    ).catch(() => null)
    status.links_api = linksRes?.status || 'unreachable'
    
  } catch (err: any) {
    status.error = err.message
  }
  
  return NextResponse.json(status, { status: status.table === 'missing_confirmed' ? 200 : 200 })
}