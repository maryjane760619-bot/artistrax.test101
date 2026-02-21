import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  return NextResponse.json({ stream: { id: params.id, title: 'Test Stream' } });
}

export async function PUT(request, { params }) {
  return NextResponse.json({ stream: { id: params.id, status: 'live' } });
}

export async function DELETE(request, { params }) {
  return NextResponse.json({ success: true });
}
