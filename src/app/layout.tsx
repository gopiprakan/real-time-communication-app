import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus | Neural Collaboration Sphere",
  description: "Experience the pinnacle of real-time digital synergy with Nexus. Video, Whiteboard, and Secure Messaging reimagined for the future.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased selection:bg-primary/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
