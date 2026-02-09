'use client'

import { useEffect, useState } from 'react'
import { X, Download, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isInStandalone)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Only show prompt if not dismissed before and not on iOS
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed && !iOS) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show iOS prompt if on iOS and not standalone
    if (iOS && !isInStandalone) {
      const dismissed = localStorage.getItem('pwa-install-dismissed-ios')
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 2000) // Show after 2 seconds
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    if (isIOS) {
      localStorage.setItem('pwa-install-dismissed-ios', 'true')
    } else {
      localStorage.setItem('pwa-install-dismissed', 'true')
    }
  }

  // Don't show if already installed or dismissed
  if (!showPrompt || isStandalone) return null

  // iOS specific instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black to-black/95 backdrop-blur-lg border-t border-border p-4 md:p-6 safe-area-pb">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Install artistrax App</h3>
                  <p className="text-sm text-muted-foreground">Get the full app experience</p>
                </div>
              </div>
              
              <div className="bg-card/50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">To install on your iPhone:</p>
                <ol className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">1.</span>
                    <span>Tap the <Share className="w-4 h-4 inline mx-1" /> share button below</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">2.</span>
                    <span>Scroll and tap "Add to Home Screen"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">3.</span>
                    <span>Tap "Add" to install the app</span>
                  </li>
                </ol>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Android/Desktop Chrome prompt
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black to-black/95 backdrop-blur-lg border-t border-border p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Install artistrax</h3>
              <p className="text-sm text-muted-foreground">
                Get the app experience - faster, offline access, home screen icon
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="hidden sm:flex"
            >
              Not Now
            </Button>
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Install
            </Button>
          </div>
          
          <button
            onClick={handleDismiss}
            className="sm:hidden text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
