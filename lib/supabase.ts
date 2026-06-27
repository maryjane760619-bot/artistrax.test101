import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Falls back to a placeholder so module evaluation never throws during
// Next.js's build-time page-data-collection step (which can run before
// env vars are guaranteed available for every route). Real env vars are
// used at runtime whenever they're actually set.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Basic client for API routes (non-SSR)
// Note: For auth-protected API routes, import from supabase-server.ts instead
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Database types (will expand as we build)
export type Artist = {
  id: string
  email: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  subdomain: string | null
  created_at: string
  updated_at: string
}

export type Track = {
  id: string
  artist_id: string
  title: string
  slug: string
  audio_url: string
  cover_url: string | null
  duration: number | null
  file_size: number | null
  format: 'mp3' | 'flac' | 'wav'
  price: number
  is_free: boolean
  play_count: number
  download_count: number
  created_at: string
  updated_at: string
}

export type Download = {
  id: string
  track_id: string
  artist_id: string
  buyer_email: string | null
  buyer_id: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export type Purchase = {
  id: string
  track_id: string
  artist_id: string
  buyer_email: string
  buyer_id: string | null
  amount: number
  stripe_payment_id: string | null
  created_at: string
}
