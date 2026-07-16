import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stay & Dine Radar India',
    short_name: 'Stay&Dine',
    description: '360° Proximity Radar for Students, PGs, Flats & Tiffins in Patna, Ranchi & Delhi',
    start_url: '/',
    display: 'standalone',
    background_color: '#060913',
    theme_color: '#060913',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
