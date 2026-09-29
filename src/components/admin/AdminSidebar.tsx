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
  IconTag,
  IconGift,
} from "./Icons";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_GROUPS = [
  {
    label: "Main Control Center",
    items: [
      { label: "Dashboard",  href: "/",           icon: IconSparkles,     badge: null },
      { label: "Products",   href: "/products",   icon: IconPackage,      badge: "Catalog" },
      { label: "Inventory",  href: "/inventory",  icon: IconLayers,       badge: null },
      { label: "Orders",     href: "/orders",     icon: IconShoppingCart, badge: "Live" },
      { label: "Users",      href: "/users",      icon: IconUsers,        badge: "Members" },
    ],
  },
  {
    label: "Intelligence & Marketing",
    items: [
      { label: "Analytics",  href: "/analytics",  icon: IconTrendingUp,   badge: null },
      { label: "Gifts",      href: "/gifts",      icon: IconGift,         badge: null },
    ],
  },
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
    <aside
      className="flex flex-col min-h-screen shrink-0 border-r border-[#D4AF37]/20 shadow-2xl relative z-40"
      style={{ width: "272px", background: "linear-gradient(180deg, #2C1417 0%, #35191C 48%, #4A0E17 100%)" }}
    >
      {/* ── Brand Header ── */}
      <div className="px-5 py-5 border-b border-[#D4AF37]/20 flex items-center justify-between flex-shrink-0">
        <Link href="/" className="block group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-[#D4AF37]/60 flex items-center justify-center bg-[#480C14] shadow-inner relative overflow-hidden">
              <span className="font-serif font-bold text-[#E6C766] text-lg leading-none">K</span>
              <div className="absolute -inset-0.5 rounded border border-[#D4AF37]/25 blur-sm pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-wide text-[#FFF8F0] group-hover:text-[#E6C766] transition-colors leading-tight">
                  Keshar
                </span>
                <span className="text-[9px] tracking-widest font-bold uppercase px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#E6C766] border border-[#D4AF37]/40">
                  Admin
                </span>
              </div>
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#E6C766]/60 font-medium block mt-0.5">
                Luxury Admin Portal
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
      <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#E6C766]/50">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded text-sm font-medium tracking-wide transition-all duration-200 group relative overflow-hidden ${
                      active
                        ? "text-[#E6C766] font-semibold"
                        : "text-[#FFF8F0]/70 hover:text-[#E6C766] hover:bg-[#480C14]/50"
                    }`}
                    style={
                      active
                        ? { background: "linear-gradient(90deg, rgba(122,16,33,0.85) 0%, rgba(184,46,68,0.18) 100%)" }
                        : {}
                    }
                  >
                    {/* Active Gold Indicator Bar */}
                    {active && (
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#D4AF37] rounded-r" />
                    )}

                    <div className="flex items-center gap-3 pl-1">
                      <IconComponent
                        className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${
                          active
                            ? "text-[#E6C766]"
                            : "text-[#FFF8F0]/50 group-hover:text-[#E6C766]"
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
                    ) : active ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E6C766] animate-pulse" />
                    ) : (
                      <IconChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity text-[#E8CFC5]/60" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="p-4 border-t border-[#D4AF37]/20 bg-[#240B0E]/60 space-y-3 flex-shrink-0">
        {/* BIS Certification Badge */}
        <div className="p-3 rounded border border-[#D4AF37]/30 bg-[#35070D]/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#E6C766] uppercase tracking-wider">
              BIS Certified Store
            </span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              ✓ ACTIVE
            </span>
          </div>
          <p className="text-[10px] text-[#E8CFC5]/60 uppercase tracking-widest">
            916 &amp; 925 Hallmark Database
          </p>
        </div>

        <a
          href="https://kesharjewellers.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 bg-[#35191C] hover:bg-[#4A2528] text-[#E8CFC5] hover:text-white text-xs font-semibold rounded border border-[#E8CFC5]/10 hover:border-[#D4AF37]/30 transition-all shadow-sm"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-50">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
