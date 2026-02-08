import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ARTISTRAX_KNOWLEDGE } from '@/lib/ai-knowledge-base';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { message, userType } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'AI chat is not configured. Please contact support@artistrax.com',
          reply: 'Sorry, the AI assistant is currently unavailable. Please email support@artistrax.com for help!' 
        },
        { status: 200 }
      );
    }

    // Add user context to the system message
    let contextNote = '';
    if (userType === 'fan') {
      contextNote = '\nThe user is a FAN asking questions.';
    } else if (userType === 'artist') {
      contextNote = '\nThe user is an ARTIST asking questions.';
    } else if (userType === 'label') {
      contextNote = '\nThe user is a LABEL asking questions.';
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: ARTISTRAX_KNOWLEDGE + contextNote,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I had trouble generating a response.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get response',
        reply: 'Sorry, I encountered an error. Please try again or email support@artistrax.com for help.',
      },
      { status: 200 } // Return 200 so frontend can show error message
    );
  }
}
