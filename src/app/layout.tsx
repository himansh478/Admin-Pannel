/**
 * ============================================================
 * FILE: src/app/layout.tsx (Standalone Admin Layout & Auth Guard)
 * PURPOSE: Global Layout wrapper with Header, Auth Guard, & Admin Session
 * ============================================================
 */

"use client";

import { useState } from "react";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  IconMenu,
  IconSearch,
  IconArrowUpRight,
  IconSparkles,
  IconCrown,
  IconShieldCheck,
} from "@/components/admin/Icons";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import AdminLoginPage from "@/app/login/page";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

function AdminShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading, admin, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial session restoration loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C1417] via-[#35191C] to-[#4A0E17] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E6C766] flex items-center justify-center font-bold text-2xl mx-auto animate-pulse">
            👑
          </div>
          <p className="text-xs font-bold text-[#E6C766] uppercase tracking-widest">
            Loading Admin Session...
          </p>
        </div>
      </div>
    );
  }

  // ── AUTH GUARD: IF NOT LOGGED IN, SHOW LUXURY LOGIN FORM ──
  if (!isLoggedIn || !admin) {
    return <AdminLoginPage />;
  }

  // ── AUTHENTICATED ADMIN PORTAL SHELL ──
  const initial = admin.name ? admin.name.charAt(0).toUpperCase() : "A";
  const isSuperAdmin = admin.role === "superadmin";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-[#E8CFC5] px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs sticky top-0 z-30">
          {/* Left Side: Mobile Menu Button & Brand Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#FFF0EA] hover:bg-[#FFE2D8] text-[#7C1B2A] border border-[#E8CFC5] transition-all"
              aria-label="Open navigation menu"
            >
              <IconMenu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#B82E44] to-[#7C1B2A] text-white flex items-center justify-center font-serif font-bold text-base shadow-sm">
                K
              </span>
              <div>
                <h1 className="font-serif text-base sm:text-lg text-[#7C1B2A] font-bold leading-tight">
                  Keshar Jewellers
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-[#A77C18]">
                  Control Center
                </span>
              </div>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF0EA]/70 border border-[#E8CFC5] text-xs w-64 lg:w-72 focus-within:border-[#B82E44] focus-within:bg-white transition-all shadow-xs">
            <IconSearch className="w-4 h-4 text-[#6F4A4A] shrink-0" />
            <input
              type="text"
              placeholder="Search products, SKU, or orders..."
              className="bg-transparent border-none outline-none w-full text-xs text-[#35191C] placeholder-[#6F4A4A]/60"
            />
          </div>

          {/* Right Side: Logged In Admin Profile & Logout */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            {/* Admin Avatar Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF0EA] border border-[#E8CFC5]">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs ${
                  isSuperAdmin
                    ? "bg-gradient-to-br from-[#E6C766] to-[#D4AF37] text-[#35191C]"
                    : "bg-gradient-to-br from-[#B82E44] to-[#7C1B2A] text-white"
                }`}
              >
                {initial}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#35191C] leading-tight flex items-center gap-1">
                  {admin.name.split(" ")[0]}
                  {isSuperAdmin && <IconCrown className="w-3 h-3 text-[#A77C18] inline" />}
                </p>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#7C1B2A] block">
                  {admin.role}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 transition-all flex items-center gap-1 text-xs font-bold"
              title="Sign Out of Admin Portal"
            >
              <span>Logout</span>
              <span className="text-xs">🚪</span>
            </button>
          </div>
        </header>

        {/* Main Dashboard / Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Keshar Jewellers | Admin Management Control Center</title>
        <meta
          name="description"
          content="Enterprise Admin Portal for Keshar Jewellers — Live Inventory, Product Catalog, Orders, & Analytics."
        />
      </head>
      <body
        className={`${playfair.variable} ${lato.variable} antialiased min-h-screen bg-[#FFF9F5] text-[#2C1417] selection:bg-[#B82E44] selection:text-white`}
      >
        <AdminAuthProvider>
          <AdminShell>{children}</AdminShell>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
