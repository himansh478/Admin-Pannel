/**
 * ============================================================
 * FILE: src/components/admin/UserDetailModal.tsx
 * PURPOSE: Comprehensive User Detail Modal displaying registered account profile,
 * contact details, shopping history, delivery addresses, and admin actions.
 * ============================================================
 */

"use client";

import { useState } from "react";
import {
  IconX,
  IconCrown,
  IconShieldCheck,
  IconClock,
  IconShoppingCart,
  IconRupee,
  IconUsers,
} from "@/components/admin/Icons";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface UserOrderItem {
  productName: string;
  category: string;
  quantity: number;
  price: number;
}

export interface UserOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  items: UserOrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  createdAt?: string;
}

interface UserDetailModalProps {
  user: UserAccount | null;
  orders: UserOrder[];
  isOpen: boolean;
  onClose: () => void;
  onToggleRole: (id: string, currentRole: "user" | "admin") => void;
  onDeleteUser: (id: string, name: string) => void;
  isActionLoading: boolean;
}

export default function UserDetailModal({
  user,
  orders,
  isOpen,
  onClose,
  onToggleRole,
  onDeleteUser,
  isActionLoading,
}: UserDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const isAdmin = user.role === "admin";
  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  // Filter user orders matching email, phone, or name
  const userOrders = orders.filter((o) => {
    const matchEmail =
      user.email && o.customerEmail && o.customerEmail.toLowerCase().trim() === user.email.toLowerCase().trim();
    const matchPhone =
      user.phone && o.customerPhone && o.customerPhone.trim() === user.phone.trim();
    const matchName =
      user.name && o.customerName && o.customerName.toLowerCase().trim() === user.name.toLowerCase().trim();
    return matchEmail || matchPhone || matchName;
  });

  const totalOrders = userOrders.length;
  const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

  // Extract addresses from past orders
  const addresses = Array.from(
    new Set(
      userOrders
        .map((o) => o.customerAddress?.trim())
        .filter((addr): addr is string => Boolean(addr && addr.length > 3))
    )
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "shipped":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "confirmed":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#2C1417]/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#FFFDFC] border border-[#E8CFC5] rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. MODAL HEADER BANNER ── */}
        <div className="relative bg-gradient-to-r from-[#2C1417] via-[#35191C] to-[#4A0E17] text-[#FFF8F0] p-6 sm:p-8 shrink-0">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-[#FFF8F0] transition-colors border border-white/10"
            title="Close modal"
          >
            <IconX className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* User Large Avatar */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-serif font-extrabold text-2xl sm:text-3xl text-white shadow-xl shrink-0 border-2 ${
                isAdmin
                  ? "bg-gradient-to-br from-[#E6C766] via-[#D4AF37] to-[#A77C18] border-[#FFE6A0]"
                  : "bg-gradient-to-br from-[#B82E44] to-[#7C1B2A] border-[#E8CFC5]"
              }`}
            >
              {initial}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user.name}
                </h2>

                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    isAdmin
                      ? "bg-[#FFF8E7] text-[#9E7310] border border-[#F3C2AE]"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {isAdmin ? (
                    <>
                      <IconCrown className="w-3.5 h-3.5 text-[#9E7310]" />
                      Admin Privileges
                    </>
                  ) : (
                    <>
                      <IconShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Customer
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs text-[#E8CFC5]/90 font-mono">
                Account ID: <span className="text-[#E6C766]">{user.id}</span>
              </p>

              <p className="text-xs text-[#E8CFC5]/80 flex items-center gap-1.5 pt-0.5">
                <IconClock className="w-3.5 h-3.5 text-[#E6C766]" />
                Registered on{" "}
                {new Date(user.createdAt || Date.now()).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. MODAL BODY CONTENT (SCROLLABLE) ── */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#FFF0EA]/70 border border-[#E8CFC5] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#6F4A4A] font-semibold">
                <span>Total Orders</span>
                <IconShoppingCart className="w-4 h-4 text-[#B82E44]" />
              </div>
              <p className="text-2xl font-serif font-extrabold text-[#35191C]">
                {totalOrders}
              </p>
              <p className="text-[11px] text-[#6F4A4A]">Placed by this customer</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF8E7]/70 border border-[#F3C2AE] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#9E7310] font-semibold">
                <span>Total Spend</span>
                <IconRupee className="w-4 h-4 text-[#9E7310]" />
              </div>
              <p className="text-2xl font-serif font-extrabold text-[#35191C]">
                ₹{totalSpent.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-[#6F4A4A]">Lifetime purchase value</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF0EA]/70 border border-[#E8CFC5] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#6F4A4A] font-semibold">
                <span>Avg Order Value</span>
                <IconRupee className="w-4 h-4 text-[#B82E44]" />
              </div>
              <p className="text-2xl font-serif font-extrabold text-[#35191C]">
                ₹{avgOrderValue.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-[#6F4A4A]">Per order average</p>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="bg-white border border-[#E8CFC5] rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="font-serif text-sm font-bold text-[#7C1B2A] flex items-center gap-2 border-b border-[#E8CFC5]/50 pb-2">
              <IconUsers className="w-4 h-4 text-[#B82E44]" />
              Contact &amp; Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Email Address */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#FFF0EA]/50 border border-[#E8CFC5]/60">
                <span className="text-[11px] font-bold text-[#6F4A4A] uppercase tracking-wider block">
                  Email Address
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#35191C] break-all">
                    {user.email}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(user.email, "email")}
                      className="px-2 py-1 rounded-lg bg-white border border-[#E8CFC5] text-[10px] font-bold text-[#7C1B2A] hover:bg-[#FFF0EA] transition-all"
                    >
                      {copiedField === "email" ? "Copied!" : "Copy"}
                    </button>
                    <a
                      href={`mailto:${user.email}`}
                      className="px-2 py-1 rounded-lg bg-[#B82E44] text-white text-[10px] font-bold hover:bg-[#7C1B2A] transition-all"
                    >
                      Mail
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#FFF0EA]/50 border border-[#E8CFC5]/60">
                <span className="text-[11px] font-bold text-[#6F4A4A] uppercase tracking-wider block">
                  Phone Number
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#35191C]">
                    {user.phone ? `📞 ${user.phone}` : "No phone provided"}
                  </span>
                  {user.phone && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopy(user.phone, "phone")}
                        className="px-2 py-1 rounded-lg bg-white border border-[#E8CFC5] text-[10px] font-bold text-[#7C1B2A] hover:bg-[#FFF0EA] transition-all"
                      >
                        {copiedField === "phone" ? "Copied!" : "Copy"}
                      </button>
                      <a
                        href={`tel:${user.phone}`}
                        className="px-2 py-1 rounded-lg bg-[#B82E44] text-white text-[10px] font-bold hover:bg-[#7C1B2A] transition-all"
                      >
                        Call
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Addresses from Order History */}
            {addresses.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E8CFC5]/40">
                <span className="text-[11px] font-bold text-[#6F4A4A] uppercase tracking-wider block">
                  Saved Shipping Address(es)
                </span>
                <div className="space-y-2">
                  {addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FFF8F0] border border-[#E8CFC5] text-xs text-[#35191C] font-medium"
                    >
                      📍 {addr}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order History Section */}
          <div className="bg-white border border-[#E8CFC5] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E8CFC5]/50 pb-2">
              <h3 className="font-serif text-sm font-bold text-[#7C1B2A] flex items-center gap-2">
                <IconShoppingCart className="w-4 h-4 text-[#B82E44]" />
                Customer Order History ({totalOrders})
              </h3>
            </div>

            {userOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6F4A4A] space-y-1 bg-[#FFF0EA]/30 rounded-xl">
                <p className="font-bold text-[#35191C]">No purchase history found</p>
                <p>This user has not completed any store orders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8CFC5]/40 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] text-[#7C1B2A] uppercase tracking-wider font-extrabold bg-[#FFF0EA]/60">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8CFC5]/30">
                    {userOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#FFF0EA]/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#7C1B2A]">
                          #{ord.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3 px-3 text-[#6F4A4A]">
                          {ord.createdAt
                            ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#35191C]">
                          {ord.items && ord.items.length > 0 ? (
                            <span>
                              {ord.items[0].productName}
                              {ord.items.length > 1 && ` +${ord.items.length - 1} more`}
                            </span>
                          ) : (
                            "1 Item"
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#35191C]">
                          ₹{(ord.totalAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(
                              ord.status
                            )}`}
                          >
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. MODAL FOOTER ACTIONS ── */}
        <div className="bg-[#FFF0EA] border-t border-[#E8CFC5] p-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              disabled={isActionLoading}
              onClick={() => onToggleRole(user.id, user.role)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#FFE2D8] border border-[#E8CFC5] text-[#7C1B2A] text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
            >
              <IconCrown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isAdmin ? "Demote to Customer" : "Promote to Admin"}</span>
            </button>

            <button
              disabled={isActionLoading}
              onClick={() => onDeleteUser(user.id, user.name)}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all disabled:opacity-50 shadow-xs"
            >
              Delete Account
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#35191C] hover:bg-[#4A2528] text-white text-xs font-bold transition-all shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
