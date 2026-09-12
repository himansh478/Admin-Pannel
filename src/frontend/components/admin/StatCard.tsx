/**
 * ============================================================
 * FILE: src/frontend/components/admin/StatCard.tsx
 * PURPOSE: Reusable dashboard stat card for the Admin Panel.
 * ============================================================
 *
 * BEGINNER EXPLANATION:
 * This small component is used on the Dashboard page to show
 * key numbers like "Total Products: 245" or "Total Orders: 18".
 *
 * It takes 4 props:
 *   - icon:  An emoji or icon to display
 *   - title: The label (e.g. "Total Products")
 *   - value: The number or text to show (e.g. "245")
 *   - color: Background accent color (optional)
 */

"use client";

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "maroon" | "gold" | "green" | "blue";
}

export default function StatCard({
  icon,
  title,
  value,
  subtitle,
  color = "maroon",
}: StatCardProps) {
  // Map color names to Tailwind classes
  const colorStyles = {
    maroon: {
      bg: "bg-[#FFF0EA]",
      iconBg: "bg-[#B82E44]/10",
      iconText: "text-[#B82E44]",
      valueText: "text-[#9B1B30]",
    },
    gold: {
      bg: "bg-[#FFF8E7]",
      iconBg: "bg-[#D4AF37]/10",
      iconText: "text-[#D4AF37]",
      valueText: "text-[#A77C18]",
    },
    green: {
      bg: "bg-[#F0FFF4]",
      iconBg: "bg-green-100",
      iconText: "text-green-600",
      valueText: "text-green-700",
    },
    blue: {
      bg: "bg-[#EFF6FF]",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      valueText: "text-blue-700",
    },
  };

  const styles = colorStyles[color];

  return (
    <div
      className={`${styles.bg} border border-[#E8CFC5]/60 rounded-2xl p-5 flex items-start gap-4 shadow-sm`}
    >
      {/* Icon Circle */}
      <div
        className={`w-12 h-12 rounded-xl ${styles.iconBg} ${styles.iconText} flex items-center justify-center text-2xl shrink-0`}
      >
        {icon}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-[#6F4A4A] mb-1">
          {title}
        </p>
        <p className={`text-2xl font-bold ${styles.valueText} tracking-tight`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-[11px] text-[#6F4A4A] mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
