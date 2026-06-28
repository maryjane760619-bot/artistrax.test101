import { Resend } from 'resend';

// Initialize Resend with API key from environment (safe initialization)
export const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder_key');

// From address
export const FROM_EMAIL = 'Artistrax <support@artistrax.com>';

// Admin notification email
export const ADMIN_EMAIL = 'support@artistrax.com';

// Email subjects
export const EMAIL_SUBJECTS = {
  fanWelcome: 'Welcome to Artistrax! 🎵',
  artistWelcome: 'Welcome to Artistrax - Start Sharing Your Music! 🎨',
  labelWelcome: 'Welcome to Artistrax - Build Your Catalog! 🏢',
  adminNewFan: '🎵 New Fan Signup',
  adminNewArtist: '🎨 New Artist Signup',
  adminNewLabel: '🏢 New Label Signup',
  adminNewSubscription: '💳 New Subscription',
  trackPurchaseReceipt: 'Your Artistrax order is ready 🎵',
  pointsEarned: 'You earned points! ⭐',
  trialEnding: 'Your trial ends in 7 days ⏰',
} as const;
