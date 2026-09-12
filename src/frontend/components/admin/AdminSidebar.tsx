/**
 * ============================================================
 * FILE: src/components/admin/AdminSidebar.tsx
 * PURPOSE: Left navigation sidebar for the Standalone Admin Panel.
 * ============================================================
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard",  href: "/",           icon: "🏠" },
  { label: "Products",   href: "/products",   icon: "📦" },
  { label: "Inventory",  href: "/inventory",  icon: "📊" },
  { label: "Orders",     href: "/orders",     icon: "🛒" },
  { label: "Analytics",  href: "/analytics",  icon: "📈" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-[#35191C] min-h-screen flex flex-col shrink-0">
      {/* ── Brand Header ── */}
      <div className="p-6 border-b border-[#4A2528]">
        <Link href="/" className="block">
          <span className="text-[#D4AF37] uppercase tracking-[0.2em] text-[10px] font-bold block">
            Independent Admin Portal
          </span>
          <span className="font-serif text-xl text-[#FFF8F0] tracking-tight block mt-1">
            Keshar Jewellers
          </span>
        </Link>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 p-4 space-y-1.5">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-[#B82E44] text-[#FFF8F0] shadow-md"
                : "text-[#E8CFC5] hover:bg-[#4A2528] hover:text-[#FFF8F0]"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Bottom: Live Store Link ── */}
      <div className="p-4 border-t border-[#4A2528]">
        <a
          href="https://kesharjewellers.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4A2528] hover:bg-[#5A3538] text-[#E8CFC5] text-xs font-semibold rounded-xl transition-all"
        >
          <span>🌐</span>
          <span>View Customer Store</span>
          <span className="ml-auto text-[10px]">↗</span>
        </a>
      </div>
    </aside>
  );
}
