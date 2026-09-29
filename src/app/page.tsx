/**
 * ============================================================
 * FILE: src/app/page.tsx (Standalone Admin Dashboard UI Redesign)
 * PURPOSE: Luxury Control Center for Keshar Jewellers Admin
 * ============================================================
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import StatCard from "@/components/admin/StatCard";
import { fetchFromAPI } from "@/services/api";
import {
  IconPackage,
  IconShoppingCart,
  IconRupee,
  IconAlertCircle,
  IconPlus,
  IconArrowUpRight,
  IconLayers,
  IconCrown,
  IconTag,
  IconClock,
} from "@/components/admin/Icons";

interface CategorySummary {
  category: string;
  count: number;
  totalStock: number;
}

interface OrderItem {
  productName: string;
  category?: string;
  quantity: number;
  price: number;
}

interface Order {
  id?: string;
  _id?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  totalAmount: number;
  status?: string;
  orderStatus?: string;
  createdAt?: string;
  items: OrderItem[];
  notes?: string;
}

interface Product {
  id: string;
  category: string;
  productType: string;
  sellingPrice: number;
  stock?: number;
  frontImage?: string;
}

export default function AdminDashboard() {
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [allOrdersList, setAllOrdersList] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalStockCount, setTotalStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Products from Express Backend API
      const productsData = await fetchFromAPI("/api/products");
      const products: Product[] = (productsData && productsData.products) || [];
      setTotalProducts(products.length);

      const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
      setTotalStockCount(totalStock);

      // Group by category
      const categoryMap = new Map<string, { count: number; totalStock: number }>();
      products.forEach((p) => {
        const cat = p.category || "uncategorized";
        const existing = categoryMap.get(cat) || { count: 0, totalStock: 0 };
        categoryMap.set(cat, {
          count: existing.count + 1,
          totalStock: existing.totalStock + (p.stock || 0),
        });
      });

      const summary = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.count - a.count);
      setCategorySummary(summary);

      // Filter low stock (< 5 pcs)
      const lowStock = products.filter((p) => (p.stock || 0) < 5);
      setLowStockProducts(lowStock);

      // 2. Fetch Orders from Express Backend API
      try {
        const ordersData = await fetchFromAPI("/api/orders");
        const orders: Order[] = (ordersData && ordersData.orders) || [];
        setAllOrdersList(orders);
        setRecentOrders(orders.slice(0, 6));
        setTotalOrders(orders.length);
        setTotalRevenue(
          orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
        );
      } catch {
        setAllOrdersList([]);
        setRecentOrders([]);
        setTotalOrders(0);
        setTotalRevenue(0);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefreshOrders = async () => {
    setRefreshingOrders(true);
    try {
      const ordersData = await fetchFromAPI("/api/orders");
      const orders: Order[] = (ordersData && ordersData.orders) || [];
      setAllOrdersList(orders);
      setRecentOrders(orders.slice(0, 6));
      setTotalOrders(orders.length);
      setTotalRevenue(
        orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      );
    } catch (e) {
      console.error("Failed to refetch orders:", e);
    } finally {
      setRefreshingOrders(false);
    }
  };

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Current formatted date
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Order status breakdown count computed from all orders
  const orderStatusCounts = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    allOrdersList.forEach((o) => {
      const st = (o.status || o.orderStatus || "pending").toLowerCase();
      if (st.includes("deliver")) counts.delivered++;
      else if (st.includes("ship")) counts.shipped++;
      else if (st.includes("confirm")) counts.confirmed++;
      else if (st.includes("cancel")) counts.cancelled++;
      else counts.pending++;
    });
    return counts;
  }, [allOrdersList]);

  if (loading) {
    return (
      <div className="space-y-7 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-44 bg-[#35191C]/10 rounded-xl w-full border border-[#E8CFC5]" />

        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#FFF0EA] rounded-xl border border-[#E8CFC5] shadow-sm" />
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div className="lg:col-span-5 h-80 bg-[#FFF0EA] rounded-xl border border-[#E8CFC5]" />
          <div className="lg:col-span-7 h-80 bg-[#FFF0EA] rounded-xl border border-[#E8CFC5]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-7 pb-10">
      {/* ── 1. LUXURY HERO WELCOME BANNER ── */}
      <div
        className="relative overflow-hidden rounded-xl text-[#FFF8F0] p-4 sm:p-6 lg:p-8 shadow-2xl border border-[#D4AF37]/35"
        style={{
          background: "linear-gradient(135deg, #35070D 0%, #480C14 45%, #7A1021 100%)",
        }}
      >
        {/* Background Decorative Gold Accents */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 sm:w-64 h-48 sm:h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-36 sm:w-48 h-36 sm:h-48 bg-[#B82E44]/20 rounded-full blur-2xl pointer-events-none" />
        {/* Filigree diagonal pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(212,175,55,0.015) 0, rgba(212,175,55,0.015) 1px, transparent 0, transparent 24px)",
          }}
        />
        <div className="absolute top-4 right-8 opacity-[0.05] sm:opacity-[0.07] text-[#D4AF37]">
          <IconCrown className="w-32 sm:w-48 h-32 sm:h-48" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded bg-[#2C1417]/80 border border-[#D4AF37]/35 text-[#E6C766] text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#E6C766] animate-pulse" />
                {greeting}, Admin ✦
              </span>
              <span className="text-[10px] sm:text-xs text-[#E8CFC5]/70 flex items-center gap-1">
                <IconClock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#E6C766]" />
                {currentDate}
              </span>
            </div>

            <h1 className="font-serif text-xl sm:text-3xl text-white font-bold tracking-tight leading-tight">
              Keshar Jewellers <span className="text-[#E6C766]">Control Center</span>
            </h1>

            <p className="text-[11px] sm:text-sm text-[#FFE2D8]/80 font-light leading-relaxed">
              Live catalog analytics, stock level tracking, customer order bookings, and revenue breakdown.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-0.5 sm:pt-1 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs flex-wrap">
              <span className="flex items-center gap-1 sm:gap-1.5 bg-[#2C1417]/80 border border-[#D4AF37]/35 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded text-[#E6C766] font-semibold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                <IconRupee className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                Revenue: ₹{totalRevenue.toLocaleString("en-IN")}
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5 bg-[#2C1417]/80 border border-[#D4AF37]/35 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded text-[#E6C766] font-semibold shadow-2xs">
                <IconPackage className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                {totalStockCount} Items in Stock
              </span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/products"
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 bg-[#D4AF37] hover:bg-[#E6C766] text-[#35070D] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider rounded shadow-md shadow-[#D4AF37]/25 transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 text-center"
            >
              <IconPlus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span>Add Product</span>
            </Link>

            <Link
              href="/orders"
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 bg-[#4A2528]/80 hover:bg-[#5A3538] border border-[#E8CFC5]/25 hover:border-[#D4AF37]/30 text-[#FFF8F0] text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 text-center"
            >
              <IconShoppingCart className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#E6C766]" />
              <span>Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. SUMMARY KPI STAT CARDS (2 cols on mobile, 4 on desktop) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        <StatCard
          icon={<IconRupee className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          title="Sales Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          subtitle={totalOrders > 0 ? `${totalOrders} orders` : "No orders"}
          trend={totalRevenue > 0 ? `₹${totalRevenue.toLocaleString("en-IN")}` : "₹0"}
          trendUp={totalRevenue > 0}
          color="gold"
        />

        <StatCard
          icon={<IconShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          title="Total Orders"
          value={totalOrders}
          subtitle={recentOrders.length > 0 ? `${recentOrders.length} active` : "0 orders"}
          trend={totalOrders > 0 ? `${totalOrders} Total` : "0"}
          trendUp={totalOrders > 0}
          color="maroon"
        />

        <StatCard
          icon={<IconPackage className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          title="Live Catalog"
          value={totalProducts}
          subtitle={`${categorySummary.length} categories`}
          trend={totalProducts > 0 ? `${totalStockCount} Pcs` : "0"}
          trendUp={totalProducts > 0}
          color="blue"
        />

        <StatCard
          icon={<IconAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          title="Low Stock"
          value={lowStockProducts.length}
          subtitle={lowStockProducts.length > 0 ? `${lowStockProducts.length} refill needed` : "Healthy"}
          trend={lowStockProducts.length > 0 ? "Action" : "Optimal"}
          trendUp={lowStockProducts.length === 0}
          color="purple"
        />
      </div>

      {/* ── 3. MAIN DASHBOARD CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-7">

        {/* Left Column: Category Stock Radar */}
        <div className="lg:col-span-5 space-y-6">
          {/* ── Products by Category Breakdown ── */}
          <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-xl shadow-[0_8px_32px_rgba(53,25,28,0.04)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#E8CFC5]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                <div>
                  <h3 className="font-serif text-base text-[#35191C] font-bold">
                    Inventory Distribution
                  </h3>
                  <p className="text-xs text-[#6F4A4A]">Catalog distribution and live stock volume</p>
                </div>
              </div>
              <Link
                href="/products"
                className="text-xs text-[#7A1021] font-bold hover:text-[#560011] underline tracking-wider uppercase flex items-center gap-1 transition-colors"
              >
                <span>Manage Catalog</span>
                <IconArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {categorySummary.length === 0 ? (
              <div className="p-10 text-center text-sm text-[#6F4A4A]">
                No products found in catalog. Start by adding items in Products page.
              </div>
            ) : (
              <div className="p-5 space-y-4 max-h-[380px] overflow-auto">
                {categorySummary.map((cat) => {
                  const maxStock = Math.max(...categorySummary.map((c) => c.totalStock), 1);
                  const percentage = Math.min(100, Math.round((cat.totalStock / maxStock) * 100));

                  return (
                    <div key={cat.category} className="space-y-1.5 group">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#35191C] capitalize flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          {cat.category.replace(/-/g, " ")}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#6F4A4A]">
                            {cat.count} {cat.count === 1 ? "Product" : "Products"}
                          </span>
                          <span className="font-bold text-[#6F4A4A]">
                            {percentage}%{" "}
                            <span className="font-normal text-[#6F4A4A]/70">({cat.totalStock} pcs)</span>
                          </span>
                        </div>
                      </div>

                      {/* Visual Meter Bar */}
                      <div className="w-full h-2 bg-[#FFF0EA] rounded-full overflow-hidden border border-[#E8CFC5]/50">
                        <div
                          className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                          style={{
                            width: `${Math.max(percentage, 8)}%`,
                            background:
                              percentage < 30
                                ? "linear-gradient(90deg, #B82E44, #ff8187)"
                                : percentage < 60
                                ? "linear-gradient(90deg, #7A1021, #D4AF37)"
                                : "linear-gradient(90deg, #D4AF37, #E6C766)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Pipeline & Recent Orders */}
        <div className="lg:col-span-7 space-y-5">

          {/* Order Status Pipeline - Horizontal Strip */}
          <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-xl p-5 shadow-[0_8px_32px_rgba(53,25,28,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base text-[#35191C] font-bold flex items-center gap-2">
                <IconTag className="w-4 h-4 text-[#B82E44]" />
                Order Status Pipeline
              </h3>
              <span className="text-xs font-bold text-[#A77C18] bg-[#FFF8E7] px-2.5 py-1 rounded border border-[#F3C2AE]">
                {totalOrders} Total
              </span>
            </div>

            {/* Horizontal Pipeline Strip */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "Pending", count: orderStatusCounts.pending, dot: "bg-amber-500", bg: "bg-amber-50 border-amber-200 text-amber-800" },
                { label: "Confirmed", count: orderStatusCounts.confirmed, dot: "bg-purple-500", bg: "bg-purple-50 border-purple-200 text-purple-800" },
                { label: "Shipped", count: orderStatusCounts.shipped, dot: "bg-blue-500", bg: "bg-blue-50 border-blue-200 text-blue-800" },
                { label: "Delivered", count: orderStatusCounts.delivered, dot: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200 text-emerald-800" },
                { label: "Cancelled", count: orderStatusCounts.cancelled, dot: "bg-red-400", bg: "bg-red-50 border-red-200 text-red-700" },
              ].map((s) => (
                <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded border ${s.bg} text-xs font-semibold`}>
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span>{s.label}</span>
                  <span className="font-extrabold">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-xl shadow-[0_8px_32px_rgba(53,25,28,0.04)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#E8CFC5]">
              <div>
                <h3 className="font-serif text-base text-[#35191C] font-bold">
                  Recent Customer Orders
                </h3>
                <p className="text-xs text-[#6F4A4A]">Live database orders &amp; recent bookings</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefreshOrders}
                  disabled={refreshingOrders}
                  title="Refetch backend database orders"
                  className="text-xs font-bold text-[#7C1B2A] bg-[#FFF0EA] hover:bg-[#FFE2D8] border border-[#E8CFC5] px-2.5 py-1 rounded transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <span className={refreshingOrders ? "animate-spin" : ""}>🔄</span>
                  <span>{refreshingOrders ? "Loading..." : "Refresh"}</span>
                </button>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#7A1021] hover:text-[#560011] uppercase tracking-wider transition-colors"
                >
                  <span>View All</span>
                  <IconArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6F4A4A]">
                No orders recorded in database yet. Click Manage Orders to book customer sales.
              </div>
            ) : (
              <div className="divide-y divide-[#E8CFC5]/50 flex-1 overflow-auto max-h-[400px]">
                {recentOrders.map((order) => {
                  const initial = order.customerName ? order.customerName.charAt(0).toUpperCase() : "C";
                  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  }) : "Recent";

                  return (
                    <div
                      key={order.id || order._id}
                      onClick={() => setSelectedOrder(order)}
                      className="py-3.5 px-5 hover:bg-[#FFF9F5] cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Customer Avatar Circle */}
                        <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 bg-gradient-to-br from-[#B82E44] to-[#7C1B2A] text-white flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-[#35191C] truncate group-hover:text-[#7A1021] transition-colors">
                              {order.customerName || "Customer"}
                            </p>
                            <span className="text-[11px] font-mono text-[#6F4A4A] bg-[#FFF0EA] px-1.5 py-0.5 rounded border border-[#E8CFC5]">
                              #{order.id ? order.id.slice(-5).toUpperCase() : "ORDER"}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#6F4A4A] truncate mt-0.5">
                            {order.items?.length || 1} item(s) • {orderDate}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#35191C]">
                            ₹{order.totalAmount?.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold whitespace-nowrap ${
                            order.status === "delivered"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : order.status === "shipped"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : order.status === "confirmed"
                              ? "bg-purple-50 text-purple-800 border border-purple-200"
                              : order.status === "cancelled"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-[#FFE2D8] text-[#560011] border border-[#E8A58A]"
                          }`}
                        >
                          {order.status || "pending"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Order Details Modal Popup ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8CFC5]">
              <div>
                <h3 className="font-serif text-lg text-[#9B1B30] font-bold">
                  Order Details #{selectedOrder.id ? selectedOrder.id.slice(-6).toUpperCase() : ""}
                </h3>
                <span className="text-[11px] text-[#6F4A4A]">
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("en-IN") : "Recent"}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-[#FFF0EA]/60 p-3.5 rounded-2xl border border-[#E8CFC5] space-y-1.5 text-xs">
              <p><span className="font-bold text-[#35191C]">Customer Name:</span> {selectedOrder.customerName}</p>
              <p><span className="font-bold text-[#35191C]">Contact Phone:</span> 📞 {selectedOrder.customerPhone}</p>
              {selectedOrder.customerEmail && (
                <p><span className="font-bold text-[#35191C]">Email:</span> {selectedOrder.customerEmail}</p>
              )}
              {selectedOrder.customerAddress && (
                <p><span className="font-bold text-[#35191C]">Delivery Address:</span> 📍 {selectedOrder.customerAddress}</p>
              )}
              {selectedOrder.notes && (
                <p><span className="font-bold text-[#35191C]">Notes:</span> 📝 {selectedOrder.notes}</p>
              )}
              <div className="pt-1 flex items-center justify-between">
                <span className="font-bold text-[#35191C]">Fulfillment Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#B82E44] text-white">
                  {selectedOrder.status || "pending"}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div>
              <span className="text-xs font-bold text-[#35191C] block mb-2">Order Items:</span>
              <div className="divide-y divide-[#E8CFC5]/50 border border-[#E8CFC5] rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <p className="font-semibold text-[#35191C]">{item.productName}</p>
                      <span className="text-[10px] text-[#6F4A4A] capitalize">
                        {item.category || "Jewellery"} • Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-[#B82E44]">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total & Action */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E8CFC5]">
              <div>
                <span className="text-[11px] text-[#6F4A4A] block">Total Amount:</span>
                <span className="font-serif text-xl font-bold text-[#9B1B30]">
                  ₹{selectedOrder.totalAmount?.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/orders"
                  className="px-4 py-2 bg-[#B82E44] hover:bg-[#7C1B2A] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Manage in Orders →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
