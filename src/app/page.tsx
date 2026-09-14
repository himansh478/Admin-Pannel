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
      <div className="space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-44 bg-[#35191C]/10 rounded-3xl w-full border border-[#E8CFC5]" />
        
        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#FFF0EA] rounded-2xl border border-[#E8CFC5]" />
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-[#FFF0EA] rounded-2xl border border-[#E8CFC5]" />
          <div className="h-80 bg-[#FFF0EA] rounded-2xl border border-[#E8CFC5]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* ── 1. LUXURY HERO WELCOME BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2C1417] via-[#35191C] to-[#4A0E17] text-[#FFF8F0] p-6 sm:p-8 shadow-2xl border border-[#D4AF37]/30">
        {/* Background Decorative Gold Accents */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-[#B82E44]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-4 right-8 opacity-10 text-[#E6C766]">
          <IconCrown className="w-40 h-40" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E6C766] text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E6C766] animate-pulse" />
                {greeting}, Admin ✦
              </span>
              <span className="text-xs text-[#E8CFC5]/80 flex items-center gap-1">
                <IconClock className="w-3.5 h-3.5 text-[#E6C766]" />
                {currentDate}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl text-white font-extrabold tracking-tight">
              Keshar Jewellers <span className="text-[#E6C766]">Control Center</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#E8CFC5]/90 font-light leading-relaxed">
              Live catalog analytics, stock level tracking, customer order bookings, and revenue breakdown from database.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 flex items-center gap-4 text-xs text-[#E6C766] font-semibold flex-wrap">
              <span className="flex items-center gap-1.5 bg-[#4A2528]/60 px-3 py-1 rounded-lg border border-[#D4AF37]/20">
                <IconRupee className="w-3.5 h-3.5" />
                Total Gross Revenue: ₹{totalRevenue.toLocaleString("en-IN")}
              </span>
              <span className="flex items-center gap-1.5 bg-[#4A2528]/60 px-3 py-1 rounded-lg border border-[#D4AF37]/20">
                <IconPackage className="w-3.5 h-3.5" />
                {totalStockCount} Total Items in Stock
              </span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/products"
              className="px-5 py-3 bg-gradient-to-r from-[#E6C766] via-[#D4AF37] to-[#C79C1E] hover:from-[#FFF3C4] hover:to-[#E6C766] text-[#35191C] text-xs font-extrabold uppercase tracking-wider rounded-2xl shadow-lg shadow-[#D4AF37]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <IconPlus className="w-4 h-4 text-[#35191C]" />
              <span>Add New Product</span>
            </Link>

            <Link
              href="/orders"
              className="px-5 py-3 bg-[#4A2528]/80 hover:bg-[#5A3538] border border-[#E8CFC5]/30 text-[#FFF8F0] text-xs font-bold uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2"
            >
              <IconShoppingCart className="w-4 h-4 text-[#E6C766]" />
              <span>Manage Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. SUMMARY KPI STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={<IconRupee className="w-6 h-6 text-white" />}
          title="Gross Sales Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          subtitle={totalOrders > 0 ? `From ${totalOrders} customer orders` : "No orders yet"}
          trend={totalRevenue > 0 ? `₹${totalRevenue.toLocaleString("en-IN")}` : "₹0"}
          trendUp={totalRevenue > 0}
          color="gold"
        />

        <StatCard
          icon={<IconShoppingCart className="w-6 h-6 text-white" />}
          title="Total Store Orders"
          value={totalOrders}
          subtitle={recentOrders.length > 0 ? `${recentOrders.length} recent bookings active` : "No orders recorded"}
          trend={totalOrders > 0 ? `${totalOrders} Total` : "0"}
          trendUp={totalOrders > 0}
          color="maroon"
        />

        <StatCard
          icon={<IconPackage className="w-6 h-6 text-white" />}
          title="Product Catalog"
          value={totalProducts}
          subtitle={`Across ${categorySummary.length} active categories`}
          trend={totalProducts > 0 ? `${totalStockCount} Stock` : "0"}
          trendUp={totalProducts > 0}
          color="blue"
        />

        <StatCard
          icon={<IconAlertCircle className="w-6 h-6 text-white" />}
          title="Low Stock Alerts"
          value={lowStockProducts.length}
          subtitle={lowStockProducts.length > 0 ? `${lowStockProducts.length} items need refill (<5 pcs)` : "All inventory healthy"}
          trend={lowStockProducts.length > 0 ? "Action Needed" : "Optimal"}
          trendUp={lowStockProducts.length === 0}
          color="purple"
        />
      </div>

      {/* ── 3. MAIN DASHBOARD CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Category Stock Radar + Inventory Alerts */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* ── Products by Category Breakdown ── */}
          <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#E8CFC5]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#FFF0EA] text-[#B82E44]">
                  <IconLayers className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg text-[#7C1B2A] font-bold">
                    Category Stock Radar
                  </h3>
                  <p className="text-xs text-[#6F4A4A]">Catalog distribution and live stock volume</p>
                </div>
              </div>
              <Link
                href="/products"
                className="text-xs text-[#B82E44] font-bold hover:underline flex items-center gap-1"
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
              <div className="p-6 space-y-4 max-h-[380px] overflow-auto">
                {categorySummary.map((cat) => {
                  const maxStock = Math.max(...categorySummary.map((c) => c.totalStock), 1);
                  const percentage = Math.min(100, Math.round((cat.totalStock / maxStock) * 100));

                  return (
                    <div key={cat.category} className="space-y-1.5 group">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#35191C] capitalize flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#B82E44]" />
                          {cat.category.replace(/-/g, " ")}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#6F4A4A] font-medium">
                            {cat.count} {cat.count === 1 ? "Product" : "Products"}
                          </span>
                          <span className="font-bold text-[#7C1B2A] bg-[#FFF0EA] px-2 py-0.5 rounded-full border border-[#E8CFC5]">
                            {cat.totalStock} pcs
                          </span>
                        </div>
                      </div>

                      {/* Visual Meter Bar */}
                      <div className="w-full h-2.5 bg-[#FFF0EA] rounded-full overflow-hidden border border-[#E8CFC5]/50">
                        <div
                          className="h-full bg-gradient-to-r from-[#B82E44] via-[#D4AF37] to-[#7C1B2A] rounded-full transition-all duration-500 group-hover:brightness-110"
                          style={{ width: `${Math.max(percentage, 8)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Orders & Order Status breakdown */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Order Status Summary Card */}
          <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8CFC5]/60">
              <h3 className="font-serif text-base text-[#7C1B2A] font-bold flex items-center gap-2">
                <IconTag className="w-4 h-4 text-[#B82E44]" />
                Order Status Pipeline
              </h3>
              <span className="text-xs font-bold text-[#A77C18] bg-[#FFF8E7] px-2.5 py-0.5 rounded-full border border-[#F3C2AE]">
                {totalOrders} Total
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#FFF0EA] border border-[#E8CFC5] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F4A4A]">Pending</span>
                <p className="text-xl font-bold text-[#9B1B30]">{orderStatusCounts.pending}</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Confirmed</span>
                <p className="text-xl font-bold text-purple-900">{orderStatusCounts.confirmed}</p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Shipped</span>
                <p className="text-xl font-bold text-blue-900">{orderStatusCounts.shipped}</p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Delivered</span>
                <p className="text-xl font-bold text-emerald-900">{orderStatusCounts.delivered}</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Cancelled</span>
                <p className="text-xl font-bold text-amber-900">{orderStatusCounts.cancelled}</p>
              </div>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#E8CFC5]">
              <div>
                <h3 className="font-serif text-base text-[#7C1B2A] font-bold">
                  Recent Customer Orders
                </h3>
                <p className="text-xs text-[#6F4A4A]">Live database orders &amp; recent bookings</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefreshOrders}
                  disabled={refreshingOrders}
                  title="Refetch backend database orders"
                  className="text-xs font-bold text-[#7C1B2A] bg-[#FFF0EA] hover:bg-[#FFE2D8] border border-[#E8CFC5] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <span className={refreshingOrders ? "animate-spin" : ""}>🔄</span>
                  <span>{refreshingOrders ? "Loading..." : "Refresh"}</span>
                </button>
                <Link
                  href="/orders"
                  className="text-xs text-[#B82E44] font-bold hover:underline"
                >
                  View All →
                </Link>
              </div>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6F4A4A]">
                No orders recorded in database yet. Click Manage Orders to book customer sales.
              </div>
            ) : (
              <div className="divide-y divide-[#E8CFC5]/50 flex-1 overflow-auto max-h-[380px]">
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
                      className="p-4 hover:bg-[#FFF0EA]/80 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Customer Avatar Circle */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B82E44] to-[#7C1B2A] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-[#35191C] truncate">
                              {order.customerName || "Customer"}
                            </p>
                            <span className="text-[10px] text-[#A77C18] font-mono">
                              #{order.id ? order.id.slice(-5).toUpperCase() : "ORDER"}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#6F4A4A] truncate">
                            📞 {order.customerPhone} • {order.items?.length || 1} item(s) • {orderDate}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-extrabold text-[#7C1B2A]">
                          ₹{order.totalAmount?.toLocaleString("en-IN")}
                        </p>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider mt-0.5 ${
                            order.status === "delivered"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : order.status === "confirmed"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
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
