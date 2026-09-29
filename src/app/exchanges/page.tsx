"use client";

import React, { useState, useEffect } from "react";
import { fetchFromAPI } from "@/services/api";
import { IconPackage, IconSearch, IconSparkles } from "@/components/admin/Icons";

interface OrderItem {
  productId?: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  isExchangeRequested?: boolean;
  exchangeReason?: string;
  exchangePhoto?: string;
  exchangeStatus?: string;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  createdAt?: string;
}

interface ExchangeRequest {
  orderId: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  exchangeReason: string;
  exchangePhoto: string;
  exchangeStatus: string;
  orderDate: string;
}

export default function ExchangesPage() {
  const [exchanges, setExchanges] = useState<ExchangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExchange, setSelectedExchange] = useState<ExchangeRequest | null>(null);

  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFromAPI("/api/orders");
      if (data && data.success && data.orders) {
        const allOrders: Order[] = data.orders;
        const extractedExchanges: ExchangeRequest[] = [];

        allOrders.forEach((order) => {
          order.items.forEach((item) => {
            if (item.isExchangeRequested) {
              extractedExchanges.push({
                orderId: order.id,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                productName: item.productName,
                category: item.category,
                quantity: item.quantity,
                price: item.price,
                exchangeReason: item.exchangeReason || "No reason provided",
                exchangePhoto: item.exchangePhoto || "",
                exchangeStatus: item.exchangeStatus || "pending",
                orderDate: order.createdAt || new Date().toISOString(),
              });
            }
          });
        });

        // Sort by newest order first
        extractedExchanges.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        setExchanges(extractedExchanges);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExchanges = exchanges.filter((ex) => {
    const q = searchQuery.toLowerCase();
    return (
      ex.customerName.toLowerCase().includes(q) ||
      ex.orderId.toLowerCase().includes(q) ||
      ex.productName.toLowerCase().includes(q) ||
      ex.customerPhone.includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-24 lg:pb-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFDFC] p-6 rounded-3xl border border-[#E8CFC5] shadow-[0_15px_40px_rgba(124,27,42,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#B82E44] to-[#7C1B2A] text-white flex items-center justify-center shadow-lg">
              <IconSparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B82E44]">
              Customer Service
            </span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-[#35191C] tracking-tight">
            Exchange Requests
          </h1>
          <p className="text-[#6F4A4A] text-sm mt-1 max-w-xl leading-relaxed">
            Manage product defects, return issues, and customer exchange requests.
          </p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#FFF0EA]/80 border border-[#E8CFC5] text-xs w-full md:w-80 focus-within:border-[#B82E44] focus-within:bg-white transition-all shadow-xs">
          <IconSearch className="w-4 h-4 text-[#7C1B2A]" />
          <input
            type="text"
            placeholder="Search by Order ID, Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs text-[#35191C] placeholder-[#6F4A4A]/60"
          />
        </div>
        <div className="text-xs text-[#6F4A4A] font-bold">
          Total Requests: <span className="text-[#7C1B2A]">{filteredExchanges.length}</span>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-[#6F4A4A]">
            <div className="w-10 h-10 border-4 border-[#E8CFC5] border-t-[#B82E44] rounded-full animate-spin mb-4" />
            <p className="font-bold text-sm tracking-wide">Loading Exchange Requests...</p>
          </div>
        ) : filteredExchanges.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-[#6F4A4A] bg-[#FFF0EA]/30">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE2D8] text-[#7C1B2A] flex items-center justify-center mb-4 shadow-inner">
              <IconPackage className="w-8 h-8" />
            </div>
            <p className="font-bold text-lg text-[#35191C]">No Exchange Requests Found</p>
            <p className="text-sm mt-1">Everything looks good! No pending issues matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gradient-to-r from-[#2C1417] to-[#4A2528] text-white font-bold tracking-wider uppercase">
                <tr>
                  <th className="p-4 border-b border-[#E8CFC5]/20">Order ID & Date</th>
                  <th className="p-4 border-b border-[#E8CFC5]/20">Customer</th>
                  <th className="p-4 border-b border-[#E8CFC5]/20">Product Details</th>
                  <th className="p-4 border-b border-[#E8CFC5]/20">Status</th>
                  <th className="p-4 border-b border-[#E8CFC5]/20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8CFC5]">
                {filteredExchanges.map((ex, idx) => {
                  const d = new Date(ex.orderDate);
                  return (
                    <tr key={idx} className="hover:bg-[#FFF0EA]/40 transition-colors group">
                      <td className="p-4 align-top">
                        <div className="font-mono text-xs font-bold text-[#7C1B2A] bg-[#FFF0EA] inline-block px-2 py-0.5 rounded border border-[#E8CFC5]">
                          #{ex.orderId.substring(0, 8).toUpperCase()}
                        </div>
                        <div className="text-[10px] text-[#6F4A4A] mt-1.5 font-medium">
                          {d.toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-bold text-[#35191C]">{ex.customerName}</div>
                        <div className="text-[10px] text-[#6F4A4A] mt-0.5">{ex.customerPhone}</div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-bold text-[#35191C] max-w-xs truncate">{ex.productName}</div>
                        <div className="text-[10px] text-[#6F4A4A] mt-0.5">Qty: {ex.quantity} • ₹{ex.price}</div>
                        <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded-lg border border-red-200">
                          <span className="font-bold block mb-0.5">Issue:</span>
                          {ex.exchangeReason}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            ex.exchangeStatus === "pending"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : ex.exchangeStatus === "approved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          }`}
                        >
                          {ex.exchangeStatus}
                        </span>
                      </td>
                      <td className="p-4 align-top text-center">
                        <button
                          onClick={() => setSelectedExchange(ex)}
                          className="px-3 py-1.5 bg-[#FFF0EA] hover:bg-[#FFE2D8] border border-[#E8CFC5] text-[#7C1B2A] rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm"
                        >
                          View Details
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

      {/* ── View Details Modal ── */}
      {selectedExchange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp relative">
            <button
              onClick={() => setSelectedExchange(null)}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-[#FFF0EA] hover:bg-[#FFE2D8] text-[#7C1B2A] transition-colors border border-[#E8CFC5]"
            >
              ✕
            </button>
            <h2 className="font-serif text-2xl font-bold text-[#7C1B2A]">Exchange Request Details</h2>
            
            <div className="space-y-4 text-sm text-[#35191C]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FFF0EA] p-3 rounded-xl border border-[#E8CFC5]">
                  <span className="block text-[10px] font-bold uppercase text-[#6F4A4A] mb-1">Customer</span>
                  <p className="font-semibold">{selectedExchange.customerName}</p>
                  <p className="text-xs">{selectedExchange.customerPhone}</p>
                </div>
                <div className="bg-[#FFF0EA] p-3 rounded-xl border border-[#E8CFC5]">
                  <span className="block text-[10px] font-bold uppercase text-[#6F4A4A] mb-1">Order ID</span>
                  <p className="font-mono font-bold text-[#7C1B2A]">#{selectedExchange.orderId}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E8CFC5] shadow-inner">
                <span className="block text-[10px] font-bold uppercase text-[#6F4A4A] mb-1">Product Details</span>
                <p className="font-bold">{selectedExchange.productName}</p>
                <p className="text-xs text-[#6F4A4A]">Category: {selectedExchange.category} | Qty: {selectedExchange.quantity}</p>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <span className="block text-[10px] font-bold uppercase text-red-800 mb-1">Customer Issue</span>
                <p className="text-sm font-medium text-red-900 whitespace-pre-wrap">{selectedExchange.exchangeReason}</p>
              </div>

              {selectedExchange.exchangePhoto ? (
                <div className="border border-[#E8CFC5] rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-[#FFF0EA] px-3 py-2 border-b border-[#E8CFC5] text-xs font-bold text-[#7C1B2A]">Attached Photo</div>
                  <img src={selectedExchange.exchangePhoto} alt="Defect" className="w-full max-h-64 object-contain bg-white" />
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500 italic">
                  No photo attached by the customer.
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-[#E8CFC5] flex justify-end gap-3">
              <button
                onClick={() => setSelectedExchange(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#6F4A4A] hover:bg-[#FFF0EA] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
