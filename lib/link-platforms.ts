// Platform configurations for social links

export const LINK_PLATFORMS = {
  spotify: {
    name: 'Spotify',
    color: '#1DB954',
    icon: '🎵',
    placeholder: 'https://open.spotify.com/artist/...',
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    icon: '📷',
    placeholder: 'https://instagram.com/username',
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    icon: '🎬',
    placeholder: 'https://tiktok.com/@username',
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    icon: '📺',
    placeholder: 'https://youtube.com/@username',
  },
  soundcloud: {
    name: 'SoundCloud',
    color: '#FF7700',
    icon: '☁️',
    placeholder: 'https://soundcloud.com/username',
  },
  twitter: {
    name: 'Twitter / X',
    color: '#1DA1F2',
    icon: '🐦',
    placeholder: 'https://twitter.com/username',
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: '👥',
    placeholder: 'https://facebook.com/username',
  },
  bandcamp: {
    name: 'Bandcamp',
    color: '#629aa9',
    icon: '🎸',
    placeholder: 'https://username.bandcamp.com',
  },
  apple: {
    name: 'Apple Music',
    color: '#FA243C',
    icon: '🍎',
    placeholder: 'https://music.apple.com/...',
  },
  website: {
    name: 'Website',
    color: '#6B7280',
    icon: '🌐',
    placeholder: 'https://yourwebsite.com',
  },
  merch: {
    name: 'Merch Store',
    color: '#F59E0B',
    icon: '🛍️',
    placeholder: 'https://your-merch-store.com',
  },
  booking: {
    name: 'Booking',
    color: '#8B5CF6',
    icon: '📅',
    placeholder: 'https://booking-link.com',
  },
  custom: {
    name: 'Custom Link',
    color: '#6B7280',
    icon: '🔗',
    placeholder: 'https://any-url.com',
  },
} as const;

export type LinkPlatform = keyof typeof LINK_PLATFORMS;

export const PLATFORM_OPTIONS = Object.entries(LINK_PLATFORMS).map(([key, value]) => ({
  value: key,
  label: value.name,
  icon: value.icon,
}));

// Auto-detect platform from URL
export function detectPlatform(url: string): LinkPlatform {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('spotify.com')) return 'spotify';
  if (urlLower.includes('instagram.com')) return 'instagram';
  if (urlLower.includes('tiktok.com')) return 'tiktok';
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
  if (urlLower.includes('soundcloud.com')) return 'soundcloud';
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter';
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) return 'facebook';
  if (urlLower.includes('bandcamp.com')) return 'bandcamp';
  if (urlLower.includes('music.apple.com')) return 'apple';
  
  return 'custom';
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
