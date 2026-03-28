import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Komiota - Gamified Public Transit Companion',
    template: '%s | Komiota',
  },
  description:
    'Transform your daily commute into an adventure. Track your trips, earn badges, compete with friends, and make public transit fun with Komiota.',
  keywords: [
    'public transit',
    'commuter app',
    'gamification',
    'transit tracking',
    'bus stops',
    'commuter rewards',
    'transit companion',
  ],
  authors: [{ name: 'Komiota Team' }],
  creator: 'Komiota',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://komiota.com',
    title: 'Komiota - Gamified Public Transit Companion',
    description:
      'Transform your daily commute into an adventure. Track your trips, earn badges, and compete with friends.',
    siteName: 'Komiota',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Komiota - Gamified Public Transit Companion',
    description:
      'Transform your daily commute into an adventure. Track your trips, earn badges, and compete with friends.',
    creator: '@komiota',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
