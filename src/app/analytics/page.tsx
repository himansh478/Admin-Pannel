/**
 * ============================================================
 * FILE: src/app/analytics/page.tsx (Standalone Admin Analytics)
 * PURPOSE: Category-wise Sales Reports, Top Products & Store Metrics
 * ============================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import StatCard from "@/components/admin/StatCard";
import { STORE_CATEGORIES, Product } from "@/types/product";

export default function AnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products").catch(() => ({ ok: false, json: async () => ({ products: [] }) })),
        fetch("/api/orders").catch(() => ({ ok: false, json: async () => ({ orders: [] }) })),
      ]);

      const [productsData, ordersData] = await Promise.all([
        productsRes.ok ? productsRes.json() : { products: [] },
        ordersRes.ok ? ordersRes.json() : { orders: [] },
      ]);

      setProducts(productsData.products || []);
      setOrders(ordersData.orders || []);
    } catch (error) {
      console.error("Failed to fetch analytics data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Derive High-Level Metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : "0";

  // Category Performance Analysis
  const categoryPerformance = STORE_CATEGORIES.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat.slug);
    const totalStock = catProducts.reduce((sum, p) => sum + (p.stock || 0), 0);

    let catOrdersCount = 0;
    let catRevenue = 0;

    orders.forEach((order) => {
      order.items?.forEach((item: any) => {
        if (item.category === cat.slug) {
          catOrdersCount += item.quantity || 1;
          catRevenue += (item.price || 0) * (item.quantity || 1);
        }
      });
    });

    return {
      name: cat.name,
      slug: cat.slug,
      productsCount: catProducts.length,
      stock: totalStock,
      orders: catOrdersCount,
      revenue: catRevenue,
    };
  })
    .filter((c) => c.productsCount > 0 || c.orders > 0)
    .sort((a, b) => b.revenue - a.revenue || b.productsCount - a.productsCount);

  const mostPopularCategory = categoryPerformance.length > 0 ? categoryPerformance[0].name : "None yet";

  // Top Products by Stock & Activity
  const topProducts = [...products]
    .sort((a, b) => ((b.likes || 0) * 10 + (b.stock || 0)) - ((a.likes || 0) * 10 + (a.stock || 0)))
    .slice(0, 10);

  // Status breakdown
  const orderStatuses = {
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[#6F4A4A] text-sm animate-pulse">
        Computing analytics reports from live database...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#9B1B30] font-bold">
            Analytics &amp; Sales Reports
          </h1>
          <p className="text-sm text-[#6F4A4A] mt-1">
            Category-wise performance, revenue metrics, and inventory distribution.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-[#FFF0EA] border border-[#E8CFC5] text-[#7C1B2A] text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          🔄 Refresh Metrics
        </button>
      </div>

      {/* ── Revenue Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="💰"
          title="Gross Sales"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          subtitle="All confirmed bookings"
          color="green"
        />
        <StatCard
          icon="🧾"
          title="Avg. Order Value"
          value={`₹${Number(averageOrderValue).toLocaleString("en-IN")}`}
          subtitle="Revenue per customer order"
          color="gold"
        />
        <StatCard
          icon="📈"
          title="Total Bookings"
          value={totalOrders}
          subtitle="Processed in system"
          color="blue"
        />
        <StatCard
          icon="👑"
          title="Top Category"
          value={mostPopularCategory}
          subtitle="Highest demand collection"
          color="maroon"
        />
      </div>

      {/* ── Order Status Progress Distribution ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-lg text-[#9B1B30] font-bold">
          Order Fulfillment Funnel
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">Pending</span>
            <span className="text-2xl font-serif font-bold text-amber-900 block my-1">{orderStatuses.pending}</span>
            <span className="text-[10px] text-amber-700">Awaiting processing</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 block">Confirmed</span>
            <span className="text-2xl font-serif font-bold text-purple-900 block my-1">{orderStatuses.confirmed}</span>
            <span className="text-[10px] text-purple-700">Ready to pack</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">Shipped</span>
            <span className="text-2xl font-serif font-bold text-blue-900 block my-1">{orderStatuses.shipped}</span>
            <span className="text-[10px] text-blue-700">In courier transit</span>
          </div>
          <div className="p-3 rounded-xl bg-green-50 border border-green-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-green-800 block">Delivered</span>
            <span className="text-2xl font-serif font-bold text-green-900 block my-1">{orderStatuses.delivered}</span>
            <span className="text-[10px] text-green-700">Completed sale</span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 block">Cancelled</span>
            <span className="text-2xl font-serif font-bold text-red-900 block my-1">{orderStatuses.cancelled}</span>
            <span className="text-[10px] text-red-700">Voided orders</span>
          </div>
        </div>
      </div>

      {/* ── Category Breakdown Table ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E8CFC5]">
          <h3 className="font-serif text-lg text-[#9B1B30] font-bold">
            Category Performance &amp; Revenue Breakdown
          </h3>
          <p className="text-xs text-[#6F4A4A]">Products listed, stock available, and total sales per category.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#7C1B2A] text-[#E6C766]">
                <th className="p-3 border-b border-[#E8CFC5]/20">Category Name</th>
                <th className="p-3 border-b border-[#E8CFC5]/20">Listed Products</th>
                <th className="p-3 border-b border-[#E8CFC5]/20">Inventory Available</th>
                <th className="p-3 border-b border-[#E8CFC5]/20">Orders Count</th>
                <th className="p-3 border-b border-[#E8CFC5]/20 text-right">Category Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8CFC5]/50 bg-white">
              {categoryPerformance.map((c) => (
                <tr key={c.slug} className="hover:bg-[#FFF8F0] transition-colors">
                  <td className="p-3 font-bold text-[#B82E44] capitalize">{c.name}</td>
                  <td className="p-3 font-semibold text-[#35191C]">{c.productsCount} items</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0EA] text-[#7C1B2A] border border-[#E8CFC5]">
                      {c.stock} pcs
                    </span>
                  </td>
                  <td className="p-3 font-medium text-[#35191C]">{c.orders} sold</td>
                  <td className="p-3 text-right font-bold text-[#B82E44]">
                    ₹{c.revenue.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Top Products by Popularity & Availability ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E8CFC5]">
          <h3 className="font-serif text-lg text-[#9B1B30] font-bold">
            Featured Active Products
          </h3>
          <p className="text-xs text-[#6F4A4A]">Products with active inventory and catalog presence.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#7C1B2A] text-[#E6C766]">
                <th className="p-3 border-b border-[#E8CFC5]/20">Product</th>
                <th className="p-3 border-b border-[#E8CFC5]/20">Category</th>
                <th className="p-3 border-b border-[#E8CFC5]/20">Material</th>
                <th className="p-3 border-b border-[#E8CFC5]/20">Selling Price</th>
                <th className="p-3 border-b border-[#E8CFC5]/20">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8CFC5]/50 bg-white">
              {topProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FFF8F0] transition-colors">
                  <td className="p-3 font-semibold text-[#35191C]">{p.productType}</td>
                  <td className="p-3 font-medium text-[#B82E44] capitalize">{p.category.replace(/-/g, " ")}</td>
                  <td className="p-3 text-[#6F4A4A]">{p.material}</td>
                  <td className="p-3 font-bold text-[#B82E44]">₹{p.sellingPrice}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (p.stock || 0) < 5
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {p.stock || 0} pcs
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
