export interface Artist {
  id: string
  name: string
  slug: string
  bio: string
  image: string
  genres: string[]
}

export interface Track {
  id: string
  title: string
  duration: string
  previewUrl?: string
  trackNumber: number
}

export interface Release {
  id: string
  title: string
  slug: string
  artistId: string
  artistName: string
  coverArt: string
  releaseDate: string
  genre: string
  type: 'album' | 'single' | 'ep'
  tracks: Track[]
  pricing: {
    mp3: number
    flac: number
    wav: number
  }
  featured?: boolean
  isrc?: string
}

export interface Bundle {
  id: string
  title: string
  slug: string
  description: string
  image: string
  releases: string[]
  originalPrice: number
  discountedPrice: number
}

export interface CartItem {
  releaseId: string
  format: 'mp3' | 'flac' | 'wav'
  price: number
  release: Release
}
