/**
 * ============================================================
 * FILE: src/components/admin/OrderFulfillmentFunnel.tsx
 * PURPOSE: Interactive Visual Order Fulfillment Progress Funnel.
 * ============================================================
 */

"use client";

import React from "react";
import Link from "next/link";
import { IconShoppingCart, IconArrowUpRight, IconClock } from "./Icons";

interface OrderFulfillmentProps {
  ordersCount: number;
  revenue: number;
  statusCounts: {
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export default function OrderFulfillmentFunnel({
  ordersCount,
  revenue,
  statusCounts,
}: OrderFulfillmentProps) {
  const statuses = [
    {
      key: "pending",
      label: "Pending",
      count: statusCounts.pending,
      color: "bg-amber-500",
      bgBadge: "bg-amber-50 border-amber-200 text-amber-800",
      desc: "New bookings awaiting confirmation",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      count: statusCounts.confirmed,
      color: "bg-purple-500",
      bgBadge: "bg-purple-50 border-purple-200 text-purple-800",
      desc: "Accepted & being packed",
    },
    {
      key: "shipped",
      label: "Shipped",
      count: statusCounts.shipped,
      color: "bg-sky-500",
      bgBadge: "bg-sky-50 border-sky-200 text-sky-800",
      desc: "Out for courier dispatch",
    },
    {
      key: "delivered",
      label: "Delivered",
      count: statusCounts.delivered,
      color: "bg-emerald-500",
      bgBadge: "bg-emerald-50 border-emerald-200 text-emerald-800",
      desc: "Completed sales",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: statusCounts.cancelled,
      color: "bg-rose-500",
      bgBadge: "bg-rose-50 border-rose-200 text-rose-800",
      desc: "Voided or returned orders",
    },
  ];

  return (
    <div className="luxury-card rounded-2xl p-5 md:p-6 flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8CFC5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#A77C18] border border-[#F3C2AE] flex items-center justify-center">
            <IconShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-[#7C1B2A] font-bold tracking-tight">
              Order Fulfillment Pipeline
            </h3>
            <p className="text-xs text-[#6F4A4A]">
              Live status distribution of customer bookings
            </p>
          </div>
        </div>

        <Link
          href="/orders"
          className="px-3 py-1.5 rounded-xl bg-[#FFF0EA] hover:bg-[#FFE2D8] text-[#7C1B2A] border border-[#E8CFC5] text-xs font-bold transition-all flex items-center gap-1 group"
        >
          <span>Orders Hub</span>
          <IconArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid of status tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statuses.map((s) => {
          const percentage = ordersCount > 0 ? Math.round((s.count / ordersCount) * 100) : 0;

          return (
            <div
              key={s.key}
              className={`p-3 rounded-xl border flex flex-col justify-between text-center transition-all hover:scale-[1.02] ${s.bgBadge}`}
            >
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {s.label}
                  </span>
                </div>
                <span className="font-serif text-2xl font-bold block my-1">
                  {s.count}
                </span>
              </div>
              <div className="pt-1 border-t border-black/5 text-[9px] font-semibold opacity-80">
                {percentage}% of orders
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Revenue & Pipeline Summary Footer */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#FFF0EA] to-[#FFF8E7] border border-[#E8CFC5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#35191C]">
          <IconClock className="w-4 h-4 text-[#B82E44]" />
          <span>
            Total Revenue Booked:{" "}
            <strong className="text-[#9B1B30] font-serif text-base">
              ₹{revenue.toLocaleString("en-IN")}
            </strong>
          </span>
        </div>

        <span className="text-[11px] font-bold text-[#7C1B2A] bg-white px-3 py-1 rounded-full border border-[#E8CFC5] shadow-xs">
          {statusCounts.pending} Orders Need Action
        </span>
      </div>
    </div>
  );
}
