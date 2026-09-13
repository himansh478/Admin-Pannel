/**
 * ============================================================
 * FILE: src/components/admin/CategoryStockChart.tsx
 * PURPOSE: Interactive Visual Progress Chart for Store Categories & Inventory Share.
 * ============================================================
 */

"use client";

import React from "react";
import Link from "next/link";
import { IconLayers, IconArrowUpRight, IconGem } from "./Icons";

interface CategorySummary {
  category: string;
  count: number;
  totalStock: number;
}

interface CategoryStockChartProps {
  categories: CategorySummary[];
  totalProductsCount: number;
}

export default function CategoryStockChart({
  categories,
  totalProductsCount,
}: CategoryStockChartProps) {
  const topCategories = categories.slice(0, 7);

  // Maximum count for relative bar width
  const maxCount = Math.max(...topCategories.map((c) => c.count), 1);

  return (
    <div className="luxury-card rounded-2xl p-5 md:p-6 flex flex-col justify-between space-y-5">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8CFC5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0EA] text-[#B82E44] border border-[#E8CFC5] flex items-center justify-center">
            <IconLayers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-[#7C1B2A] font-bold tracking-tight">
              Catalog &amp; Category Stock Share
            </h3>
            <p className="text-xs text-[#6F4A4A]">
              Listed designs and inventory pcs per collection
            </p>
          </div>
        </div>

        <Link
          href="/products"
          className="px-3 py-1.5 rounded-xl bg-[#FFF0EA] hover:bg-[#FFE2D8] text-[#7C1B2A] border border-[#E8CFC5] text-xs font-bold transition-all flex items-center gap-1 group"
        >
          <span>Catalog</span>
          <IconArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Visual Bars Content */}
      {topCategories.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#6F4A4A]">
          No category items recorded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {topCategories.map((cat, idx) => {
            const percentage = totalProductsCount > 0
              ? Math.round((cat.count / totalProductsCount) * 100)
              : 0;
            const barWidth = Math.max(Math.round((cat.count / maxCount) * 100), 8);

            // Palette gradient variants
            const barGradients = [
              "from-[#B82E44] to-[#7C1B2A]",
              "from-[#D4AF37] to-[#A77C18]",
              "from-purple-600 to-indigo-800",
              "from-emerald-500 to-teal-700",
              "from-amber-500 to-rose-600",
              "from-sky-500 to-blue-700",
              "from-pink-500 to-rose-700",
            ];
            const gradient = barGradients[idx % barGradients.length];

            return (
              <div key={cat.category} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B82E44]" />
                    <span className="font-semibold text-[#35191C] capitalize">
                      {cat.category.replace(/-/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[11px] text-[#6F4A4A]">
                      {cat.totalStock} pcs in stock
                    </span>
                    <span className="font-bold text-[#7C1B2A] min-w-[50px] text-right">
                      {cat.count} items <span className="text-[10px] text-gray-500 font-normal">({percentage}%)</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-3 bg-[#FFF0EA] rounded-full overflow-hidden p-0.5 border border-[#E8CFC5]/50">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out group-hover:brightness-110`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Meta Summary */}
      <div className="pt-3 border-t border-[#E8CFC5]/50 flex items-center justify-between text-xs text-[#6F4A4A]">
        <div className="flex items-center gap-1.5">
          <IconGem className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Active Collections: <strong>{categories.length}</strong></span>
        </div>
        <span className="text-[11px] text-gray-500">Live MongoDB Aggregation</span>
      </div>
    </div>
  );
}
