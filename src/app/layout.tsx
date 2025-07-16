import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import { ReactPlugin } from '@stagewise-plugins/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Stagewise configuration
const stagewiseConfig = {
  plugins: [ReactPlugin]
};

export const metadata: Metadata = {
  title: "Therapios Wireframes",
  description: "Wireframe mockups for Therapios features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {process.env.NODE_ENV === 'development' && (
          <StagewiseToolbar config={stagewiseConfig} />
        )}
      </body>
    </html>
  );
}
