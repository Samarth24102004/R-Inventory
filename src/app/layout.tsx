import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNavbar from "@/components/BottomNavbar";
import SearchModal from "@/components/SearchModal";
import NeededProjectModal from "@/components/NeededProjectModal";
import AuthButton from "@/components/AuthButton";
import React, { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://rosinventory.co.in'),
  title: {
    default: "RoS Inventory | Open Source Robotics & ROS2 Projects",
    template: "%s | RoS Inventory"
  },
  description: "RoS Inventory is a modern platform dedicated to ROS2 robotics, autonomous robots, open-source robotics projects, AI robotics, simulation resources, 3D models, and robotics development.",
  keywords: ["ROS", "ROS2", "Robotics", "Autonomous Robots", "Open Source Robotics", "ROS Projects", "AI Robotics", "Gazebo", "MoveIt", "Navigation2", "SLAM", "3D Models", "Robotics Tutorials", "Robot Simulation"],
  authors: [{ name: "RoS Inventory" }],
  creator: "RoS Inventory",
  publisher: "RoS Inventory",
  applicationName: "RoS Inventory",
  generator: "Next.js",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "RoS Inventory | Open Source Robotics & ROS2 Projects",
    description: "RoS Inventory is a modern platform dedicated to ROS2 robotics, autonomous robots, open-source robotics projects, AI robotics, simulation resources, 3D models, and robotics development.",
    url: 'https://rosinventory.co.in',
    siteName: 'RoS Inventory',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RoS Inventory Preview Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "RoS Inventory | Open Source Robotics & ROS2 Projects",
    description: "RoS Inventory is a modern platform dedicated to ROS2 robotics, autonomous robots, open-source robotics projects, AI robotics, simulation resources, 3D models, and robotics development.",
    images: ['/twitter-image.jpg'],
    creator: '@rosinventory',
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
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

// Global JSON-LD Schema
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://rosinventory.co.in/#website",
      "url": "https://rosinventory.co.in",
      "name": "RoS Inventory",
      "description": "Open Source Robotics & ROS2 Projects",
      "publisher": {
        "@id": "https://rosinventory.co.in/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://rosinventory.co.in/?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://rosinventory.co.in/#organization",
      "name": "RoS Inventory",
      "url": "https://rosinventory.co.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rosinventory.co.in/icon.png"
      },
      "sameAs": [
        "https://github.com/rosinventory",
        "https://linkedin.com/company/rosinventory",
        "https://youtube.com/@rosinventory",
        "https://twitter.com/rosinventory"
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-black text-white antialiased`}>
        {/* Header Background */}
        <div className="fixed top-0 left-0 right-0 h-28 bg-transparent backdrop-blur-md z-40 mask-[linear-gradient(to_bottom,black_60%,transparent_100%)] pointer-events-none"></div>

        <div className="fixed top-8 left-[5%] z-50 pointer-events-none flex flex-col items-center">
          <div className="flex items-center gap-1">
            <span className="text-3xl font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]" style={{ fontFamily: 'sans-serif' }}>
              ROS
            </span>
            <span className="w-2 h-2 bg-[#84cc16] rounded-sm mt-3 animate-pulse"></span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.3em] text-white/80 mt-[-2px]">
            INVENTORY
          </span>
        </div>
        {children}
        <Suspense fallback={null}>
          <AuthButton />
        </Suspense>
        <Suspense fallback={null}>
          <BottomNavbar />
        </Suspense>
        <Suspense fallback={null}>
          <SearchModal />
        </Suspense>
        <Suspense fallback={null}>
          <NeededProjectModal />
        </Suspense>
      </body>
    </html>
  );
}
