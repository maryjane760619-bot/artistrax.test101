'use client'

import { AudioPlayer } from '@/components/audio-player'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useState } from 'react'

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

export default function PlayerTestPage() {
  const [currentTrack, setCurrentTrack] = useState(testTracks[0])

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-semibold mb-2">Audio Player Test</h1>
            <p className="text-muted-foreground">
              Testing the world-class audio player — 10x better than Beatport
            </p>
          </div>

          {/* Main Player */}
          <AudioPlayer
            track={currentTrack}
            queue={testTracks}
            onTrackChange={setCurrentTrack}
            className="mb-8"
          />

          {/* Track List */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Queue ({testTracks.length} tracks)</h2>
            </div>
            <div className="divide-y divide-border">
              {testTracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => setCurrentTrack(track)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    currentTrack.id === track.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{track.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </div>
                    </div>
                    {currentTrack.id === track.id && (
                      <div className="text-primary text-sm font-medium">
                        Playing
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Features Showcase */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">✨ Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Waveform visualization</li>
                <li>• Instant seeking</li>
                <li>• Playback speed control (0.5x - 2x)</li>
                <li>• Queue management</li>
                <li>• Shuffle & repeat modes</li>
                <li>• Volume control</li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">⌨️ Keyboard Shortcuts</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd> — Play/Pause</li>
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">←</kbd> — Skip back 5s</li>
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">→</kbd> — Skip forward 5s</li>
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">M</kbd> — Mute/Unmute</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
