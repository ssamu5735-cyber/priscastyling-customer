import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Priscastyling | Fashion designer and Ready to wear by Priscastyling — Festac, Lagos',
  description: 'Fashion designer and Ready to wear by Priscastyling (Rtwbypriscastyling): body-positive ready-to-wear, bespoke, bridal, pageant and children\'s fashion, designed around your occasion, your measurements and your confidence. Festac Town, Lagos.',
  metadataBase: new URL('https://priscastyling-customer.netlify.app'),
  icons: { icon: '/icon.png', apple: '/icon.png' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
