/**
 * ============================================================
 * FILE: src/app/inventory/page.tsx (Standalone Admin Inventory)
 * PURPOSE: Stock Control, Piece Availability & Low Stock Tracking
 * ============================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { STORE_CATEGORIES, Product } from "@/types/product";
import { fetchFromAPI } from "@/services/api";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Editable stock map: product.id -> stock value
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});

  const showToast = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await fetchFromAPI("/api/products");
      if (data && (data.success || Array.isArray(data.products))) {
        const list: Product[] = data.products || [];
        setProducts(list);

        // Pre-fill local edits state with current stock
        const initialEdits: Record<string, number> = {};
        list.forEach((p) => {
          initialEdits[p.id] = p.stock || 0;
        });
        setStockEdits(initialEdits);
      }
    } catch (error) {
      console.error("Failed to fetch products for inventory", error);
      showToast("error", "Error loading inventory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = (id: string, value: number) => {
    setStockEdits((prev) => ({
      ...prev,
      [id]: Math.max(0, value),
    }));
  };

  const handleSaveStock = async (id: string) => {
    const newStock = stockEdits[id];
    if (newStock === undefined) return;

    try {
      setSavingId(id);
      const data = await fetchFromAPI(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (data && data.success) {
        showToast("success", `Stock updated to ${newStock} pieces!`);
        // Update product in local state
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
        );
      } else {
        showToast("error", data?.error || "Failed to update stock.");
      }
    } catch (error) {
      console.error("Failed to update stock", error);
      showToast("error", "API connection error.");
    } finally {
      setSavingId(null);
    }
  };

  // Compute category statistics
  const categoryStats = STORE_CATEGORIES.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat.slug);
    const totalStock = catProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    return {
      slug: cat.slug,
      name: cat.name,
      count: catProducts.length,
      stock: totalStock,
    };
  }).filter((c) => c.count > 0);

  const lowStockProducts = products.filter((p) => (p.stock || 0) < 5);
  const totalStoreStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory ? p.category === filterCategory : true;
    const matchesSearch = searchQuery
      ? p.productType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#9B1B30] font-bold">
            Inventory Management
          </h1>
          <p className="text-sm text-[#6F4A4A] mt-1">
            Track available pieces per product, refill stock, and monitor low inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-[#FFF0EA] border border-[#E8CFC5] text-[#7C1B2A] text-xs font-bold rounded-xl shadow-sm">
            Total Inventory: {totalStoreStock} Pieces
          </span>
          <button
            onClick={fetchProducts}
            className="px-3 py-2 bg-[#B82E44] hover:bg-[#7C1B2A] text-[#FFF8F0] text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium transition-all ${
            statusMessage.type === "success"
              ? "bg-green-50 border-green-300 text-green-800"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Low Stock Warning Alert */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <span className="font-bold block text-sm">Critical Inventory Alert</span>
              <span className="text-xs text-red-700">
                {lowStockProducts.length} product(s) have less than 5 pieces left in stock.
              </span>
            </div>
          </div>
          <button
            onClick={() => setFilterCategory("")}
            className="text-xs font-bold underline hover:text-red-900"
          >
            Review Items Below ↓
          </button>
        </div>
      )}

      {/* ── Category Stock Overview Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoryStats.map((stat) => (
          <button
            key={stat.slug}
            onClick={() => setFilterCategory(filterCategory === stat.slug ? "" : stat.slug)}
            className={`p-4 rounded-xl border text-left transition-all ${
              filterCategory === stat.slug
                ? "bg-[#B82E44] text-[#FFF8F0] border-[#B82E44] shadow-md scale-[1.02]"
                : "bg-[#FFFDFC] text-[#35191C] border-[#E8CFC5] hover:border-[#B82E44]"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75 truncate">
              {stat.name}
            </span>
            <span className="text-2xl font-serif font-bold block my-1">
              {stat.stock} <span className="text-xs font-sans font-normal">pcs</span>
            </span>
            <span className="text-[10px] opacity-80 block">
              {stat.count} products listed
            </span>
          </button>
        ))}
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-3 text-[#6F4A4A] text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search inventory by product type or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl text-xs focus:outline-none focus:border-[#B82E44]"
          />
        </div>

        <div className="w-full md:w-64 shrink-0">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl text-xs font-medium focus:outline-none focus:border-[#B82E44]"
          >
            <option value="">All Categories ({products.length})</option>
            {STORE_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Inventory Stock Table ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#6F4A4A] text-sm animate-pulse">
            Loading inventory stock levels...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-[#6F4A4A]">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm font-medium">No products match this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#7C1B2A] text-[#E6C766]">
                  <th className="p-3 border-b border-[#E8CFC5]/20">Photo</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Product Type</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Category</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Price</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Current Stock</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Update Stock</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8CFC5]/50 bg-white">
                {filteredProducts.map((p) => {
                  const currentLocalStock = stockEdits[p.id] ?? (p.stock || 0);
                  const isDirty = currentLocalStock !== (p.stock || 0);

                  return (
                    <tr key={p.id} className="hover:bg-[#FFF8F0] transition-colors">
                      <td className="p-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#E8CFC5] bg-[#FFF0EA]">
                          {p.frontImage ? (
                            <Image
                              src={p.frontImage}
                              alt={p.productType}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-[9px] text-[#6F4A4A]">
                              No pic
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-[#35191C]">{p.productType}</td>
                      <td className="p-3 font-medium text-[#B82E44] capitalize">
                        {p.category.replace(/-/g, " ")}
                      </td>
                      <td className="p-3 font-bold text-[#35191C]">₹{p.sellingPrice}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            (p.stock || 0) < 5
                              ? "bg-red-100 text-red-800"
                              : (p.stock || 0) < 20
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {p.stock || 0} pcs available
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockChange(p.id, currentLocalStock - 1)}
                            className="w-7 h-7 rounded-lg bg-[#FFF0EA] hover:bg-[#FFE2D8] border border-[#E8CFC5] font-bold text-sm text-[#7C1B2A] flex items-center justify-center transition-all"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={currentLocalStock}
                            onChange={(e) => handleStockChange(p.id, parseInt(e.target.value, 10) || 0)}
                            className="w-16 p-1.5 text-center font-bold bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-lg text-xs focus:outline-none focus:border-[#B82E44]"
                          />
                          <button
                            onClick={() => handleStockChange(p.id, currentLocalStock + 1)}
                            className="w-7 h-7 rounded-lg bg-[#FFF0EA] hover:bg-[#FFE2D8] border border-[#E8CFC5] font-bold text-sm text-[#7C1B2A] flex items-center justify-center transition-all"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleSaveStock(p.id)}
                          disabled={savingId === p.id || !isDirty}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            isDirty
                              ? "bg-[#B82E44] hover:bg-[#7C1B2A] text-[#FFF8F0] shadow-sm animate-pulse"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {savingId === p.id ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
