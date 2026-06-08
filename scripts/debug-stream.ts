import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Test 1: Check if bucket 'audio' exists and list files
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
  console.log("=== Buckets ===")
  console.log(JSON.stringify(buckets, null, 2))
  if (bucketError) console.log("Bucket error:", bucketError)

  // Test 2: Try creating a signed URL
  const filePath = "60660d4f-5eaa-45c1-8705-d133bab4c124/1772164115050-test-buy-track-1a.mp3"
  const { data: signedUrl, error: signedError } = await supabase.storage
    .from('audio')
    .createSignedUrl(filePath, 3600)

  console.log("\n=== Signed URL ===")
  console.log(JSON.stringify({ signedUrl, signedError }, null, 2))

  // Test 3: Try to directly fetch the file (public bucket should work)
  const publicUrl = `https://wpsmgfulrugrsabgcdmp.supabase.co/storage/v1/object/public/audio/${filePath}`
  console.log("\n=== Public URL test ===")
  console.log("URL:", publicUrl)
  try {
    const response = await fetch(publicUrl)
    console.log("Status:", response.status, response.statusText)
    console.log("Content-Type:", response.headers.get('content-type'))
    console.log("Content-Length:", response.headers.get('content-length'))
    const text = await response.text()
    console.log("First 200 chars:", text.substring(0, 200))
  } catch (e: any) {
    console.log("Fetch error:", e.message)
  }
}

main()