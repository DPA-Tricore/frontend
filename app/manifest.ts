import type { MetadataRoute } from 'next';
import { APP_NAME } from '@/lib/constants/brand';

/**
 * Lets people install DPA as an app. iPhone and iPad need this for browser
 * alerts at all: Safari only allows push for sites added to the Home Screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: 'DPA',
    description: 'Customer Relationship Management for Insurance Brokers',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1d3557',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
