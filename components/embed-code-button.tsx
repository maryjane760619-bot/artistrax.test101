'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Code, Check } from 'lucide-react'

export function EmbedCodeButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  const embedUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/embed/label/${slug}`
  const snippet = `<iframe src="${embedUrl}" width="400" height="500" frameborder="0" style="border-radius:12px;"></iframe>`

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Code className="w-4 h-4 mr-2" />
          Get Embed Code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed your catalog</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Paste this snippet into your own website to show a live, clickable widget of your tracks on Artistrax.
        </p>
        <textarea
          readOnly
          value={snippet}
          rows={4}
          className="w-full text-xs font-mono p-3 rounded-md border border-border bg-muted/50"
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />
        <Button onClick={handleCopy} className="w-full">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied
            </>
          ) : (
            'Copy Code'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
