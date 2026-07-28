import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Sin icons acá: el favicon lo resuelve `app/icon.tsx` por subdominio (logo de la empresa). */
export const metadata: Metadata = {
  metadataBase: new URL(
    `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "alavueltaapp.pro"}`
  ),
  title: {
    default: "ALaVuelta",
    template: "%s",
  },
  description: "Reservá servicios y pedí productos cerca tuyo",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
