/**
 * ============================================================
 * FILE: src/app/orders/page.tsx (Standalone Admin Orders)
 * PURPOSE: Customer Order Booking, Status Tracking & Order History
 * ============================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import StatCard from "@/components/admin/StatCard";
import { STORE_CATEGORIES } from "@/types/product";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  productName: string;
  category: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "All">("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Order Form State
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    notes: "",
  });

  const [formItems, setFormItems] = useState<OrderItem[]>([
    { productName: "", category: "rings", quantity: 1, price: 0 },
  ]);

  const showToast = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      showToast("error", "Error loading customer orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status (Cycle: pending -> confirmed -> shipped -> delivered)
  const handleStatusCycle = async (id: string, currentStatus: OrderStatus) => {
    const flow: Record<OrderStatus, OrderStatus> = {
      pending: "confirmed",
      confirmed: "shipped",
      shipped: "delivered",
      delivered: "delivered",
      cancelled: "cancelled",
    };

    const nextStatus = flow[currentStatus];
    if (nextStatus === currentStatus) return;

    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
        );
        showToast("success", `Order moved to ${nextStatus.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Failed to update status", error);
      showToast("error", "Failed to update order status.");
    }
  };

  // Delete Order
  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order record?")) return;
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Order record deleted.");
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to delete order", error);
    }
  };

  // Dynamic Form Item Handlers
  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...formItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormItems(updated);
  };

  const handleAddItemRow = () => {
    setFormItems([...formItems, { productName: "", category: "rings", quantity: 1, price: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== index));
    }
  };

  const calculatedTotal = formItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) {
      showToast("error", "Customer Name and Phone number are required.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: formItems,
          totalAmount: calculatedTotal,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "New order booked successfully!");
        setShowAddModal(false);
        setFormData({
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          customerAddress: "",
          notes: "",
        });
        setFormItems([{ productName: "", category: "rings", quantity: 1, price: 0 }]);
        fetchOrders();
      } else {
        showToast("error", data.error || "Failed to create order.");
      }
    } catch (error) {
      console.error("Failed to create order", error);
      showToast("error", "API error creating order.");
    } finally {
      setIsLoading(false);
    }
  };

  // Stats calculation
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  const filteredOrders = orders.filter((o) =>
    filterStatus === "All" ? true : o.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#9B1B30] font-bold">
            Customer Orders Management
          </h1>
          <p className="text-sm text-[#6F4A4A] mt-1">
            Track customer purchases, update fulfillment status, and maintain order records.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#B82E44] hover:bg-[#7C1B2A] text-[#FFF8F0] text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Book New Order</span>
        </button>
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

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🛒" title="Total Orders" value={totalOrders} subtitle="All time bookings" color="maroon" />
        <StatCard icon="⏳" title="Pending Fulfillment" value={pendingCount} subtitle="Needs packing/confirmation" color="gold" />
        <StatCard icon="🚚" title="In Transit (Shipped)" value={shippedCount} subtitle="Out for delivery" color="blue" />
        <StatCard icon="✅" title="Delivered Successfully" value={deliveredCount} subtitle="Completed sales" color="green" />
      </div>

      {/* ── Filter Tabs ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl p-4 shadow-sm flex items-center gap-2 overflow-x-auto">
        {(["All", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
              filterStatus === status
                ? "bg-[#B82E44] text-[#FFF8F0] shadow-sm"
                : "bg-[#FFF0EA] text-[#6F4A4A] hover:bg-[#FFE2D8]"
            }`}
          >
            {status} ({status === "All" ? orders.length : orders.filter((o) => o.status === status).length})
          </button>
        ))}
      </div>

      {/* ── Orders Table ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#6F4A4A] text-sm animate-pulse">
            Loading customer orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-[#6F4A4A]">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm font-medium">No orders found in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#7C1B2A] text-[#E6C766]">
                  <th className="p-3 border-b border-[#E8CFC5]/20">Order ID</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Customer Details</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Phone</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Items</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Total Bill</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Status (Click to Advance)</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Date</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8CFC5]/50 bg-white">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFF8F0] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#9B1B30]">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-[#35191C] block">{order.customerName}</span>
                      {order.customerAddress && (
                        <span className="text-[10px] text-[#6F4A4A] truncate max-w-xs block">
                          📍 {order.customerAddress}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-[#35191C]">📞 {order.customerPhone}</td>
                    <td className="p-3">
                      <span className="font-semibold text-[#B82E44]">
                        {order.items?.length || 0} product(s)
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#B82E44]">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleStatusCycle(order.id, order.status)}
                        title="Click to move to next fulfillment stage"
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "confirmed"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        <span>{order.status}</span>
                        {order.status !== "delivered" && order.status !== "cancelled" && <span>➔</span>}
                      </button>
                    </td>
                    <td className="p-3 text-[#6F4A4A]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 bg-[#FFF0EA] hover:bg-[#FFE2D8] text-[#7C1B2A] border border-[#E8CFC5] rounded-lg font-semibold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Order Details Modal ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8CFC5]">
              <div>
                <h3 className="font-serif text-lg text-[#9B1B30] font-bold">
                  Order Details #{selectedOrder.id.slice(-6).toUpperCase()}
                </h3>
                <span className="text-[10px] text-[#6F4A4A]">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-[#FFF0EA]/40 p-3 rounded-xl border border-[#E8CFC5] space-y-1 text-xs">
              <p><span className="font-bold text-[#35191C]">Customer:</span> {selectedOrder.customerName}</p>
              <p><span className="font-bold text-[#35191C]">Phone:</span> {selectedOrder.customerPhone}</p>
              {selectedOrder.customerAddress && (
                <p><span className="font-bold text-[#35191C]">Address:</span> {selectedOrder.customerAddress}</p>
              )}
              {selectedOrder.notes && (
                <p><span className="font-bold text-[#35191C]">Notes:</span> {selectedOrder.notes}</p>
              )}
            </div>

            {/* Items List */}
            <div>
              <span className="text-xs font-bold text-[#35191C] block mb-2">Ordered Products:</span>
              <div className="divide-y divide-[#E8CFC5]/50 border border-[#E8CFC5] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs bg-white">
                    <div>
                      <p className="font-semibold text-[#35191C]">{item.productName}</p>
                      <span className="text-[10px] text-[#6F4A4A] capitalize">{item.category} • Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-[#B82E44]">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E8CFC5] text-sm">
              <span className="font-bold text-[#35191C]">Total Bill Amount:</span>
              <span className="font-serif text-xl font-bold text-[#9B1B30]">
                ₹{selectedOrder.totalAmount?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Book New Order Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8CFC5]">
              <h3 className="font-serif text-lg text-[#9B1B30] font-bold">
                Book Customer Order
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              {/* Customer Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#35191C] mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35191C] mb-1">Customer Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#35191C] mb-1">Delivery Address</label>
                <input
                  type="text"
                  placeholder="Street, Landmark, City, Pincode"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                />
              </div>

              {/* Dynamic Items Row */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-[#35191C]">Order Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-[11px] font-bold text-[#B82E44] hover:underline"
                  >
                    + Add Another Item
                  </button>
                </div>

                <div className="space-y-2">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#FFF0EA]/30 p-2 rounded-xl border border-[#E8CFC5]">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Product Name"
                          value={item.productName}
                          onChange={(e) => handleItemChange(idx, "productName", e.target.value)}
                          className="w-full p-1.5 bg-white border border-[#E8CFC5] rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={item.category}
                          onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                          className="w-full p-1.5 bg-white border border-[#E8CFC5] rounded-lg text-[10px]"
                        >
                          {STORE_CATEGORIES.map((c) => (
                            <option key={c.slug} value={c.slug}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value, 10) || 1)}
                          className="w-full p-1.5 bg-white border border-[#E8CFC5] rounded-lg text-xs text-center"
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <input
                          type="number"
                          required
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, "price", parseFloat(e.target.value) || 0)}
                          className="w-full p-1.5 bg-white border border-[#E8CFC5] rounded-lg text-xs"
                        />
                        {formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-red-500 font-bold px-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Submit */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E8CFC5]">
                <div>
                  <span className="text-xs text-[#6F4A4A] block">Computed Total:</span>
                  <span className="font-serif text-lg font-bold text-[#B82E44]">
                    ₹{calculatedTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-[#B82E44] hover:bg-[#7C1B2A] text-[#FFF8F0] font-bold uppercase tracking-wider rounded-xl shadow-md"
                  >
                    {isLoading ? "Saving..." : "Create Order"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
