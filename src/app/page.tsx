/**
 * ============================================================
 * FILE: src/app/page.tsx (Standalone Admin Dashboard)
 * PURPOSE: Overview Control Center for Keshar Jewellers Admin
 * ============================================================
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StatCard from "@/components/admin/StatCard";

interface CategorySummary {
  category: string;
  count: number;
  totalStock: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { productName: string; quantity: number; price: number }[];
}

interface Product {
  id: string;
  category: string;
  productType: string;
  sellingPrice: number;
  stock?: number;
  frontImage: string;
}

export default function AdminDashboard() {
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch Products
        const productsRes = await fetch("/api/products");
        const productsData = await productsRes.json();
        const products: Product[] = productsData.products || [];
        setTotalProducts(products.length);

        // Group by category
        const categoryMap = new Map<string, { count: number; totalStock: number }>();
        products.forEach((p) => {
          const existing = categoryMap.get(p.category) || { count: 0, totalStock: 0 };
          categoryMap.set(p.category, {
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
        setLowStockProducts(lowStock.slice(0, 10));

        // 2. Fetch Orders
        try {
          const ordersRes = await fetch("/api/orders");
          const ordersData = await ordersRes.json();
          const orders: Order[] = ordersData.orders || [];
          setRecentOrders(orders.slice(0, 5));
          setTotalOrders(orders.length);
          setTotalRevenue(
            orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
          );
        } catch {
          setRecentOrders([]);
          setTotalOrders(0);
          setTotalRevenue(0);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[#E8CFC5]/30 rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#E8CFC5]/20 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[#E8CFC5]/20 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#9B1B30] tracking-tight font-bold">
            Store Dashboard
          </h1>
          <p className="text-sm text-[#6F4A4A] mt-1">
            Real-time catalog, live stock status, orders, and sales performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="px-4 py-2 bg-[#B82E44] hover:bg-[#7C1B2A] text-[#FFF8F0] text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all"
          >
            + Add Product
          </Link>
          <Link
            href="/orders"
            className="px-4 py-2 bg-[#FFF0EA] hover:bg-[#FFE2D8] border border-[#E8CFC5] text-[#35191C] text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="📦"
          title="Total Products"
          value={totalProducts}
          subtitle={`Across ${categorySummary.length} categories`}
          color="maroon"
        />
        <StatCard
          icon="📂"
          title="Active Categories"
          value={categorySummary.length}
          subtitle="Jewellery collections"
          color="gold"
        />
        <StatCard
          icon="🛒"
          title="Total Orders"
          value={totalOrders}
          subtitle="Customer bookings"
          color="blue"
        />
        <StatCard
          icon="💰"
          title="Gross Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          subtitle="From confirmed orders"
          color="green"
        />
      </div>

      {/* ── Two Column Layout: Category Summary + Recent Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-[#E8CFC5]">
            <div>
              <h3 className="font-serif text-lg text-[#9B1B30] font-bold">
                Products by Category
              </h3>
              <p className="text-xs text-[#6F4A4A]">Listed items and stock per category</p>
            </div>
            <Link
              href="/products"
              className="text-xs text-[#B82E44] font-semibold hover:underline"
            >
              Manage Catalog →
            </Link>
          </div>
          {categorySummary.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#6F4A4A]">
              No products found. Start by adding items in Products page.
            </div>
          ) : (
            <div className="divide-y divide-[#E8CFC5]/50 flex-1 overflow-auto max-h-[380px]">
              {categorySummary.map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[#FFF0EA] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#B82E44]/10 text-[#B82E44] flex items-center justify-center text-sm font-bold">
                      {cat.count}
                    </span>
                    <span className="text-sm font-medium text-[#35191C] capitalize">
                      {cat.category.replace(/-/g, " ")}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFF0EA] text-[#7C1B2A] border border-[#E8CFC5]">
                    {cat.totalStock} pcs in stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-[#E8CFC5]">
            <div>
              <h3 className="font-serif text-lg text-[#9B1B30] font-bold">
                Recent Orders
              </h3>
              <p className="text-xs text-[#6F4A4A]">Latest customer bookings and sales</p>
            </div>
            <Link
              href="/orders"
              className="text-xs text-[#B82E44] font-semibold hover:underline"
            >
              View All Orders →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#6F4A4A]">
              No orders placed yet. Add or record orders in the Orders tab.
            </div>
          ) : (
            <div className="divide-y divide-[#E8CFC5]/50 flex-1 overflow-auto max-h-[380px]">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[#FFF0EA] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[#35191C]">
                      {order.customerName}
                    </p>
                    <p className="text-[11px] text-[#6F4A4A]">
                      📞 {order.customerPhone} • {order.items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#9B1B30]">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </p>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Low Stock Alert Banner ── */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-red-200">
            <div>
              <h3 className="font-serif text-lg text-red-800 font-bold flex items-center gap-2">
                <span>⚠️</span> Critical Low Stock Alert
              </h3>
              <p className="text-xs text-red-600 mt-0.5">
                The following products have less than 5 pieces available in inventory.
              </p>
            </div>
            <Link
              href="/inventory"
              className="text-xs text-red-700 font-bold hover:underline"
            >
              Refill Stock Now →
            </Link>
          </div>
          <div className="divide-y divide-red-100">
            {lowStockProducts.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[#35191C]">
                    {p.productType}
                  </p>
                  <p className="text-[11px] text-[#6F4A4A] capitalize">
                    {p.category.replace(/-/g, " ")} • ₹{p.sellingPrice}
                  </p>
                </div>
                <span className="px-3 py-1 bg-red-200 text-red-900 text-xs font-bold rounded-full">
                  {p.stock || 0} pcs left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
