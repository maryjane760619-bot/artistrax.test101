import { NextRequest, NextResponse } from 'next/server';
import {
  sendFanWelcomeEmail,
  sendArtistWelcomeEmail,
  sendLabelWelcomeEmail,
} from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { accountType, name, email, username, slug } = await request.json();

    if (!accountType || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send appropriate welcome email based on account type
    switch (accountType) {
      case 'fan':
        await sendFanWelcomeEmail(name, email);
        break;

      case 'artist':
        if (!username) {
          return NextResponse.json(
            { error: 'Username required for artist' },
            { status: 400 }
          );
        }
        await sendArtistWelcomeEmail(name, email, username);
        break;

      case 'label':
        if (!slug) {
          return NextResponse.json(
            { error: 'Slug required for label' },
            { status: 400 }
          );
        }
        await sendLabelWelcomeEmail(name, email, slug);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid account type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
