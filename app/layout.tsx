import type { Metadata } from 'next';
import { Cormorant_Garamond, Montserrat, DM_Mono } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/ui/CustomCursor';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MB Auto Collective | Prestige Pre-Owned Cars | Waterloo Sydney',
  description:
    "Sydney's premier destination for prestige and performance pre-owned vehicles. Buy, sell or finance your next car with MB Auto Collective, Waterloo NSW.",
  keywords:
    'prestige cars sydney, pre-owned luxury cars, used bmw sydney, used porsche sydney, used mercedes sydney, car dealer waterloo',
  openGraph: {
    title: 'MB Auto Collective',
    description: 'Buy. Sell. Drive. Prestige pre-owned vehicles in Waterloo, Sydney.',
    url: 'https://mbautocollective.com',
    siteName: 'MB Auto Collective',
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MB Auto Collective',
    description: 'Buy. Sell. Drive. Prestige pre-owned vehicles in Waterloo, Sydney.',
  },
  metadataBase: new URL('https://mbautocollective.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-AU"
      className={`${cormorant.variable} ${montserrat.variable} ${dmMono.variable}`}
    >
      <body className="bg-bg text-text font-body antialiased">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
