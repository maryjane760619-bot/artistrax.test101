import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Test signed URL CORS/headers
  const filePath = "60660d4f-5eaa-45c1-8705-d133bab4c124/1772164115050-test-buy-track-1a.mp3"
  const { data: signedUrl } = await supabase.storage
    .from('audio')
    .createSignedUrl(filePath, 3600)

  if (signedUrl) {
    console.log("Signed URL:", signedUrl.signedUrl.substring(0, 100) + "...")
    
    // Check headers of signed URL
    const resp = await fetch(signedUrl.signedUrl, { method: 'HEAD' })
    console.log("\n=== Signed URL Headers ===")
    console.log("Status:", resp.status, resp.statusText)
    console.log("Content-Type:", resp.headers.get('content-type'))
    console.log("Content-Length:", resp.headers.get('content-length'))
    console.log("Accept-Ranges:", resp.headers.get('accept-ranges'))
    console.log("Access-Control-Allow-Origin:", resp.headers.get('access-control-allow-origin'))
    console.log("Cache-Control:", resp.headers.get('cache-control'))
  }

  // Also check CORS by fetching with origin header
  const testUrl = `https://wpsmgfulrugrsabgcdmp.supabase.co/storage/v1/object/public/audio/${filePath}`
  const corsResp = await fetch(testUrl, { 
    method: 'GET',
    headers: { 'Origin': 'https://music-download-store-2.vercel.app' }
  })
  console.log("\n=== CORS Test ===")
  console.log("Status:", corsResp.status)
  console.log("ACAO:", corsResp.headers.get('access-control-allow-origin'))
  console.log("ACAC:", corsResp.headers.get('access-control-allow-credentials'))
  console.log("Vary:", corsResp.headers.get('vary'))
}

main()