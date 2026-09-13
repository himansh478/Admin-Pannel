/**
 * ============================================================
 * FILE: src/components/admin/AdminSidebar.tsx
 * PURPOSE: Left navigation sidebar for the Keshar Jewellers Standalone Admin Panel.
 * ============================================================
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconPackage,
  IconShoppingCart,
  IconTrendingUp,
  IconLayers,
  IconSparkles,
  IconUsers,
  IconChevronRight,
  IconArrowUpRight,
  IconX,
} from "./Icons";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard",  href: "/",           icon: IconSparkles, badge: null },
  { label: "Products",   href: "/products",   icon: IconPackage,  badge: "Catalog" },
  { label: "Inventory",  href: "/inventory",  icon: IconLayers,   badge: null },
  { label: "Orders",     href: "/orders",     icon: IconShoppingCart, badge: "Live" },
  { label: "Users",      href: "/users",      icon: IconUsers,     badge: "Members" },
  { label: "Analytics",  href: "/analytics",  icon: IconTrendingUp, badge: null },
];

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <aside className="w-64 bg-gradient-to-b from-[#2C1417] via-[#35191C] to-[#4A0E17] text-[#FFF8F0] min-h-screen flex flex-col shrink-0 border-r border-[#4A2528] shadow-2xl relative z-40">
      {/* ── Brand Header ── */}
      <div className="p-6 border-b border-[#4A2528] flex items-center justify-between">
        <Link href="/" className="block group">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E6C766] to-[#D4AF37] text-[#35191C] flex items-center justify-center font-serif font-bold text-sm shadow-md">
              K
            </span>
            <div>
              <span className="text-[#E6C766] uppercase tracking-[0.25em] text-[9px] font-bold block">
                Luxury Admin Portal
              </span>
              <span className="font-serif text-lg text-white tracking-tight block group-hover:text-[#E6C766] transition-colors">
                Keshar Jewellers
              </span>
            </div>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg bg-[#4A2528] text-slate-300 hover:text-white"
          >
            <IconX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#E8CFC5]/50">
          Main Control Center
        </div>

        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all group relative overflow-hidden ${
                active
                  ? "bg-gradient-to-r from-[#B82E44] to-[#7C1B2A] text-white shadow-lg shadow-[#B82E44]/30 border border-[#B82E44]/50"
                  : "text-[#E8CFC5] hover:bg-[#4A2528] hover:text-white"
              }`}
            >
              {/* Active Gold Indicator Bar */}
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
              )}

              <div className="flex items-center gap-3">
                <IconComponent
                  className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                    active ? "text-[#E6C766]" : "text-[#E8CFC5]"
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    active
                      ? "bg-[#D4AF37] text-[#35191C]"
                      : "bg-[#4A2528] text-[#E6C766] border border-[#D4AF37]/30"
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                <IconChevronRight
                  className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    active ? "opacity-100 text-[#E6C766]" : "text-[#E8CFC5]/60"
                  }`}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Store Badge & Live Website Link ── */}
      <div className="p-4 border-t border-[#4A2528] space-y-3">
        <div className="p-3 rounded-xl bg-[#4A2528]/50 border border-[#D4AF37]/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#E6C766] flex items-center justify-center font-bold text-xs">
            ✦
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#E6C766] uppercase block">
              BIS 916 &amp; 925 Hallmark
            </span>
            <span className="text-[10px] text-[#E8CFC5]/80 block">
              Certified Store Database
            </span>
          </div>
        </div>

        <a
          href="https://kesharjewellers.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#4A2528] to-[#5A3538] hover:from-[#5A3538] hover:to-[#6A4548] text-[#E8CFC5] hover:text-white text-xs font-semibold rounded-xl border border-[#E8CFC5]/10 transition-all shadow-sm"
        >
          <span className="flex items-center gap-2">
            <span>🌐</span>
            <span>View Live Customer Store</span>
          </span>
          <IconArrowUpRight className="w-3.5 h-3.5 text-[#E6C766]" />
        </a>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">{sidebarContent}</div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-50">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
