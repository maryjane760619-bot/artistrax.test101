import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Export a function to create a new client instance (for API routes)
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
