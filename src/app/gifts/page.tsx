/**
 * ============================================================
 * FILE: src/app/gifts/page.tsx
 * PURPOSE: Gifts management for Keshar Jewellers Admin Panel
 * ============================================================
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { uploadFileToAPI, fetchFromAPI } from "@/services/api";

interface Gift {
  _id: string;
  name: string;
  image: string;
  createdAt: string;
}

const emptyForm = (): Partial<Gift> => ({
  name: "",
  image: "",
});

export default function GiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [packingPrice, setPackingPrice] = useState<number>(0);
  const [editingPackingPrice, setEditingPackingPrice] = useState(false);
  const [tempPackingPrice, setTempPackingPrice] = useState<string>("0");
  const [savingPackingPrice, setSavingPackingPrice] = useState(false);
  const fetchGifts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFromAPI("/gifts/all"); // Assuming this endpoint or similar will exist
      if (data && data.data) {
        setGifts(data.data);
      } else {
        setGifts([]);
      }
    } catch {
      setError("Failed to load gifts.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPackingPrice = useCallback(async () => {
    try {
      const data = await fetchFromAPI("/gifts/packing-price");
      if (data && data.success) {
        setPackingPrice(data.packingPrice);
        setTempPackingPrice(String(data.packingPrice));
      }
    } catch {
      console.error("Failed to fetch packing price");
    }
  }, []);

  useEffect(() => { 
    fetchGifts(); 
    fetchPackingPrice();
  }, [fetchGifts, fetchPackingPrice]);

  function openAdd() {
    setForm(emptyForm());
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  async function handleSavePackingPrice() {
    setSavingPackingPrice(true);
    try {
      const priceToSave = Number(tempPackingPrice) || 0;
      const data = await fetchFromAPI("/gifts/packing-price", {
        method: "POST",
        body: JSON.stringify({ packingPrice: priceToSave }),
      });
      if (data && data.success) {
        setPackingPrice(data.packingPrice);
        setTempPackingPrice(String(data.packingPrice));
        setEditingPackingPrice(false);
        setSuccess("Packing price updated!");
      } else {
        setError("Failed to update packing price");
      }
    } catch {
      setError("Network error updating packing price");
    } finally {
      setSavingPackingPrice(false);
    }
  }

  async function handleImageUpload(file: File) {
    setImageUploading(true);
    try {
      const res = await uploadFileToAPI(file, "gifts");
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
    if (!form.name?.trim()) { setError("Gift name is required."); return; }
    if (!form.image) { setError("Gift photo is required."); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name?.trim(),
        image: form.image,
      };

      const data = await fetchFromAPI("/gifts", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!data || !data.success) {
        setError(data?.message || data?.error || "Save failed.");
        return;
      }

      setSuccess("Gift created!");
      setModalOpen(false);
      fetchGifts();
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
      const data = await fetchFromAPI(`/gifts/${deleteId}`, { method: "DELETE" });
      if (data && data.success) {
        setSuccess("Gift deleted.");
        setDeleteId(null);
        fetchGifts();
      } else {
        setError(data?.message || data?.error || "Delete failed.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#7C1B2A] font-bold">Gifts Management</h1>
          <p className="text-sm text-[#6F4A4A] mt-1">Manage complimentary gifts for customers</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Packing Price Section */}
          <div className="flex items-center gap-2 bg-[#FFF8F0] border border-[#E8CFC5] px-4 py-2 rounded-xl">
            <span className="text-sm font-bold text-[#35191C]">Packing Price:</span>
            {editingPackingPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-[#6F4A4A]">₹</span>
                <input
                  type="number"
                  value={tempPackingPrice}
                  onChange={(e) => setTempPackingPrice(e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-[#E8CFC5] rounded-md focus:outline-none focus:border-[#9B1B30]"
                />
                <button
                  onClick={handleSavePackingPrice}
                  disabled={savingPackingPrice}
                  className="px-2 py-1 text-xs font-bold bg-[#9B1B30] text-white rounded-md hover:bg-[#7C1424] transition-colors"
                >
                  {savingPackingPrice ? "..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditingPackingPrice(false);
                    setTempPackingPrice(String(packingPrice));
                  }}
                  className="px-2 py-1 text-xs font-bold text-[#6F4A4A] hover:bg-[#FFE2D8] rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#9B1B30] font-bold">₹{packingPrice}</span>
                <button
                  onClick={() => setEditingPackingPrice(true)}
                  className="text-xs font-bold text-[#6F4A4A] underline hover:text-[#9B1B30]"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7C1424] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-colors whitespace-nowrap"
          >
            <span className="text-lg leading-none">+</span>
            Add New Gift
          </button>
        </div>
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

      {/* Gifts Grid */}
      <div className="bg-white rounded-2xl border border-[#E8CFC5] shadow-xs p-6">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#9B1B30] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#6F4A4A] mt-3">Loading gifts...</p>
          </div>
        ) : gifts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-2">🎁</p>
            <p className="font-serif text-lg text-[#35191C] font-semibold">No gifts found</p>
            <p className="text-sm text-[#6F4A4A] mt-1">Click "Add New Gift" to create your first gift</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gifts.map((gift) => (
              <div key={gift._id} className="border border-[#E8CFC5] rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col bg-[#FFF8F0]">
                <div className="aspect-square relative bg-white border-b border-[#E8CFC5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gift.image || "https://placehold.co/400x400?text=Gift"}
                    alt={gift.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                  <h3 className="font-semibold text-sm text-[#35191C] truncate">{gift.name}</h3>
                  <button
                    onClick={() => setDeleteId(gift._id)}
                    className="w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto pt-20">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8CFC5]">
              <h2 className="font-serif text-xl text-[#7C1B2A] font-bold">Add New Gift</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-[#FFF0EA] text-[#6F4A4A] transition-colors">✕</button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{error}</div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#35191C] mb-1">Gift Name *</label>
                <input
                  type="text"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Silver Coin"
                  className="w-full border border-[#E8CFC5] rounded-xl px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-[#35191C] mb-1">Gift Photo *</label>
                <div className="flex items-start gap-3 flex-col sm:flex-row">
                  {form.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.image} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-[#E8CFC5] shrink-0" />
                  )}
                  <div className="flex-1 w-full">
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-4 border border-dashed border-[#E8CFC5] rounded-xl bg-[#FFF8F0] hover:bg-[#FFF0EA] transition-colors text-sm text-[#6F4A4A]">
                      {imageUploading ? (
                        <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-[#9B1B30] border-t-transparent rounded-full animate-spin" />Uploading...</span>
                      ) : (
                        <span className="flex flex-col items-center gap-1">
                          <span className="text-xl">📷</span>
                          <span>{form.image ? "Change Photo" : "Upload Photo"}</span>
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={imageUploading}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                      />
                    </label>
                  </div>
                </div>
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
                disabled={saving || imageUploading}
                className="px-6 py-2 text-sm font-bold text-white bg-[#9B1B30] hover:bg-[#7C1424] rounded-xl shadow transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saving ? "Saving..." : "Add Gift"}
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
            <h3 className="font-serif text-lg font-bold text-[#35191C] mb-2">Delete this gift?</h3>
            <p className="text-sm text-[#6F4A4A] mb-5">This action cannot be undone.</p>
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
