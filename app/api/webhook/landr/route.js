// LANDR Webhook Handler
// Receives notifications when mastering/preview is complete

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LANDR_API_KEY = process.env.LANDR_MASTERING_API_KEY;
const LANDR_API_URL = 'https://api.landr.com/mastering/v1';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Verify webhook signature
    const signature = request.headers.get('x-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }
    
    // Get webhook secret from database or env
    const webhookSecret = process.env.LANDR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('LANDR webhook secret not configured');
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }
    
    // Verify signature (HMAC/SHA-256)
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', Buffer.from(webhookSecret, 'base64'))
      .update(JSON.stringify(body))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Handle track.status event
    if (body.type === 'track.status') {
      const { trackId, status } = body.data;
      
      // Find job by LANDR track ID
      const { data: job } = await supabase
        .from('mastering_jobs')
        .select('*')
        .eq('landr_master_id', trackId)
        .single();

      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      if (status === 'completed') {
        // Get download URL
        const downloadResponse = await fetch(
          `${LANDR_API_URL}/master/single/${trackId}/download`,
          {
            headers: {
              'x-landr-mastering-api-key': LANDR_API_KEY
            }
          }
        );

        if (downloadResponse.ok) {
          const downloadData = await downloadResponse.json();
          
          await supabase
            .from('mastering_jobs')
            .update({
              status: 'completed',
              mastered_audio_url: downloadData.downloadUrl,
              completed_at: new Date().toISOString()
            })
            .eq('id', job.id);
        }
      } else if (status === 'failed') {
        await supabase
          .from('mastering_jobs')
          .update({
            status: 'failed',
            error_message: 'LANDR mastering failed'
          })
          .eq('id', job.id);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}