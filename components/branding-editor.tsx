'use client'

import { useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { ImageIcon, Loader2, Upload } from 'lucide-react'

interface BrandingEditorProps {
  table: 'labels' | 'artists'
  recordId: string
  logoUrl: string | null
  bannerUrl: string | null
  onUpdated: (urls: { logo_url?: string; banner_url?: string }) => void
  bannerOnly?: boolean
}

export function BrandingEditor({ table, recordId, logoUrl, bannerUrl, onUpdated, bannerOnly = false }: BrandingEditorProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [error, setError] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (
    file: File,
    kind: 'logo' | 'banner',
    column: 'logo_url' | 'avatar_url' | 'banner_url'
  ) => {
    setError('')
    const setUploading = kind === 'logo' ? setUploadingLogo : setUploadingBanner
    setUploading(true)

    try {
      const ext = file.name.split('.').pop()
      const path = `${recordId}/${Date.now()}-${kind}.${ext}`

      const { error: uploadError } = await supabase.storage.from('covers').upload(path, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('covers').getPublicUrl(path)

      const { error: updateError } = await supabase
        .from(table)
        .update({ [column]: data.publicUrl })
        .eq('id', recordId)
      if (updateError) throw updateError

      onUpdated({ [column === 'avatar_url' ? 'logo_url' : column]: data.publicUrl })
    } catch (err: any) {
      setError(err.message || `Failed to upload ${kind}`)
    } finally {
      setUploading(false)
    }
  }

  const logoColumn = table === 'artists' ? 'avatar_url' : 'logo_url'

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-1">{bannerOnly ? 'Profile Banner' : 'Branding'}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {bannerOnly
            ? 'A wide cover photo shown behind your profile on your public page.'
            : 'Your logo and banner appear on your public profile page.'}
        </p>

        {error && <p className="text-sm text-destructive mb-3">{error}</p>}

        <div className={bannerOnly ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-6'}>
          {/* Logo */}
          <div className={bannerOnly ? 'hidden' : ''}>
            <p className="text-sm font-medium mb-2">Logo</p>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-muted flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) uploadImage(file, 'logo', logoColumn)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
              >
                {uploadingLogo ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {logoUrl ? 'Change' : 'Upload'}
              </Button>
            </div>
          </div>

          {/* Banner */}
          <div>
            <p className="text-sm font-medium mb-2">Banner</p>
            <div className="flex items-center gap-4">
              <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="Banner" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) uploadImage(file, 'banner', 'banner_url')
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingBanner}
                onClick={() => bannerInputRef.current?.click()}
              >
                {uploadingBanner ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {bannerUrl ? 'Change' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
