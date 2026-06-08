import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase.from('tracks').select('id, title, streaming_url, audio_url').limit(5)
  console.log(JSON.stringify({ tracks: data, error }, null, 2))
}
main()