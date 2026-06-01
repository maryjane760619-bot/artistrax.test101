// Debug endpoint to check database connection
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Check if we can connect
    const { data: version, error: connError } = await supabase
      .from('labels')
      .select('count')
      .limit(1);
    
    // List all tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');
    
    // Try to get labels
    const { data: labels, error: labelsError } = await supabase
      .from('labels')
      .select('*');
    
    return NextResponse.json({
      connection: connError ? 'failed' : 'ok',
      connectionError: connError?.message,
      tablesError: tablesError?.message,
      labelsError: labelsError?.message,
      labels: labels || [],
      labelCount: labels?.length || 0,
      env: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing'
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}
