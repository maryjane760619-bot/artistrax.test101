export const GENRES = [
  'Afro House',
  'Ambient',
  'Drum & Bass',
  'Deep House',
  'Electronic',
  'House',
  'Hip-Hop / R&B',
  'Melodic House & Techno',
  'Minimal / Deep Tech',
  'Progressive House',
  'Tech House',
  'Techno',
  'Trance',
] as const

export type Genre = (typeof GENRES)[number]

export const MUSICAL_KEYS = [
  'C Major', 'C Minor',
  'C# Major', 'C# Minor',
  'D Major', 'D Minor',
  'D# Major', 'D# Minor',
  'E Major', 'E Minor',
  'F Major', 'F Minor',
  'F# Major', 'F# Minor',
  'G Major', 'G Minor',
  'G# Major', 'G# Minor',
  'A Major', 'A Minor',
  'A# Major', 'A# Minor',
  'B Major', 'B Minor',
] as const
