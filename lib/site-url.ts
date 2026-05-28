const FALLBACK = 'https://music-download-store-2.vercel.app'

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw && raw.startsWith('http')) return raw.replace(/\/$/, '')
  return FALLBACK
}
