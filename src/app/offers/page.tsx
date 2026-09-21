/**
 * ============================================================
 * FILE: src/app/offers/page.tsx
 * PURPOSE: Offers management for Keshar Jewellers Admin Panel
 * ============================================================
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { uploadFileToAPI } from "@/services/api";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://my-jewellery-backend.onrender.com";

const CATEGORIES = [
  "", "Ring", "Necklace", "Earring", "Bracelet", "Bangle",
  "Pendant", "Mangalsutra", "Chain", "Anklet", "Brooch", "Other",
];

interface Offer {
  _id: string;
  title: string;
  description: string;
  discountPercent: number;
  originalPrice: number;
  offerPrice: number;
  category: string;
  image: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  productLink: string;
  createdAt: string;
}

const emptyForm = (): Partial<Offer> & { validFrom: string; validTo: string } => ({
  title: "",
  description: "",
  discountPercent: 0,
  originalPrice: 0,
  offerPrice: 0,
  category: "",
  image: "",
  validFrom: new Date().toISOString().slice(0, 10),
  validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  isActive: true,
  productLink: "",
});

function toISODate(dateStr: string) {
  // Convert 'YYYY-MM-DD' to ISO string
  return new Date(dateStr + "T00:00:00.000Z").toISOString();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function isOfferLive(offer: Offer) {
  const now = new Date();
  return offer.isActive && new Date(offer.validFrom) <= now && new Date(offer.validTo) >= now;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/offers/all`, { cache: "no-store" });
      const data = await res.json();
      setOffers(data.data || []);
    } catch {
      setError("Failed to load offers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  // Auto-calculate discount when prices change
  function handlePriceChange(field: "originalPrice" | "offerPrice", value: string) {
    const numVal = parseFloat(value) || 0;
    const updated = { ...form, [field]: numVal };
    const orig = field === "originalPrice" ? numVal : (form.originalPrice || 0);
    const offer = field === "offerPrice" ? numVal : (form.offerPrice || 0);
    if (orig > 0 && offer > 0 && offer < orig) {
      updated.discountPercent = parseFloat(((orig - offer) / orig * 100).toFixed(2));
    }
    setForm(updated);
  }

  function openAdd() {
    setEditOffer(null);
    setForm(emptyForm());
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEdit(offer: Offer) {
    setEditOffer(offer);
    setForm({
      title: offer.title,
      description: offer.description,
      discountPercent: offer.discountPercent,
      originalPrice: offer.originalPrice,
      offerPrice: offer.offerPrice,
      category: offer.category,
      image: offer.image,
      validFrom: new Date(offer.validFrom).toISOString().slice(0, 10),
      validTo: new Date(offer.validTo).toISOString().slice(0, 10),
      isActive: offer.isActive,
      productLink: offer.productLink,
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  async function handleImageUpload(file: File) {
    setImageUploading(true);
    try {
      const res = await uploadFileToAPI(file, "offers");
      if (res.success && res.url) {
        setForm((f) => ({ ...f, image: res.url }));
      } else {
        setError(res.error || "Image upload failed. Try again.");
      }
    } catch {
      setError("Image upload failed. Try again.");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleSave() {
    setError("");
    // Validate
    if (!form.title?.trim()) { setError("Title is required."); return; }
    if (!form.originalPrice || form.originalPrice <= 0) { setError("Original price must be greater than 0."); return; }
    if (!form.offerPrice || form.offerPrice <= 0) { setError("Offer price must be greater than 0."); return; }
    if (form.offerPrice! >= form.originalPrice!) { setError("Offer price must be less than original price."); return; }
    if (!form.validFrom || !form.validTo) { setError("Valid dates are required."); return; }
    if (new Date(form.validTo) <= new Date(form.validFrom)) { setError("Valid To must be after Valid From."); return; }

    setSaving(true);
    try {
      const payload = {
        title: form.title?.trim(),
        description: form.description?.trim() || "",
        discountPercent: parseFloat(Number(form.discountPercent).toFixed(2)),
        originalPrice: parseFloat(Number(form.originalPrice).toFixed(2)),
        offerPrice: parseFloat(Number(form.offerPrice).toFixed(2)),
        category: form.category || "",
        image: form.image || "",
        validFrom: toISODate(form.validFrom),
        validTo: toISODate(form.validTo),
        isActive: form.isActive !== false,
        productLink: form.productLink?.trim() || "",
      };

      const url = editOffer
        ? `${BACKEND}/api/offers/${editOffer._id}`
        : `${BACKEND}/api/offers`;
      const method = editOffer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || "Save failed."); return; }

      setSuccess(editOffer ? "Offer updated!" : "Offer created!");
      setModalOpen(false);
      fetchOffers();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BACKEND}/api/offers/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccess("Offer deleted.");
        setDeleteId(null);
        fetchOffers();
      } else {
        setError(data.message || "Delete failed.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleActive(offer: Offer) {
    try {
      await fetch(`${BACKEND}/api/offers/${offer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      fetchOffers();
    } catch {
      setError("Toggle failed.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#7C1B2A] font-bold">Offers Management</h1>
          <p className="text-sm text-[#6F4A4A] mt-1">Manage special offers and discounts for customers</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7C1424] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add New Offer
        </button>
      </div>

      {/* Success/Error Banners */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          <span>✓ {success}</span>
          <button onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800 font-bold">✕</button>
        </div>
      )}
      {error && !modalOpen && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          <span>✕ {error}</span>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-bold">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Offers", value: offers.length, color: "text-[#7C1B2A]" },
          { label: "Live Now", value: offers.filter(isOfferLive).length, color: "text-green-700" },
          { label: "Inactive", value: offers.filter(o => !o.isActive).length, color: "text-[#6F4A4A]" },
          { label: "Expired", value: offers.filter(o => o.isActive && new Date(o.validTo) < new Date()).length, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E8CFC5] p-4 text-center shadow-xs">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#6F4A4A] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-2xl border border-[#E8CFC5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#9B1B30] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#6F4A4A] mt-3">Loading offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-2">🏷️</p>
            <p className="font-serif text-lg text-[#35191C] font-semibold">No offers yet</p>
            <p className="text-sm text-[#6F4A4A] mt-1">Click "Add New Offer" to create your first offer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FFF0EA] border-b border-[#E8CFC5] text-left">
                  <th className="px-4 py-3 font-bold text-[#7C1B2A] text-xs uppercase tracking-wider">Offer</th>
                  <th className="px-4 py-3 font-bold text-[#7C1B2A] text-xs uppercase tracking-wider">Prices</th>
                  <th className="px-4 py-3 font-bold text-[#7C1B2A] text-xs uppercase tracking-wider">Validity</th>
                  <th className="px-4 py-3 font-bold text-[#7C1B2A] text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 font-bold text-[#7C1B2A] text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0DDD8]">
                {offers.map((offer) => {
                  const live = isOfferLive(offer);
                  const expired = offer.isActive && new Date(offer.validTo) < new Date();
                  return (
                    <tr key={offer._id} className="hover:bg-[#FFF8F0] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {offer.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={offer.image} alt={offer.title} className="w-12 h-12 object-cover rounded-lg border border-[#E8CFC5] shrink-0" />
                          ) : (
                            <div className="w-12 h-12 bg-[#FFF0EA] rounded-lg border border-[#E8CFC5] flex items-center justify-center text-xl shrink-0">🏷️</div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-[#35191C] text-sm truncate max-w-[180px]">{offer.title}</p>
                            {offer.category && <p className="text-xs text-[#6F4A4A]">{offer.category}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-[#9B1B30]">₹{offer.offerPrice.toFixed(2)}</p>
                        <p className="text-xs text-[#6F4A4A] line-through">₹{offer.originalPrice.toFixed(2)}</p>
                        <span className="text-[10px] bg-[#9B1B30] text-white px-1.5 py-0.5 rounded-full font-bold">{offer.discountPercent.toFixed(1)}% OFF</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6F4A4A]">
                        <p>From: {formatDate(offer.validFrom)}</p>
                        <p>To: {formatDate(offer.validTo)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(offer)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            live
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : expired
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-[#FFF0EA] text-[#6F4A4A] border-[#E8CFC5] hover:bg-[#FFE2D8]"
                          }`}
                        >
                          {live ? "● LIVE" : expired ? "Expired" : offer.isActive ? "Scheduled" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(offer)}
                            className="px-3 py-1.5 bg-[#FFF0EA] hover:bg-[#FFE2D8] text-[#7C1B2A] text-xs font-bold rounded-lg border border-[#E8CFC5] transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(offer._id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8CFC5]">
              <h2 className="font-serif text-xl text-[#7C1B2A] font-bold">
                {editOffer ? "Edit Offer" : "Add New Offer"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-[#FFF0EA] text-[#6F4A4A] transition-colors">✕</button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{error}</div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#35191C] mb-1">Offer Title *</label>
                <input
                  type="text"
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Diwali Gold Ring Offer"
                  className="w-full border border-[#E8CFC5] rounded-xl px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#35191C] mb-1">Description</label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Offer details..."
                  rows={2}
                  className="w-full border border-[#E8CFC5] rounded-xl px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#35191C] mb-1">Category</label>
                <select
                  value={form.category || ""}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-[#E8CFC5] rounded-xl px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none bg-white"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c || "Select category"}</option>)}
                </select>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#35191C] mb-1">Original Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.originalPrice || ""}
                    onChange={(e) => handlePriceChange("originalPrice", e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-[#E8CFC5] rounded-xl px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#35191C] mb-1">Offer Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.offerPrice || ""}
                    onChange={(e) => handlePriceChange("offerPrice", e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-[#E8CFC5] rounded-xl px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#35191C] mb-1">Discount % (auto)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.discountPercent || ""}
                    onChange={(e) => setForm({ ...form, discountPercent: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full border border-[#E8CFC5] rounded-xl px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none bg-[#FFF8F0]"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#35191C] mb-1">Valid From *</label>
                  <input
                    type="date"
                    value={form.validFrom || ""}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className="w-full border border-[#E8CFC5] rounded-xl px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#35191C] mb-1">Valid To *</label>
                  <input
                    type="date"
                    value={form.validTo || ""}
                    onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                    className="w-full border border-[#E8CFC5] rounded-xl px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-[#35191C] mb-1">Offer Image</label>
                <div className="flex items-start gap-3">
                  {form.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-[#E8CFC5] shrink-0" />
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-dashed border-[#E8CFC5] rounded-xl bg-[#FFF8F0] hover:bg-[#FFF0EA] transition-colors text-sm text-[#6F4A4A]">
                      {imageUploading ? (
                        <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-[#9B1B30] border-t-transparent rounded-full animate-spin" />Uploading...</span>
                      ) : (
                        <span>📷 {form.image ? "Change Image" : "Upload Image"}</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={imageUploading}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                      />
                    </label>
                    {form.image && (
                      <button onClick={() => setForm({ ...form, image: "" })} className="mt-1 text-xs text-red-500 hover:underline">Remove image</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Link */}
              <div>
                <label className="block text-xs font-bold text-[#35191C] mb-1">Product Link (optional)</label>
                <input
                  type="text"
                  value={form.productLink || ""}
                  onChange={(e) => setForm({ ...form, productLink: e.target.value })}
                  placeholder="/products/ring (leave empty to link to all products)"
                  className="w-full border border-[#E8CFC5] rounded-xl px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#FFF8F0] rounded-xl border border-[#E8CFC5]">
                <div>
                  <p className="text-sm font-bold text-[#35191C]">Offer Active</p>
                  <p className="text-xs text-[#6F4A4A]">Toggle to show/hide from customers</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    form.isActive ? "bg-[#9B1B30]" : "bg-[#E8CFC5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.isActive ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8CFC5]">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-[#6F4A4A] bg-[#FFF0EA] hover:bg-[#FFE2D8] rounded-xl border border-[#E8CFC5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 text-sm font-bold text-white bg-[#9B1B30] hover:bg-[#7C1424] rounded-xl shadow transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saving ? "Saving..." : editOffer ? "Update Offer" : "Create Offer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="font-serif text-lg font-bold text-[#35191C] mb-2">Delete this offer?</h3>
            <p className="text-sm text-[#6F4A4A] mb-5">Ye action permanent hai. Offer dobara nahi aayega.</p>
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 text-sm font-bold text-[#6F4A4A] bg-[#FFF0EA] rounded-xl border border-[#E8CFC5] hover:bg-[#FFE2D8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {deleting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
