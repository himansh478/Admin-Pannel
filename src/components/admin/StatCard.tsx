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
      bg: "bg-[#FFFDFC] hover:border-[#B82E44]/50",
      iconBg: "bg-gradient-to-br from-[#B82E44] via-[#7C1B2A] to-[#4A0E17] text-[#FFF8F0] shadow-lg shadow-[#B82E44]/20",
      iconBorder: "border border-[#B82E44]/30",
      valueText: "text-[#7C1B2A]",
      glowColor: "from-[#B82E44]/8",
      pingColor: "bg-[#B82E44]",
    },
    gold: {
      bg: "bg-[#FFFDFC] hover:border-[#D4AF37]/60",
      iconBg: "bg-gradient-to-br from-[#FFF3C4] via-[#E6C766] to-[#D4AF37] text-[#35191C] shadow-lg shadow-[#D4AF37]/25",
      iconBorder: "border border-[#D4AF37]/50",
      valueText: "text-[#9E7310]",
      glowColor: "from-[#D4AF37]/12",
      pingColor: "bg-[#D4AF37]",
    },
    green: {
      bg: "bg-[#FFFDFC] hover:border-emerald-400",
      iconBg: "bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 text-white shadow-lg shadow-emerald-500/20",
      iconBorder: "border border-emerald-300/40",
      valueText: "text-emerald-800",
      glowColor: "from-emerald-500/8",
      pingColor: "bg-emerald-500",
    },
    blue: {
      bg: "bg-[#FFFDFC] hover:border-sky-400",
      iconBg: "bg-gradient-to-br from-sky-400 via-indigo-600 to-slate-900 text-white shadow-lg shadow-sky-500/20",
      iconBorder: "border border-sky-300/40",
      valueText: "text-indigo-900",
      glowColor: "from-sky-500/8",
      pingColor: "bg-sky-500",
    },
    purple: {
      bg: "bg-[#FFFDFC] hover:border-purple-400",
      iconBg: "bg-gradient-to-br from-purple-400 via-purple-600 to-indigo-950 text-white shadow-lg shadow-purple-500/20",
      iconBorder: "border border-purple-300/40",
      valueText: "text-purple-950",
      glowColor: "from-purple-500/8",
      pingColor: "bg-purple-500",
    },
  };

  const styles = colorStyles[color];

  return (
    <div
      className={`${styles.bg} rounded-xl p-3.5 sm:p-5 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden border border-[#E8CFC5] shadow-[0_8px_32px_rgba(53,25,28,0.04)] hover:shadow-md`}
    >
      {/* Subtle Corner Glow */}
      <div className={`absolute top-0 right-0 w-20 sm:w-28 h-20 sm:h-28 bg-gradient-to-bl ${styles.glowColor} to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125`} />

      <div>
        <div className="flex items-start justify-between mb-2.5 sm:mb-4">
          <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded ${styles.iconBg} ${styles.iconBorder} flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0`}>
            {icon}
          </div>

          {trend && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border shadow-2xs ${
                trendUp
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <IconTrendingUp className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${!trendUp && "rotate-180 text-amber-600"}`} />
              <span className="truncate max-w-[80px] sm:max-w-none">{trend}</span>
            </span>
          )}
        </div>

        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest text-[#6F4A4A] mb-1 sm:mb-1.5 truncate">
          {title}
        </p>

        <p className={`font-serif text-lg sm:text-2xl font-extrabold tracking-tight ${styles.valueText} leading-none truncate`}>
          {value}
        </p>
      </div>

      {subtitle && (
        <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-[#E8CFC5]/60 flex items-center justify-between text-[10px] sm:text-[11px] text-[#6F4A4A]">
          <span className="leading-snug truncate">{subtitle}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${styles.pingColor} group-hover:animate-ping shrink-0 ml-1.5`} />
        </div>
      )}
    </div>
  );
}
