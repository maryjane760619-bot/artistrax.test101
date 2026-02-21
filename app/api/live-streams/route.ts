import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ streams: [] });
}

export async function POST() {
  return NextResponse.json({ message: 'Created' });
}