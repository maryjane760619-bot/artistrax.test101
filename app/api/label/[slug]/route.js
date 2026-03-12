// Ultra simple label API
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { slug } = await params;
  
  // Static response for Siesta Records
  if (slug === 'siesta-records') {
    return NextResponse.json({
      label: {
        id: '60660d4f-5eaa-45c1-8705-d133bab4c124',
        name: 'Siesta Records',
        slug: 'siesta-records',
        description: 'Surf · Sound · Soul. Independent electronic music label from Encinitas, CA.',
        totalTracks: 18
      },
      tracks: [
        { id: '1', title: 'Test buy track 1a', artist: 'DJ Mary', price: 0.99, buyUrl: 'https://artistrax.com/track/1' },
        { id: '2', title: 'sell. human gazpacho - A Visit to Kali the Artificer Test 1', artist: 'DJ Mary', price: 1.99, buyUrl: 'https://artistrax.com/track/2' },
        { id: '3', title: 'Bertin - Test 1', artist: 'Bertin', price: 0.99, buyUrl: 'https://artistrax.com/track/3' }
      ]
    });
  }
  
  return NextResponse.json({ error: 'Label not found' }, { status: 404 });
}