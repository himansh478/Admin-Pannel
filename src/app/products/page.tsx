/**
 * ============================================================
 * FILE: src/app/products/page.tsx (Standalone Admin Products)
 * PURPOSE: Full Product Catalog Management, Single & Bulk CSV Upload
 * ============================================================
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { STORE_CATEGORIES, Product } from "@/types/product";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [parsedCsvProducts, setParsedCsvProducts] = useState<Product[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Single Product Form State
  const [formData, setFormData] = useState({
    category: "nose-pins",
    productType: "",
    description: "",
    material: "92.50 % silver",
    dimensionL: "8mm",
    dimensionW: "8mm",
    dimensionH: "7mm",
    weight: "",
    sellingPrice: "",
    mrp: "",
    stock: "10",
    frontImage: "",
    backImage: "",
    modelImage: "",
  });

  const showToast = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      showToast("error", "Could not connect to products database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 1. Single Product Submission
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productType || !formData.sellingPrice) {
      showToast("error", "Product Type and Selling Price are required.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sellingPrice: Number(formData.sellingPrice),
          mrp: Number(formData.mrp) || Number(formData.sellingPrice),
          stock: Number(formData.stock) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "Product published to store successfully!");
        setShowAddModal(false);
        setFormData({
          category: "nose-pins",
          productType: "",
          description: "",
          material: "92.50 % silver",
          dimensionL: "8mm",
          dimensionW: "8mm",
          dimensionH: "7mm",
          weight: "",
          sellingPrice: "",
          mrp: "",
          stock: "10",
          frontImage: "",
          backImage: "",
          modelImage: "",
        });
        await fetchProducts();
      } else {
        showToast("error", data.error || "Failed to save product.");
      }
    } catch (error) {
      console.error("Failed to add product", error);
      showToast("error", "API connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Delete Product
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Product removed from catalog.");
        await fetchProducts();
      } else {
        showToast("error", data.error || "Failed to delete.");
      }
    } catch (error) {
      console.error("Failed to delete product", error);
      showToast("error", "API error during deletion.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Download Sample CSV
  const downloadSampleCSV = () => {
    const headers = [
      "Product Category",
      "Product Type",
      "Description",
      "Product Material",
      "Dimension L",
      "Dimension W",
      "Dimension H",
      "Product Weight",
      "Selling Price",
      "MRP",
      "Stock",
      "Front Image",
      "Back Image",
      "Model Image",
    ];

    const sampleRows = [
      [
        "nose-pins",
        "noz pin",
        "silver Black+AD STONE pic 20",
        "92.50 % silver",
        "8mm",
        "8mm",
        "7mm",
        "0.640mg",
        "540",
        "756",
        "15",
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      ],
      [
        "earrings",
        "92.5 Silver Studs",
        "Pure 92.5% Silver Micro-Pave AD Stone Geometric Rhombus Stud Earring",
        "92.50% Pure Sterling Silver",
        "10mm",
        "10mm",
        "8mm",
        "1.850g",
        "700",
        "999",
        "20",
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      ],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...sampleRows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "keshar_jewellers_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. Parse CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          showToast("error", "CSV file is empty or missing data rows.");
          return;
        }

        const parseLine = (line: string): string[] => {
          const result: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === "," && !inQuotes) {
              result.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const dataRows = lines.slice(1);
        const parsed: Product[] = [];

        dataRows.forEach((rowStr, idx) => {
          const cols = parseLine(rowStr);
          if (cols.length >= 8 && cols[0]) {
            parsed.push({
              id: `csv-${Date.now()}-${idx}`,
              category: cols[0].toLowerCase().trim().replace(/\s+/g, "-"),
              productType: cols[1] || "Jewellery",
              description: cols[2] || "",
              material: cols[3] || "92.50 % silver",
              dimensionL: cols[4] || "N/A",
              dimensionW: cols[5] || "N/A",
              dimensionH: cols[6] || "N/A",
              weight: cols[7] || "N/A",
              sellingPrice: parseFloat(cols[8]) || 0,
              mrp: parseFloat(cols[9]) || 0,
              stock: parseInt(cols[10], 10) || 10,
              frontImage: cols[11] || "",
              backImage: cols[12] || "",
              modelImage: cols[13] || "",
              createdAt: new Date().toISOString(),
            });
          }
        });

        if (parsed.length === 0) {
          showToast("error", "No valid product rows could be parsed.");
        } else {
          setParsedCsvProducts(parsed);
          showToast("success", `Parsed ${parsed.length} products! Click Publish to save.`);
        }
      } catch (err) {
        console.error(err);
        showToast("error", "Failed to parse CSV file.");
      }
    };

    reader.readAsText(file);
  };

  // 5. Submit Bulk Products
  const handlePublishBulk = async () => {
    if (parsedCsvProducts.length === 0) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedCsvProducts),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `🎉 Uploaded ${parsedCsvProducts.length} products!`);
        setParsedCsvProducts([]);
        setCsvFileName("");
        setShowBulkUpload(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchProducts();
      } else {
        showToast("error", data.error || "Failed to publish.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "API upload error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory ? p.category === filterCategory : true;
    const matchesSearch = searchQuery
      ? p.productType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            Products Catalog ({products.length})
          </h1>
          <p className="text-sm text-[#6F4A4A] mt-1">
            Add new products, bulk upload via Excel/CSV, and manage live listings.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="px-4 py-2 bg-[#FFF0EA] hover:bg-[#FFE2D8] border border-[#E8CFC5] text-[#7C1B2A] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <span>⚡</span>
            <span>{showBulkUpload ? "Close Bulk Tool" : "Bulk Excel/CSV"}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#B82E44] hover:bg-[#7C1B2A] text-[#FFF8F0] text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Add Single Product</span>
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

      {/* ── Bulk Upload Collapsible Section ── */}
      {showBulkUpload && (
        <div className="bg-[#FFFDFC] border-2 border-dashed border-[#B82E44]/40 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8CFC5]">
            <div>
              <h3 className="font-serif text-xl text-[#9B1B30] font-bold">
                Fast Bulk CSV / Excel Upload
              </h3>
              <p className="text-xs text-[#6F4A4A] mt-0.5">
                Download the official template, fill in products in Excel, and upload here.
              </p>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="px-4 py-2 bg-[#480C14] hover:bg-[#7C1B2A] text-[#E6C766] border border-[#D4AF37]/50 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all shrink-0"
            >
              <span>📥</span>
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Connected Google Sheet & Drive Links */}
          <div className="p-3.5 rounded-xl bg-[#FFF0EA] border border-[#E8CFC5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-[#7A1021]">
              📁 Connected Drive &amp; Google Sheets (Account: free1himansh@gmail.com)
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://docs.google.com/spreadsheets/d/1fC5VP_foYOq69iE-zYNf-Yd6Nhs7ubjBhrY3sV_jMY8/edit?gid=0#gid=0"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#0F9D58] hover:bg-[#0B8043] text-white font-medium rounded-lg shadow-sm transition-all"
              >
                Open Google Sheet ↗
              </a>
              <a
                href="https://drive.google.com/drive/folders/1jJgSH7CxYJYTRCgrewZ16ux0G2rA7dc4?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#4285F4] hover:bg-[#3367D6] text-white font-medium rounded-lg shadow-sm transition-all"
              >
                Open Drive Folder ↗
              </a>
            </div>
          </div>

          {/* File Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label className="flex-1 w-full border-2 border-dashed border-[#B82E44]/30 hover:border-[#B82E44] bg-[#FFF0EA]/40 rounded-xl p-5 text-center cursor-pointer transition-all">
              <span className="text-sm font-semibold text-[#9B1B30] block">
                {csvFileName ? `Selected: ${csvFileName}` : "Click to select or drag & drop CSV file"}
              </span>
              <span className="text-[11px] text-[#6F4A4A]">Supports standard UTF-8 CSV exports</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {parsedCsvProducts.length > 0 && (
              <button
                onClick={handlePublishBulk}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-4 bg-[#B82E44] hover:bg-[#7C1B2A] text-[#FFF8F0] rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all shrink-0"
              >
                🚀 Publish All ({parsedCsvProducts.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Filters & Search Bar ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-3 text-[#6F4A4A] text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by product type, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl text-xs focus:outline-none focus:border-[#B82E44]"
          />
        </div>

        {/* Category Filter */}
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

        {/* Reset Filter */}
        {(filterCategory || searchQuery) && (
          <button
            onClick={() => {
              setFilterCategory("");
              setSearchQuery("");
            }}
            className="text-xs text-[#B82E44] font-semibold hover:underline shrink-0"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Products Table ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#6F4A4A] text-sm animate-pulse">
            Loading products from MongoDB Atlas...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-[#6F4A4A]">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm font-medium">No products match the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#7C1B2A] text-[#E6C766]">
                  <th className="p-3 border-b border-[#E8CFC5]/20">Photo</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Category</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Type</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Description</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Material</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Weight</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Price</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20">Stock</th>
                  <th className="p-3 border-b border-[#E8CFC5]/20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8CFC5]/50 bg-white">
                {filteredProducts.map((p) => (
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
                    <td className="p-3 font-semibold text-[#B82E44] capitalize">
                      {p.category.replace(/-/g, " ")}
                    </td>
                    <td className="p-3 font-medium text-[#35191C]">{p.productType}</td>
                    <td className="p-3 max-w-xs truncate text-[#6F4A4A]">{p.description}</td>
                    <td className="p-3 text-[#35191C]">{p.material}</td>
                    <td className="p-3 font-medium">{p.weight}</td>
                    <td className="p-3">
                      <span className="font-bold text-[#B82E44]">₹{p.sellingPrice}</span>
                      {p.mrp && <span className="text-[10px] text-[#6F4A4A]/50 block line-through">₹{p.mrp}</span>}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (p.stock || 0) < 5
                            ? "bg-red-100 text-red-800"
                            : (p.stock || 0) < 20
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {p.stock || 0} pcs
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-semibold transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Single Product Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8CFC5]">
              <h3 className="font-serif text-xl text-[#9B1B30] font-bold">
                Add Single Product
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              {/* Category & Product Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#35191C] mb-1">
                    1. Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                  >
                    {STORE_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#35191C] mb-1">
                    2. Product Type * (e.g. noz pin, stud)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="noz pin"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[#35191C] mb-1">
                  3. Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Pure 92.5% Silver with Micro-Pave AD stones"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                />
              </div>

              {/* Material & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#35191C] mb-1">
                    4. Material *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="92.50 % silver"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35191C] mb-1">
                    5. Weight * (e.g. 0.640mg or 2.5g)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0.640mg"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block font-bold text-[#35191C] mb-1">
                  6. Dimensions (Length, Width, Height)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="L: 8mm"
                    value={formData.dimensionL}
                    onChange={(e) => setFormData({ ...formData, dimensionL: e.target.value })}
                    className="p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                  />
                  <input
                    type="text"
                    placeholder="W: 8mm"
                    value={formData.dimensionW}
                    onChange={(e) => setFormData({ ...formData, dimensionW: e.target.value })}
                    className="p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                  />
                  <input
                    type="text"
                    placeholder="H: 7mm"
                    value={formData.dimensionH}
                    onChange={(e) => setFormData({ ...formData, dimensionH: e.target.value })}
                    className="p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                  />
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#35191C] mb-1">
                    7. Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="540"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl font-bold text-[#B82E44] focus:outline-none focus:border-[#B82E44]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35191C] mb-1">
                    8. MRP (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="756"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#35191C] mb-1">
                    9. Inventory Stock (pcs)
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl font-bold text-green-700 focus:outline-none focus:border-[#B82E44]"
                  />
                </div>
              </div>

              {/* Image URLs */}
              <div className="space-y-2 pt-2 border-t border-[#E8CFC5]">
                <label className="block font-bold text-[#35191C]">
                  10. Image URLs (Front, Back, Model)
                </label>
                <input
                  type="text"
                  placeholder="Front Image URL (Cloudinary / Drive link / Web link)"
                  value={formData.frontImage}
                  onChange={(e) => setFormData({ ...formData, frontImage: e.target.value })}
                  className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                />
                <input
                  type="text"
                  placeholder="Back Image URL (optional)"
                  value={formData.backImage}
                  onChange={(e) => setFormData({ ...formData, backImage: e.target.value })}
                  className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                />
                <input
                  type="text"
                  placeholder="Model Wearing Image URL (optional)"
                  value={formData.modelImage}
                  onChange={(e) => setFormData({ ...formData, modelImage: e.target.value })}
                  className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8CFC5]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-[#B82E44] hover:bg-[#7C1B2A] text-[#FFF8F0] font-bold uppercase tracking-wider rounded-xl shadow-md transition-all"
                >
                  {isLoading ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
