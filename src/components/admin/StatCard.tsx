/**
 * ============================================================
 * FILE: src/components/admin/StatCard.tsx
 * PURPOSE: Luxury Key Performance Indicator (KPI) card for Admin Panel.
 * ============================================================
 */

"use client";

import React from "react";
import { IconTrendingUp } from "./Icons";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  color?: "maroon" | "gold" | "green" | "blue" | "purple";
}

export default function StatCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  trendUp = true,
  color = "maroon",
}: StatCardProps) {
  const colorStyles = {
    maroon: {
      bg: "bg-[#FFFDFC] hover:border-[#B82E44]",
      iconBg: "bg-gradient-to-br from-[#B82E44] via-[#7C1B2A] to-[#4A0E17] text-[#FFF8F0] shadow-lg shadow-[#B82E44]/25",
      valueText: "text-[#7C1B2A]",
      glowColor: "from-[#B82E44]/10",
      pingColor: "bg-[#B82E44]",
    },
    gold: {
      bg: "bg-[#FFFDFC] hover:border-[#D4AF37]",
      iconBg: "bg-gradient-to-br from-[#FFF3C4] via-[#E6C766] to-[#D4AF37] text-[#35191C] shadow-lg shadow-[#D4AF37]/30",
      valueText: "text-[#9E7310]",
      glowColor: "from-[#D4AF37]/15",
      pingColor: "bg-[#D4AF37]",
    },
    green: {
      bg: "bg-[#FFFDFC] hover:border-emerald-500",
      iconBg: "bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 text-white shadow-lg shadow-emerald-500/25",
      valueText: "text-emerald-800",
      glowColor: "from-emerald-500/10",
      pingColor: "bg-emerald-500",
    },
    blue: {
      bg: "bg-[#FFFDFC] hover:border-sky-500",
      iconBg: "bg-gradient-to-br from-sky-400 via-indigo-600 to-slate-900 text-white shadow-lg shadow-sky-500/25",
      valueText: "text-indigo-900",
      glowColor: "from-sky-500/10",
      pingColor: "bg-sky-500",
    },
    purple: {
      bg: "bg-[#FFFDFC] hover:border-purple-500",
      iconBg: "bg-gradient-to-br from-purple-400 via-purple-600 to-indigo-950 text-white shadow-lg shadow-purple-500/25",
      valueText: "text-purple-950",
      glowColor: "from-purple-500/10",
      pingColor: "bg-purple-500",
    },
  };

  const styles = colorStyles[color];

  return (
    <div
      className={`luxury-card ${styles.bg} rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden`}
    >
      {/* Subtle Corner Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${styles.glowColor} to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125`} />

      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            {icon}
          </div>

          {trend && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${
                trendUp
                  ? "bg-emerald-50/90 text-emerald-800 border-emerald-200"
                  : "bg-amber-50/90 text-amber-800 border-amber-200"
              }`}
            >
              <IconTrendingUp className={`w-3 h-3 ${!trendUp && "rotate-180 text-amber-600"}`} />
              {trend}
            </span>
          )}
        </div>

        <p className="text-[11px] font-bold uppercase tracking-wider text-[#6F4A4A] mb-1">
          {title}
        </p>

        <p className={`font-serif text-3xl font-extrabold tracking-tight ${styles.valueText} mb-1`}>
          {value}
        </p>
      </div>

      {subtitle && (
        <div className="pt-2.5 mt-2 border-t border-[#E8CFC5]/50 flex items-center justify-between text-[11px] text-[#6F4A4A]">
          <span>{subtitle}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${styles.pingColor} group-hover:animate-ping`} />
        </div>
      )}
    </div>
  );
}

