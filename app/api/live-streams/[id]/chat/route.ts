import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ messages: [] });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  return NextResponse.json({ message: { id: '1', stream_id: params.id, ...body } });
}
