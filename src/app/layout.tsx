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
  IconCrown,
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
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E6C766] flex items-center justify-center font-bold text-2xl mx-auto animate-pulse shadow-lg shadow-[#D4AF37]/10">
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
  const firstName = admin.name ? admin.name.split(" ")[0] : "Admin";
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
        <header className="bg-[#FFFDFC] backdrop-blur-md border-b border-[#E8CFC5] px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_rgba(53,25,28,0.04)] sticky top-0 z-30 gap-4">
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
              <div className="hidden sm:block">
                <h1 className="font-serif text-base sm:text-lg text-[#7C1B2A] font-bold leading-tight">
                  Keshar Jewellers
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A77C18]">
                  Control Center
                </span>
              </div>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFF9F5] border border-[#E8CFC5] text-xs w-64 lg:w-80 focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/30 transition-all shadow-sm">
            <IconSearch className="w-4 h-4 text-[#6F4A4A] shrink-0" />
            <input
              type="text"
              placeholder="Search products, SKU, or orders..."
              className="bg-transparent border-none outline-none w-full text-xs text-[#35191C] placeholder-[#6F4A4A]/60"
            />
            <kbd className="hidden lg:inline-flex text-[10px] bg-[#FFFDFC] border border-[#E8CFC5] rounded px-1.5 py-0.5 text-[#6F4A4A] font-mono">
              ⌘K
            </kbd>
          </div>

          {/* Right Side: Admin Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
            {/* Notification Bell */}
            <button
              className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-[#FFF9F5] border border-[#E8CFC5] hover:border-[#D4AF37]/60 text-[#35191C] hover:text-[#7A1021] transition-all"
              title="Notifications"
            >
              <span className="text-base">🔔</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B82E44] ring-2 ring-[#FFFDFC]" />
            </button>

            {/* Divider */}
            <div className="hidden sm:block h-7 w-px bg-[#E8CFC5]" />

            {/* Admin Avatar Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FFF0EA] border border-[#E8CFC5] cursor-pointer hover:border-[#D4AF37]/40 transition-all">
              <div className="relative">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm border-2 ${
                    isSuperAdmin
                      ? "bg-gradient-to-br from-[#E6C766] to-[#D4AF37] text-[#35191C] border-[#D4AF37]/60"
                      : "bg-gradient-to-br from-[#B82E44] to-[#7C1B2A] text-white border-[#B82E44]/40"
                  }`}
                >
                  {initial}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#FFF0EA]" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#35191C] leading-tight flex items-center gap-1">
                  {firstName}
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
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-transparent hover:border-[#E8CFC5] hover:bg-[#FFF0EA] text-[#6F4A4A] hover:text-[#B82E44] transition-all"
              title="Sign Out of Admin Portal"
            >
              <span className="text-base">🚪</span>
            </button>
          </div>
        </header>

        {/* Main Dashboard / Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-[#FFF9F5]">
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
        className={`${playfair.variable} ${lato.variable} antialiased min-h-screen bg-[#FFF9F5] text-[#2C1417] selection:bg-[#D4AF37]/30 selection:text-[#35191C]`}
      >
        <AdminAuthProvider>
          <AdminShell>{children}</AdminShell>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
