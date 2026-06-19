import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { theme } from './theme';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lane — Realtime team boards',
  description:
    'Move work together in real time. Drag a card and your whole team sees it move instantly — with live presence, guest links, and conflict-safe ordering.',
  openGraph: {
    title: 'Lane — Realtime team boards',
    description: 'Move work together, in real time. Live presence, guest links, conflict-safe.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps} className={`${jakarta.variable} ${mono.variable}`}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light" forceColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
