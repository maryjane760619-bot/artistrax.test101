import type { Artist, Release, Bundle } from './types'

export const artists: Artist[] = [
  {
    id: '1',
    name: 'Luna Wave',
    slug: 'luna-wave',
    bio: 'Luna Wave is an electronic music producer known for atmospheric soundscapes and deep, immersive beats. Her work blends ambient textures with driving rhythms, creating a unique sonic experience.',
    image: '/artists/luna-wave.jpg',
    genres: ['Electronic', 'Ambient', 'Deep House']
  },
  {
    id: '2',
    name: 'The Midnight Echo',
    slug: 'the-midnight-echo',
    bio: 'The Midnight Echo crafts moody indie rock with cinematic undertones. Their sound evokes late-night drives and introspective moments.',
    image: '/artists/midnight-echo.jpg',
    genres: ['Indie Rock', 'Alternative', 'Shoegaze']
  },
  {
    id: '3',
    name: 'Solar Drift',
    slug: 'solar-drift',
    bio: 'Solar Drift explores the intersection of jazz and electronic music, creating fluid compositions that transcend genre boundaries.',
    image: '/artists/solar-drift.jpg',
    genres: ['Jazz Fusion', 'Electronic', 'Experimental']
  },
  {
    id: '4',
    name: 'Velvet Haze',
    slug: 'velvet-haze',
    bio: 'Velvet Haze delivers soulful R&B with modern production techniques. Their intimate vocals and lush arrangements create a warm, enveloping sound.',
    image: '/artists/velvet-haze.jpg',
    genres: ['R&B', 'Soul', 'Neo-Soul']
  }
]

export const releases: Release[] = [
  {
    id: '1',
    title: 'Nocturnal Dreams',
    slug: 'nocturnal-dreams',
    artistId: '1',
    artistName: 'Luna Wave',
    coverArt: '/releases/nocturnal-dreams.jpg',
    releaseDate: '2025-01-15',
    genre: 'Electronic',
    type: 'album',
    featured: true,
    tracks: [
      { id: '1-1', title: 'Midnight Pulse', duration: '4:32', trackNumber: 1 },
      { id: '1-2', title: 'Echoes in the Dark', duration: '5:18', trackNumber: 2 },
      { id: '1-3', title: 'Stellar Drift', duration: '6:45', trackNumber: 3 },
      { id: '1-4', title: 'Deep Waters', duration: '4:56', trackNumber: 4 },
      { id: '1-5', title: 'Nocturnal Dreams', duration: '7:23', trackNumber: 5 },
      { id: '1-6', title: 'First Light', duration: '5:11', trackNumber: 6 },
    ],
    pricing: { mp3: 9.99, flac: 14.99, wav: 14.99 }
  },
  {
    id: '2',
    title: 'City Lights',
    slug: 'city-lights',
    artistId: '2',
    artistName: 'The Midnight Echo',
    coverArt: '/releases/city-lights.jpg',
    releaseDate: '2025-02-20',
    genre: 'Indie Rock',
    type: 'album',
    featured: true,
    tracks: [
      { id: '2-1', title: 'Neon Signs', duration: '3:45', trackNumber: 1 },
      { id: '2-2', title: 'Empty Streets', duration: '4:12', trackNumber: 2 },
      { id: '2-3', title: 'City Lights', duration: '5:02', trackNumber: 3 },
      { id: '2-4', title: 'Rooftop Views', duration: '4:28', trackNumber: 4 },
      { id: '2-5', title: 'Last Train Home', duration: '6:15', trackNumber: 5 },
    ],
    pricing: { mp3: 8.99, flac: 12.99, wav: 12.99 }
  },
  {
    id: '3',
    title: 'Cosmic Journey',
    slug: 'cosmic-journey',
    artistId: '3',
    artistName: 'Solar Drift',
    coverArt: '/releases/cosmic-journey.jpg',
    releaseDate: '2024-11-10',
    genre: 'Jazz Fusion',
    type: 'ep',
    featured: true,
    tracks: [
      { id: '3-1', title: 'Orbit', duration: '6:30', trackNumber: 1 },
      { id: '3-2', title: 'Solar Flare', duration: '5:45', trackNumber: 2 },
      { id: '3-3', title: 'Cosmic Journey', duration: '8:12', trackNumber: 3 },
      { id: '3-4', title: 'Return to Earth', duration: '4:55', trackNumber: 4 },
    ],
    pricing: { mp3: 6.99, flac: 9.99, wav: 9.99 }
  },
  {
    id: '4',
    title: 'Velvet Nights',
    slug: 'velvet-nights',
    artistId: '4',
    artistName: 'Velvet Haze',
    coverArt: '/releases/velvet-nights.jpg',
    releaseDate: '2025-03-01',
    genre: 'R&B',
    type: 'album',
    featured: true,
    tracks: [
      { id: '4-1', title: 'Intro: Haze', duration: '1:45', trackNumber: 1 },
      { id: '4-2', title: 'Velvet Touch', duration: '4:22', trackNumber: 2 },
      { id: '4-3', title: 'Midnight Lover', duration: '3:58', trackNumber: 3 },
      { id: '4-4', title: 'Golden Hour', duration: '4:35', trackNumber: 4 },
      { id: '4-5', title: 'Fade Away', duration: '5:10', trackNumber: 5 },
      { id: '4-6', title: 'Dreams of You', duration: '4:48', trackNumber: 6 },
      { id: '4-7', title: 'Velvet Nights', duration: '6:02', trackNumber: 7 },
    ],
    pricing: { mp3: 10.99, flac: 15.99, wav: 15.99 }
  },
  {
    id: '5',
    title: 'Afterglow',
    slug: 'afterglow',
    artistId: '1',
    artistName: 'Luna Wave',
    coverArt: '/releases/afterglow.jpg',
    releaseDate: '2024-08-15',
    genre: 'Ambient',
    type: 'single',
    tracks: [
      { id: '5-1', title: 'Afterglow', duration: '6:15', trackNumber: 1 },
    ],
    pricing: { mp3: 1.99, flac: 2.99, wav: 2.99 }
  },
  {
    id: '6',
    title: 'Horizon',
    slug: 'horizon',
    artistId: '2',
    artistName: 'The Midnight Echo',
    coverArt: '/releases/horizon.jpg',
    releaseDate: '2024-06-20',
    genre: 'Alternative',
    type: 'single',
    tracks: [
      { id: '6-1', title: 'Horizon', duration: '4:32', trackNumber: 1 },
    ],
    pricing: { mp3: 1.99, flac: 2.99, wav: 2.99 }
  }
]

export const bundles: Bundle[] = [
  {
    id: '1',
    title: 'Siesta Essentials',
    slug: 'siesta-essentials',
    description: 'A curated collection of our best releases, perfect for discovering the Siesta Life sound.',
    image: '/bundles/essentials.jpg',
    releases: ['1', '2', '3'],
    originalPrice: 25.97,
    discountedPrice: 19.99
  },
  {
    id: '2',
    title: 'Complete Collection 2024',
    slug: 'complete-collection-2024',
    description: 'Every release from 2024 in one comprehensive bundle. The ultimate Siesta Life experience.',
    image: '/bundles/complete-2024.jpg',
    releases: ['1', '2', '3', '4'],
    originalPrice: 36.96,
    discountedPrice: 29.99
  }
]

export function getArtistById(id: string): Artist | undefined {
  return artists.find(a => a.id === id)
}

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find(a => a.slug === slug)
}

export function getReleaseById(id: string): Release | undefined {
  return releases.find(r => r.id === id)
}

export function getReleaseBySlug(slug: string): Release | undefined {
  return releases.find(r => r.slug === slug)
}

export function getReleasesByArtist(artistId: string): Release[] {
  return releases.filter(r => r.artistId === artistId)
}

export function getFeaturedReleases(): Release[] {
  return releases.filter(r => r.featured)
}

export function getBundleBySlug(slug: string): Bundle | undefined {
  return bundles.find(b => b.slug === slug)
}
