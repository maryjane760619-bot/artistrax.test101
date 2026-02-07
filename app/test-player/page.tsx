'use client'

import { AudioPlayer } from '@/components/audio-player'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'

const testTracks = [
  {
    id: '1',
    title: 'A Visit to Kali the Artificer',
    artist: 'human gazpacho',
    audioUrl: '/audio/human gazpacho - A Visit to Kali the Artificer.mp3',
  },
  {
    id: '2',
    title: 'Waiting Becomes Not Waiting',
    artist: 'Heather Perkins',
    audioUrl: '/audio/Heather Perkins - Waiting Becomes Not Waiting.mp3',
  },
  {
    id: '3',
    title: "Varnyr's Room",
    artist: 'human gazpacho',
    audioUrl: '/audio/human gazpacho - Varnyr\'s Room.mp3',
  },
  {
    id: '4',
    title: 'A Gentle Fog Descends',
    artist: 'Brylie Christopher',
    audioUrl: '/audio/Brylie Christopher - A Gentle Fog Descends.mp3',
  },
]

export default function TestPlayerPage() {
  return (
    <CartProvider>
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-serif font-semibold mb-2">Audio Player Test</h1>
            <p className="text-muted-foreground">
              Testing the next-gen audio player with real tracks
            </p>
          </div>

          <div className="space-y-8">
            {testTracks.map((track) => (
              <AudioPlayer
                key={track.id}
                track={track}
                queue={testTracks}
              />
            ))}
          </div>

          <div className="mt-12 p-6 bg-card border border-border rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Player Features</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Waveform visualization (green/orange)</li>
              <li>✅ Click anywhere on waveform to seek</li>
              <li>✅ Keyboard shortcuts: Space, ←/→, M</li>
              <li>✅ Playback speed control (0.5x to 2x)</li>
              <li>✅ Volume control with mute</li>
              <li>✅ Repeat & shuffle modes</li>
              <li>✅ Queue support (skip forward/back)</li>
              <li>✅ Smooth animations</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </CartProvider>
  )
}
