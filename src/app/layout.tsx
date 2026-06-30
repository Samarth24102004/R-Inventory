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
  title: "RoS Inventory",
  description: "A professional platform for projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
