/**
 * ============================================================
 * FILE: src/app/products/page.tsx (Standalone Luxury Admin Products)
 * PURPOSE: Full Product Catalog Management with Multi-Select,
 *          Bulk Delete, Bulk Edit, Advanced Filters, Sorting & Pagination
 * ============================================================
 */

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { STORE_CATEGORIES, Product } from "@/types/product";
import { fetchFromAPI, uploadFileToAPI } from "@/services/api";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search & Sort State
  const [filterCategory, setFilterCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out" | "in">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "stock-asc" | "stock-desc" | "name-asc">("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
  const [bulkOperationProgress, setBulkOperationProgress] = useState("");

  // Bulk Edit Form State
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkMaterial, setBulkMaterial] = useState("");
  const [bulkStockMode, setBulkStockMode] = useState<"no-change" | "set" | "add" | "subtract">("no-change");
  const [bulkStockValue, setBulkStockValue] = useState("");
  const [bulkPriceMode, setBulkPriceMode] = useState<"no-change" | "set" | "percent-increase" | "percent-decrease">("no-change");
  const [bulkPriceValue, setBulkPriceValue] = useState("");

  // Single Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [parsedCsvProducts, setParsedCsvProducts] = useState<Product[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});
  const [backgroundUploading, setBackgroundUploading] = useState<Record<string, boolean>>({});
  const [imageUploadMode, setImageUploadMode] = useState<"file" | "url">("file");

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
    singlePrice: "",
    pairPrice: "",
    sellingPrice: "",
    mrp: "",
    stock: "",
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
      const data = await fetchFromAPI("/api/products/admin");
      if (data && (data.success || Array.isArray(data.products))) {
        setProducts(data.products || []);
      } else {
        setProducts([]);
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

  // Handle Edit Click
  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setLocalPreviews({});
    setFormData({
      category: product.category || "nose-pins",
      productType: product.productType || "",
      description: product.description || "",
      material: product.material || "92.50 % silver",
      dimensionL: product.dimensionL || "",
      dimensionW: product.dimensionW || "",
      dimensionH: product.dimensionH || "",
      weight: product.weight || "",
      singlePrice: String(product.singlePrice || ""),
      pairPrice: String(product.pairPrice || ""),
      sellingPrice: String(product.sellingPrice || ""),
      mrp: String(product.mrp || ""),
      stock: String(product.stock ?? 0),
      frontImage: product.frontImage || "",
      backImage: product.backImage || "",
      modelImage: product.modelImage || "",
    });
    setShowAddModal(true);
  };

  // Image Upload handler — with auto-compression + real progress %
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "frontImage" | "backImage" | "modelImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      showToast("error", "Image file too large (max 50MB).");
      return;
    }

    // --- OPTIMISTIC UI (Zero Wait) ---
    // Instantly show the local file in the UI so admin can continue typing
    const previewUrl = URL.createObjectURL(file);
    setLocalPreviews((prev) => ({ ...prev, [field]: previewUrl }));
    setBackgroundUploading((prev) => ({ ...prev, [field]: true }));
    setUploadProgress((prev) => ({ ...prev, [field]: 0 }));

    try {
      // Upload happens silently in the background
      const result = await uploadFileToAPI(file, "products", (pct) => {
        setUploadProgress((prev) => ({ ...prev, [field]: pct }));
      });

      if (result && result.success && result.url) {
        // Swap local preview URL with real Cloudinary URL in formData
        setFormData((prev) => ({ ...prev, [field]: result.url! }));
        showToast("success", "Background upload complete! ✅");
      } else {
        showToast("error", result?.error || "Background upload failed.");
        // Revert preview on fail
        setLocalPreviews((prev) => ({ ...prev, [field]: "" }));
      }
    } catch (error: any) {
      console.error("Upload failed", error);
      showToast("error", error?.message || "Failed to upload image.");
      setLocalPreviews((prev) => ({ ...prev, [field]: "" }));
    } finally {
      setBackgroundUploading((prev) => ({ ...prev, [field]: false }));
      // Let the 100% progress stay for a second or just leave it
    }
  };

  // 1. Single Product Submission (Create or Update)
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent saving if images are still uploading in the background
    const isAnyUploading = Object.values(backgroundUploading).some(Boolean);
    if (isAnyUploading) {
      showToast("error", "Please wait, photos are finalizing...");
      return;
    }

    if (!formData.productType.trim()) {
      showToast("error", "Product Type is required.");
      return;
    }
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
      showToast("error", "Selling Price must be greater than 0.");
      return;
    }
    if (formData.mrp && Number(formData.mrp) < Number(formData.sellingPrice)) {
      showToast("error", "MRP cannot be less than Selling Price.");
      return;
    }
    if (formData.stock === "" || formData.stock === undefined) {
      showToast("error", "Stock quantity is required. Enter 0 if out of stock.");
      return;
    }
    const stockNum = Number(formData.stock);
    if (isNaN(stockNum) || stockNum < 0 || stockNum > 999) {
      showToast("error", "Stock must be between 0 and 999.");
      return;
    }
    if (!formData.frontImage) {
      showToast("error", "Front Image is required. Please upload a product photo.");
      return;
    }

    try {
      setIsLoading(true);
      const isEditing = Boolean(editingProductId);
      const payload = {
        ...(isEditing ? { id: editingProductId } : {}),
        ...formData,
        singlePrice: formData.category === "anklets" ? Number(formData.singlePrice) || 0 : 0,
        pairPrice: formData.category === "anklets" ? Number(formData.pairPrice) || 0 : 0,
        sellingPrice: Number(formData.sellingPrice),
        mrp: Number(formData.mrp) || Number(formData.sellingPrice),
        stock: Number(formData.stock) || 0,
      };

      const data = await fetchFromAPI("/api/products", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (data && data.success) {
        showToast("success", isEditing ? "Product updated successfully!" : "Product published to store successfully!");
        setShowAddModal(false);
        setEditingProductId(null);
        setLocalPreviews({});
        setFormData({
          category: "nose-pins",
          productType: "",
          description: "",
          material: "92.50 % silver",
          dimensionL: "8mm",
          dimensionW: "8mm",
          dimensionH: "7mm",
          weight: "",
          singlePrice: "",
          pairPrice: "",
          sellingPrice: "",
          mrp: "",
          stock: "",
          frontImage: "",
          backImage: "",
          modelImage: "",
        });
        await fetchProducts();
      } else {
        showToast("error", data?.error || "Failed to save product.");
      }
    } catch (error) {
      console.error("Failed to save product", error);
      showToast("error", "API connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Single Delete Product
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      setIsLoading(true);
      const data = await fetchFromAPI(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (data && data.success) {
        showToast("success", "Product removed from catalog.");
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        await fetchProducts();
      } else {
        showToast("error", data?.error || "Failed to delete.");
      }
    } catch (error) {
      console.error("Failed to delete product", error);
      showToast("error", "API error during deletion.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Multi-Select Toggle Functions
  const toggleSelectProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filteredAndSortedProducts.map((p) => p.id);
    setSelectedIds(allFilteredIds);
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  // 4. Bulk Delete Handler
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmMessage = `Are you sure you want to PERMANENTLY DELETE ${selectedIds.length} selected product(s)?\nThis action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    try {
      setBulkOperationLoading(true);
      let deletedCount = 0;
      const CHUNK_SIZE = 6;

      for (let i = 0; i < selectedIds.length; i += CHUNK_SIZE) {
        const chunk = selectedIds.slice(i, i + CHUNK_SIZE);
        setBulkOperationProgress(`Deleting ${Math.min(i + CHUNK_SIZE, selectedIds.length)} of ${selectedIds.length} products...`);
        await Promise.all(
          chunk.map((id) =>
            fetchFromAPI(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" })
          )
        );
        deletedCount += chunk.length;
      }

      showToast("success", `🗑️ Successfully deleted ${deletedCount} products!`);
      setSelectedIds([]);
      await fetchProducts();
    } catch (err) {
      console.error("Bulk delete error:", err);
      showToast("error", "Failed to delete some products. Please try again.");
    } finally {
      setBulkOperationLoading(false);
      setBulkOperationProgress("");
    }
  };

  // 5. Bulk Edit Handler
  const handleBulkEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    try {
      setBulkOperationLoading(true);
      let updatedCount = 0;
      const CHUNK_SIZE = 6;
      const selectedProds = products.filter((p) => selectedIds.includes(p.id));

      for (let i = 0; i < selectedProds.length; i += CHUNK_SIZE) {
        const chunk = selectedProds.slice(i, i + CHUNK_SIZE);
        setBulkOperationProgress(`Updating ${Math.min(i + CHUNK_SIZE, selectedProds.length)} of ${selectedProds.length} products...`);

        await Promise.all(
          chunk.map((prod) => {
            const updatedCategory = bulkCategory ? bulkCategory : prod.category;
            const updatedMaterial = bulkMaterial ? bulkMaterial : prod.material;

            let updatedStock = prod.stock ?? 0;
            if (bulkStockMode === "set" && bulkStockValue !== "") {
              updatedStock = Math.max(0, parseInt(bulkStockValue, 10) || 0);
            } else if (bulkStockMode === "add" && bulkStockValue !== "") {
              updatedStock = Math.max(0, updatedStock + (parseInt(bulkStockValue, 10) || 0));
            } else if (bulkStockMode === "subtract" && bulkStockValue !== "") {
              updatedStock = Math.max(0, updatedStock - (parseInt(bulkStockValue, 10) || 0));
            }

            let updatedPrice = prod.sellingPrice;
            if (bulkPriceMode === "set" && bulkPriceValue !== "") {
              updatedPrice = Math.max(1, parseFloat(bulkPriceValue) || prod.sellingPrice);
            } else if (bulkPriceMode === "percent-increase" && bulkPriceValue !== "") {
              const pct = parseFloat(bulkPriceValue) || 0;
              updatedPrice = Math.round(updatedPrice * (1 + pct / 100));
            } else if (bulkPriceMode === "percent-decrease" && bulkPriceValue !== "") {
              const pct = parseFloat(bulkPriceValue) || 0;
              updatedPrice = Math.max(1, Math.round(updatedPrice * (1 - pct / 100)));
            }

            const updatedMrp = Math.round(updatedPrice * 1.25);

            const payload = {
              id: prod.id,
              category: updatedCategory,
              productType: prod.productType,
              description: prod.description,
              material: updatedMaterial,
              dimensionL: prod.dimensionL,
              dimensionW: prod.dimensionW,
              dimensionH: prod.dimensionH,
              weight: prod.weight,
              sellingPrice: updatedPrice,
              mrp: updatedMrp,
              stock: updatedStock,
              frontImage: prod.frontImage,
              backImage: prod.backImage,
              modelImage: prod.modelImage,
            };

            return fetchFromAPI("/api/products", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          })
        );
        updatedCount += chunk.length;
      }

      showToast("success", `✨ Successfully updated ${updatedCount} products!`);
      setShowBulkEditModal(false);
      setSelectedIds([]);
      // Reset form
      setBulkCategory("");
      setBulkMaterial("");
      setBulkStockMode("no-change");
      setBulkStockValue("");
      setBulkPriceMode("no-change");
      setBulkPriceValue("");
      await fetchProducts();
    } catch (err) {
      console.error("Bulk edit error:", err);
      showToast("error", "Error updating products. Please try again.");
    } finally {
      setBulkOperationLoading(false);
      setBulkOperationProgress("");
    }
  };

  // 6. CSV Bulk Upload
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
        "necklaces",
        "Choker Necklace",
        "Pure 92.5% Silver Black + AD Stone Designer Choker",
        "92.50 % silver",
        "15mm",
        "12mm",
        "5mm",
        "12.500g",
        "1200",
        "1500",
        "20",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437755/products/ytzup4dvq9lcpdwg9ace.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437756/products/yibsahzxbuvf1oojulio.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437758/products/uxckwig39fxpa3jvnlam.jpg",
      ],
      [
        "earrings",
        "Polki Jhumka",
        "Traditional Rajputana Meenakari Polki Jhumka",
        "22K 916 Gold",
        "25mm",
        "15mm",
        "10mm",
        "8.450g",
        "8500",
        "11000",
        "15",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790438048/products/npwvem54wujiahzduvgj.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437774/products/iy2tmopioy9ecl3lcasq.png",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790438048/products/npwvem54wujiahzduvgj.jpg",
      ],
      [
        "rings",
        "Solitaire Diamond Ring",
        "Sparkling American Diamond CZ Solitaire Finger Ring",
        "92.50 % silver",
        "6mm",
        "6mm",
        "4mm",
        "2.150g",
        "850",
        "1100",
        "30",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790438017/products/tct7ndd3gn6lebxusm8v.png",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790438028/products/bboezbggd1yd06cb0dp5.png",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790438017/products/tct7ndd3gn6lebxusm8v.png",
      ],
      [
        "bangles",
        "Meenakari Kangan",
        "Royal Antique Handcrafted Kangan Pair",
        "22K Gold & 925 Silver",
        "60mm",
        "60mm",
        "12mm",
        "24.800g",
        "15000",
        "19000",
        "10",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437791/products/wr9rwfkdyq8c6pd4ycyp.png",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437823/products/plud8rud1zhdslybquw1.png",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437791/products/wr9rwfkdyq8c6pd4ycyp.png",
      ],
      [
        "mangalsutra",
        "Royal Black Bead Mangalsutra",
        "Traditional 22K Hallmarked Black Bead Double Layer Mangalsutra",
        "22K 916 Gold",
        "450mm",
        "10mm",
        "5mm",
        "6.800g",
        "12000",
        "15000",
        "12",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437755/products/ytzup4dvq9lcpdwg9ace.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437756/products/yibsahzxbuvf1oojulio.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437755/products/ytzup4dvq9lcpdwg9ace.jpg",
      ],
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
        "25",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437758/products/uxckwig39fxpa3jvnlam.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437758/products/uxckwig39fxpa3jvnlam.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437758/products/uxckwig39fxpa3jvnlam.jpg",
      ],
      [
        "chains",
        "Italian Box Chain",
        "Sleek 92.5 Pure Sterling Silver Italian Box Chain 20 inch",
        "92.50 % silver",
        "500mm",
        "2mm",
        "2mm",
        "4.500g",
        "1800",
        "2400",
        "20",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437840/products/kwggusskjxveekrclspz.png",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437840/products/kwggusskjxveekrclspz.png",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437840/products/kwggusskjxveekrclspz.png",
      ],
      [
        "pendants",
        "Auspicious OM Pendant",
        "Sacred 92.5 Silver OM Religious Locket Pendant",
        "92.50 % silver",
        "20mm",
        "15mm",
        "3mm",
        "3.200g",
        "650",
        "900",
        "40",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437756/products/yibsahzxbuvf1oojulio.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437756/products/yibsahzxbuvf1oojulio.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437756/products/yibsahzxbuvf1oojulio.jpg",
      ],
      [
        "anklets",
        "Ghungroo Payal",
        "Authentic Chhama Chham Bell Ghungroo Sterling Silver Payal Pair",
        "92.50 % silver",
        "260mm",
        "6mm",
        "6mm",
        "18.500g",
        "2200",
        "2900",
        "18",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790438039/products/pxrds23qarxramiu9uxz.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790438039/products/bhm3folil05qmp1tmwrl.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790438039/products/pxrds23qarxramiu9uxz.jpg",
      ],
      [
        "bridal-jewellery-sets",
        "Grand Bridal Set",
        "Exquisite Kundan & Pearl Complete Bridal Jewellery Set",
        "22K 916 Gold & Kundan",
        "N/A",
        "N/A",
        "N/A",
        "85.000g",
        "75000",
        "95000",
        "5",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437758/products/uxckwig39fxpa3jvnlam.jpg",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437774/products/iy2tmopioy9ecl3lcasq.png",
        "https://res.cloudinary.com/dxq570mvr/image/upload/v1790437758/products/uxckwig39fxpa3jvnlam.jpg",
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
              stock: !isNaN(parseInt(cols[10], 10)) ? parseInt(cols[10], 10) : 0,
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

  const handlePublishBulk = async () => {
    if (parsedCsvProducts.length === 0) return;
    try {
      setIsLoading(true);
      const data = await fetchFromAPI("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedCsvProducts),
      });
      if (data && data.success) {
        showToast("success", `🎉 Uploaded ${parsedCsvProducts.length} products!`);
        setParsedCsvProducts([]);
        setCsvFileName("");
        setShowBulkUpload(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchProducts();
      } else {
        showToast("error", data?.error || "Failed to publish.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "API upload error.");
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Filtering & Sorting Memo
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Category filter
      const matchesCategory = filterCategory ? p.category === filterCategory : true;

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q
        ? (p.productType && p.productType.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.material && p.material.toLowerCase().includes(q))
        : true;

      // Stock status filter
      const stock = p.stock ?? 0;
      let matchesStock = true;
      if (stockFilter === "low") matchesStock = stock > 0 && stock <= 5;
      else if (stockFilter === "out") matchesStock = stock === 0;
      else if (stockFilter === "in") matchesStock = stock >= 6;

      return matchesCategory && matchesSearch && matchesStock;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "price-asc") return (a.sellingPrice || 0) - (b.sellingPrice || 0);
      if (sortBy === "price-desc") return (b.sellingPrice || 0) - (a.sellingPrice || 0);
      if (sortBy === "stock-asc") return (a.stock ?? 0) - (b.stock ?? 0);
      if (sortBy === "stock-desc") return (b.stock ?? 0) - (a.stock ?? 0);
      if (sortBy === "name-asc") return (a.productType || "").localeCompare(b.productType || "");
      // Default: newest first
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });

    return result;
  }, [products, filterCategory, searchQuery, stockFilter, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, searchQuery, stockFilter, sortBy, itemsPerPage]);

  // 8. Pagination Slice
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    if (itemsPerPage === -1) return filteredAndSortedProducts;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(start, start + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  // Header checkbox status
  const isAllCurrentPageSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedIds.includes(p.id));

  const toggleSelectCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Inventory Stock Stats
  const lowStockCount = useMemo(
    () => products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => (p.stock ?? 0) === 0).length,
    [products]
  );

  return (
    <div className="space-y-6 pb-20">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#9B1B30] font-bold">
              Products Catalog
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0EA] border border-[#E8CFC5] text-xs font-bold text-[#7A1021]">
              {products.length} Items Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6F4A4A] mt-1">
            Organize catalog, bulk edit pricing &amp; stock, or select multiple products to delete.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="px-3.5 py-2 bg-[#FFF0EA] hover:bg-[#FFE2D8] border border-[#E8CFC5] text-[#7C1B2A] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>📄</span>
            <span>{showBulkUpload ? "Close CSV Tool" : "Bulk CSV Upload"}</span>
          </button>
          <button
            onClick={() => {
              setEditingProductId(null);
              setLocalPreviews({});
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
                stock: "",
                frontImage: "",
                backImage: "",
                modelImage: "",
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#E6C766] hover:from-[#E6C766] hover:to-[#D4AF37] text-[#35191C] text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Add Single Product</span>
          </button>
        </div>
      </div>

      {/* ── Status Toast ── */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between shadow-sm animate-fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-red-50 text-red-800 border-red-300"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-sm font-bold opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* ── Quick KPI Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => { setStockFilter("all"); setFilterCategory(""); }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            stockFilter === "all" && !filterCategory
              ? "bg-[#FFF0EA] border-[#B82E44] shadow-xs"
              : "bg-[#FFFDFC] border-[#E8CFC5] hover:bg-[#FFF9F5]"
          }`}
        >
          <span className="text-[11px] font-bold text-[#6F4A4A] uppercase tracking-wider block">Total Catalog</span>
          <p className="text-xl font-extrabold text-[#35191C] mt-0.5">{products.length}</p>
        </div>

        <div
          onClick={() => setStockFilter("low")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            stockFilter === "low"
              ? "bg-amber-50 border-amber-400 shadow-xs"
              : "bg-[#FFFDFC] border-[#E8CFC5] hover:bg-amber-50/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Low Stock (≤5)</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <p className="text-xl font-extrabold text-amber-900 mt-0.5">{lowStockCount}</p>
        </div>

        <div
          onClick={() => setStockFilter("out")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            stockFilter === "out"
              ? "bg-red-50 border-red-400 shadow-xs"
              : "bg-[#FFFDFC] border-[#E8CFC5] hover:bg-red-50/50"
          }`}
        >
          <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">Out of Stock</span>
          <p className="text-xl font-extrabold text-red-900 mt-0.5">{outOfStockCount}</p>
        </div>

        <div
          onClick={() => setStockFilter("in")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            stockFilter === "in"
              ? "bg-emerald-50 border-emerald-400 shadow-xs"
              : "bg-[#FFFDFC] border-[#E8CFC5] hover:bg-emerald-50/50"
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Sufficient Stock</span>
          <p className="text-xl font-extrabold text-emerald-900 mt-0.5">
            {products.length - lowStockCount - outOfStockCount}
          </p>
        </div>
      </div>

      {/* ── Bulk CSV Upload Section ── */}
      {showBulkUpload && (
        <div className="bg-[#FFFDFC] border-2 border-[#D4AF37]/50 rounded-2xl p-5 shadow-lg space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8CFC5]">
            <div>
              <h3 className="font-serif text-base text-[#7C1B2A] font-bold">
                ⚡ Bulk Excel / CSV Upload Center
              </h3>
              <p className="text-xs text-[#6F4A4A]">
                Import hundreds of products at once with category, dimensions, prices, and photo URLs.
              </p>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="px-3 py-1.5 bg-[#FFF0EA] hover:bg-[#FFE2D8] border border-[#E8CFC5] text-[#7C1B2A] rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
            >
              <span>📥</span>
              <span>Download CSV Template</span>
            </button>
          </div>

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

      {/* ── Filters, Search & Sort Control Center ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl p-4 shadow-[0_8px_32px_rgba(53,25,28,0.04)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="lg:col-span-5 relative">
            <span className="absolute left-3.5 top-2.5 text-[#6F4A4A] text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by name, description, material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl text-xs focus:outline-none focus:border-[#B82E44] text-[#35191C]"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl text-xs font-medium focus:outline-none focus:border-[#B82E44] text-[#35191C]"
            >
              <option value="">All Categories ({products.length})</option>
              {STORE_CATEGORIES.map((cat) => {
                const count = products.filter((p) => p.category === cat.slug).length;
                return (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full p-2 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl text-xs font-medium focus:outline-none focus:border-[#B82E44] text-[#35191C]"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="stock-desc">Stock: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          {/* Items Per Page */}
          <div className="lg:col-span-2">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="w-full p-2 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl text-xs font-medium focus:outline-none focus:border-[#B82E44] text-[#35191C]"
            >
              <option value={20}>Show: 20 / page</option>
              <option value={50}>Show: 50 / page</option>
              <option value={100}>Show: 100 / page</option>
              <option value={-1}>Show All ({filteredAndSortedProducts.length})</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags & Reset */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#E8CFC5]/50 text-xs text-[#6F4A4A]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">Showing:</span>
            <span className="font-bold text-[#7A1021]">
              {filteredAndSortedProducts.length} of {products.length} products
            </span>
            {filterCategory && (
              <span className="px-2 py-0.5 rounded-full bg-[#FFF0EA] border border-[#E8CFC5] text-[11px] font-bold text-[#7A1021] flex items-center gap-1">
                Category: {filterCategory}
                <button onClick={() => setFilterCategory("")} className="hover:text-red-700">✕</button>
              </span>
            )}
            {stockFilter !== "all" && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                Stock: {stockFilter}
                <button onClick={() => setStockFilter("all")} className="hover:text-red-700">✕</button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-full bg-[#FFF0EA] border border-[#E8CFC5] text-[11px] font-bold text-[#7A1021] flex items-center gap-1">
                &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery("")} className="hover:text-red-700">✕</button>
              </span>
            )}
          </div>

          {(filterCategory || searchQuery || stockFilter !== "all") && (
            <button
              onClick={() => {
                setFilterCategory("");
                setSearchQuery("");
                setStockFilter("all");
              }}
              className="text-xs text-[#B82E44] font-bold hover:underline"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Multi-Select Floating Bulk Action Bar ── */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-40 bg-gradient-to-r from-[#35070D] via-[#480C14] to-[#35070D] text-white p-4 rounded-2xl shadow-2xl border border-[#D4AF37]/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#35191C] font-extrabold text-sm flex items-center justify-center shrink-0">
              {selectedIds.length}
            </span>
            <div>
              <p className="font-serif text-sm font-bold text-[#E6C766]">
                {selectedIds.length} Product{selectedIds.length > 1 ? "s" : ""} Selected
              </p>
              <p className="text-[11px] text-white/70">
                Choose a bulk action below to update or remove selected items simultaneously.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <button
              onClick={selectAllFiltered}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg border border-white/20 transition-all"
            >
              Select All Filtered ({filteredAndSortedProducts.length})
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg border border-white/20 transition-all"
            >
              Deselect All
            </button>
            <button
              onClick={() => setShowBulkEditModal(true)}
              className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#E6C766] text-[#35191C] font-extrabold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              <span>✏️</span>
              <span>Bulk Edit ({selectedIds.length})</span>
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkOperationLoading}
              className="px-4 py-1.5 bg-[#B82E44] hover:bg-red-700 text-white font-extrabold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>🗑️</span>
              <span>Bulk Delete ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Products Table ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl shadow-[0_8px_32px_rgba(53,25,28,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-[#6F4A4A] text-sm space-y-3">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-serif text-base text-[#35191C] font-bold">Loading Keshar Jewellers Catalog...</p>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="p-16 text-center text-[#6F4A4A] space-y-2">
            <p className="text-4xl">📭</p>
            <p className="font-serif text-base font-bold text-[#35191C]">No products match the selected criteria.</p>
            <p className="text-xs">Try clearing search filters or add new products.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#35070D] text-[#E6C766] select-none">
                    <th className="p-3 border-b border-[#D4AF37]/20 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllCurrentPageSelected}
                        onChange={toggleSelectCurrentPage}
                        title="Select/Deselect all on this page"
                        className="w-4 h-4 rounded text-[#B82E44] focus:ring-0 cursor-pointer accent-[#B82E44]"
                      />
                    </th>
                    <th className="p-3 border-b border-[#D4AF37]/20 font-bold tracking-wider">Photo</th>
                    <th className="p-3 border-b border-[#D4AF37]/20 font-bold tracking-wider">Category</th>
                    <th className="p-3 border-b border-[#D4AF37]/20 font-bold tracking-wider">Product Type</th>
                    <th className="p-3 border-b border-[#D4AF37]/20 font-bold tracking-wider">Material</th>
                    <th className="p-3 border-b border-[#D4AF37]/20 font-bold tracking-wider">Weight</th>
                    <th className="p-3 border-b border-[#D4AF37]/20 font-bold tracking-wider">Price (₹)</th>
                    <th className="p-3 border-b border-[#D4AF37]/20 font-bold tracking-wider">Stock</th>
                    <th className="p-3 border-b border-[#D4AF37]/20 font-bold tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8CFC5]/50 bg-white">
                  {paginatedProducts.map((p) => {
                    const isSelected = selectedIds.includes(p.id);
                    const stock = p.stock ?? 0;

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isSelected ? "bg-[#FFF0EA] hover:bg-[#FFE2D8]" : "hover:bg-[#FFF9F5]"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectProduct(p.id)}
                            className="w-4 h-4 rounded text-[#B82E44] focus:ring-0 cursor-pointer accent-[#B82E44]"
                          />
                        </td>

                        {/* Photo */}
                        <td className="p-3">
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-[#E8CFC5] bg-[#FFF0EA] shrink-0 shadow-xs">
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

                        {/* Category */}
                        <td className="p-3">
                          <span className="font-semibold text-[#7A1021] bg-[#FFF0EA] px-2 py-0.5 rounded border border-[#E8CFC5] capitalize inline-block">
                            {p.category.replace(/-/g, " ")}
                          </span>
                        </td>

                        {/* Product Type & Description */}
                        <td className="p-3 max-w-[220px]">
                          <p className="font-bold text-[#35191C] truncate">{p.productType}</p>
                          <p className="text-[10px] text-[#6F4A4A] truncate">{p.description}</p>
                        </td>

                        {/* Material */}
                        <td className="p-3 text-[#35191C] font-medium text-[11px] whitespace-nowrap">
                          {p.material || "92.5 Sterling Silver"}
                        </td>

                        {/* Weight */}
                        <td className="p-3 font-mono font-medium text-[11px] text-[#35191C]">
                          {p.weight || "—"}
                        </td>

                        {/* Price */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-bold text-[#7A1021] text-xs">
                            ₹{p.sellingPrice?.toLocaleString("en-IN")}
                          </span>
                          {p.mrp && p.mrp > p.sellingPrice && (
                            <span className="text-[10px] text-[#6F4A4A]/60 block line-through">
                              ₹{p.mrp?.toLocaleString("en-IN")}
                            </span>
                          )}
                        </td>

                        {/* Stock Status Badge */}
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              stock === 0
                                ? "bg-red-50 text-red-800 border-red-300"
                                : stock <= 5
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-emerald-50 text-emerald-800 border-emerald-300"
                            }`}
                          >
                            {stock === 0 ? "Out of stock" : `${stock} pcs`}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(p)}
                              title="Edit product"
                              className="px-2.5 py-1 bg-[#FFF0EA] hover:bg-[#FFE2D8] text-[#7A1021] border border-[#E8CFC5] rounded-lg font-bold transition-all text-xs flex items-center gap-1"
                            >
                              <span>✏️</span>
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              title="Delete product"
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold transition-all text-xs flex items-center gap-1"
                            >
                              <span>🗑️</span>
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Controls ── */}
            {itemsPerPage !== -1 && totalPages > 1 && (
              <div className="p-4 bg-[#FFF9F5] border-t border-[#E8CFC5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-[#6F4A4A]">
                  Showing Page <strong className="text-[#35191C]">{currentPage}</strong> of{" "}
                  <strong className="text-[#35191C]">{totalPages}</strong> (
                  {filteredAndSortedProducts.length} items total)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg border border-[#E8CFC5] bg-white text-[#35191C] font-semibold disabled:opacity-40 hover:bg-[#FFF0EA] transition-all"
                  >
                    « First
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-[#E8CFC5] bg-white text-[#35191C] font-semibold disabled:opacity-40 hover:bg-[#FFF0EA] transition-all"
                  >
                    ‹ Previous
                  </button>

                  <div className="px-3 py-1 rounded-lg bg-[#35070D] text-[#E6C766] font-bold">
                    {currentPage}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg border border-[#E8CFC5] bg-white text-[#35191C] font-semibold disabled:opacity-40 hover:bg-[#FFF0EA] transition-all"
                  >
                    Next ›
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded-lg border border-[#E8CFC5] bg-white text-[#35191C] font-semibold disabled:opacity-40 hover:bg-[#FFF0EA] transition-all"
                  >
                    Last »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── BULK EDIT MODAL ── */}
      {showBulkEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFDFC] border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8CFC5]">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#35191C] font-bold flex items-center justify-center">
                  ✏️
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#7C1B2A]">
                    Bulk Edit {selectedIds.length} Products
                  </h3>
                  <p className="text-xs text-[#6F4A4A]">
                    Update category, stock, material, or prices for all selected items.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkEditModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {bulkOperationLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-serif text-base text-[#7A1021] font-bold">
                  {bulkOperationProgress || "Applying updates to database..."}
                </p>
                <p className="text-xs text-[#6F4A4A]">Please do not close the window while updates are applying.</p>
              </div>
            ) : (
              <form onSubmit={handleBulkEditSubmit} className="space-y-4 text-xs">
                {/* 1. Category Bulk Change */}
                <div className="p-3.5 bg-[#FFF0EA]/40 rounded-xl border border-[#E8CFC5] space-y-1.5">
                  <label className="block font-bold text-[#35191C]">
                    1. Change Category (Optional)
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44] text-[#35191C]"
                  >
                    <option value="">-- Keep Current Categories (No Change) --</option>
                    {STORE_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        Move to {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Material Bulk Change */}
                <div className="p-3.5 bg-[#FFF0EA]/40 rounded-xl border border-[#E8CFC5] space-y-1.5">
                  <label className="block font-bold text-[#35191C]">
                    2. Change Material / Hallmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 92.5 Sterling Silver or 22K 916 Gold (leave blank for no change)"
                    value={bulkMaterial}
                    onChange={(e) => setBulkMaterial(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44] text-[#35191C]"
                  />
                </div>

                {/* 3. Stock Bulk Change */}
                <div className="p-3.5 bg-[#FFF0EA]/40 rounded-xl border border-[#E8CFC5] space-y-2">
                  <label className="block font-bold text-[#35191C]">
                    3. Update Inventory Stock (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={bulkStockMode}
                      onChange={(e: any) => setBulkStockMode(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44] text-[#35191C]"
                    >
                      <option value="no-change">-- No Change to Stock --</option>
                      <option value="set">Set Fixed Stock Quantity</option>
                      <option value="add">Add (+ Stock Quantity)</option>
                      <option value="subtract">Subtract (- Stock Quantity)</option>
                    </select>
                    {bulkStockMode !== "no-change" && (
                      <input
                        type="number"
                        min="0"
                        placeholder="Quantity (e.g. 20)"
                        value={bulkStockValue}
                        onChange={(e) => setBulkStockValue(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44] text-[#35191C] font-bold"
                      />
                    )}
                  </div>
                </div>

                {/* 4. Price Bulk Adjustment */}
                <div className="p-3.5 bg-[#FFF0EA]/40 rounded-xl border border-[#E8CFC5] space-y-2">
                  <label className="block font-bold text-[#35191C]">
                    4. Adjust Selling Price (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={bulkPriceMode}
                      onChange={(e: any) => setBulkPriceMode(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44] text-[#35191C]"
                    >
                      <option value="no-change">-- No Change to Price --</option>
                      <option value="set">Set Fixed Price (₹)</option>
                      <option value="percent-increase">Increase by Percentage (+ %)</option>
                      <option value="percent-decrease">Discount by Percentage (- %)</option>
                    </select>
                    {bulkPriceMode !== "no-change" && (
                      <input
                        type="number"
                        step="any"
                        placeholder={bulkPriceMode === "set" ? "Price in ₹ (e.g. 1500)" : "Percentage (e.g. 10 for 10%)"}
                        value={bulkPriceValue}
                        onChange={(e) => setBulkPriceValue(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44] text-[#7A1021] font-bold"
                      />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8CFC5]">
                  <button
                    type="button"
                    onClick={() => setShowBulkEditModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#E6C766] hover:from-[#E6C766] hover:to-[#D4AF37] text-[#35191C] font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all"
                  >
                    Apply Bulk Updates ({selectedIds.length})
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── SINGLE PRODUCT ADD / EDIT MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFDFC] border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8CFC5]">
              <h3 className="font-serif text-lg font-bold text-[#7C1B2A]">
                {editingProductId ? "✏️ Edit Product Details" : "Add Single Product"}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingProductId(null); setAnkletType(""); }}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              {/* Product Photos (File Upload & URL toggle) */}
              <div className="space-y-3 pt-3 border-t border-[#E8CFC5]">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#35191C]">
                    10. Product Photos (Front, Back, Model)
                  </label>
                  <div className="flex items-center gap-1 bg-[#FFF0EA] p-1 rounded-lg border border-[#E8CFC5] text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("file")}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        imageUploadMode === "file"
                          ? "bg-[#B82E44] text-white shadow-sm"
                          : "text-[#6F4A4A] hover:text-[#B82E44]"
                      }`}
                    >
                      📁 Upload Files
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("url")}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        imageUploadMode === "url"
                          ? "bg-[#B82E44] text-white shadow-sm"
                          : "text-[#6F4A4A] hover:text-[#B82E44]"
                      }`}
                    >
                      🔗 Image URLs
                    </button>
                  </div>
                </div>

                {imageUploadMode === "file" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(
                      [
                        { field: "frontImage" as const, label: "Front Photo", emoji: "📸", required: true },
                        { field: "backImage" as const, label: "Back Photo", emoji: "📷", required: false },
                        { field: "modelImage" as const, label: "Model Photo", emoji: "💃", required: false },
                      ] as const
                    ).map(({ field, label, emoji, required }) => {
                      const isBackgroundUploading = backgroundUploading[field];
                      const pct = uploadProgress[field] ?? 0;
                      // Show local preview immediately if exists, else Cloudinary URL
                      const displayUrl = localPreviews[field] || formData[field];

                      return (
                        <div key={field} className="flex flex-col gap-2">
                          {/* Label */}
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-[#7C1B2A] text-xs">{label}</span>
                            {required && <span className="text-[#B82E44] text-xs">*</span>}
                            {!required && <span className="text-[10px] text-[#9B7B6A]">(optional)</span>}
                          </div>

                          {/* Upload Area */}
                          {displayUrl ? (
                            /* Preview State (Local or Cloudinary) */
                            <div className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-[#B82E44] group">
                              <img src={displayUrl} alt={label} className={`w-full h-full object-cover transition-opacity ${isBackgroundUploading ? 'opacity-50 blur-[1px]' : ''}`} />
                              
                              {/* Background Uploading Overlay */}
                              {isBackgroundUploading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm z-10">
                                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-2" />
                                  <div className="w-3/4 bg-white/30 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all duration-200" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-white text-[10px] font-bold mt-1 tracking-wider drop-shadow-md">
                                    {pct < 10 ? "PROCESSING" : `UPLOADING ${pct}%`}
                                  </span>
                                </div>
                              )}

                              {/* Remove Button (Hide while uploading) */}
                              {!isBackgroundUploading && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({ ...prev, [field]: "" }));
                                    setLocalPreviews((prev) => ({ ...prev, [field]: "" }));
                                  }}
                                  className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-20"
                                >
                                  ✕ Remove
                                </button>
                              )}

                              {/* Change Photo Overlay (Hide while uploading) */}
                              {!isBackgroundUploading && (
                                <label className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold text-center py-1.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-all z-20">
                                  📷 Change Photo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageFileChange(e, field)}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                          ) : (
                            /* Empty — Tap to Upload */
                            <label className="w-full h-36 border-2 border-dashed border-[#B82E44]/40 hover:border-[#B82E44] active:border-[#B82E44] bg-white hover:bg-[#FFF8F5] rounded-2xl flex flex-col items-center justify-center cursor-pointer gap-1.5 transition-all touch-manipulation">
                              <span className="text-3xl">{emoji}</span>
                              <span className="text-xs font-bold text-[#B82E44]">Tap to upload {label}</span>
                              <span className="text-[10px] text-[#9B7B6A]">Auto-compresses big photos ✨</span>
                              {/* Gallery input */}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageFileChange(e, field)}
                                className="hidden"
                              />
                            </label>
                          )}

                          {/* Camera Button — only when no image and not uploading */}
                          {!displayUrl && !isBackgroundUploading && (
                            <label className="w-full py-2 border border-[#E8CFC5] bg-[#FFF0EA]/60 hover:bg-[#FFF0EA] rounded-xl text-[11px] font-semibold text-[#7C1B2A] text-center cursor-pointer flex items-center justify-center gap-1 transition-all touch-manipulation">
                              📷 Open Camera
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => handleImageFileChange(e, field)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
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
                )}
              </div>

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

              {/* Anklet Special Prices (Single/Pair) */}
              {formData.category === "anklets" && (
                <div className="p-3 bg-[#FFF0EA]/60 border border-[#E8CFC5] rounded-xl mt-4 space-y-3">
                  <label className="block font-bold text-[#35191C]">
                    Anklet Prices (Single & Pair) *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-xs text-[#35191C] mb-1">
                        Single Anklet Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 250"
                        value={formData.singlePrice}
                        onChange={(e) => setFormData({ ...formData, singlePrice: e.target.value })}
                        className="w-full p-2.5 bg-white border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44] text-[#B82E44] font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-xs text-[#35191C] mb-1">
                        Pair Anklet Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={formData.pairPrice}
                        onChange={(e) => setFormData({ ...formData, pairPrice: e.target.value })}
                        className="w-full p-2.5 bg-white border border-[#E8CFC5] rounded-xl focus:outline-none focus:border-[#B82E44] text-[#B82E44] font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

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
                    9. Inventory Stock (pcs) <span className="text-[#B82E44]">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5  (enter 0 if out of stock)"
                    min={0}
                    max={999}
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF0EA]/40 border border-[#E8CFC5] rounded-xl font-bold text-green-700 focus:outline-none focus:border-[#B82E44]"
                  />
                  <p className="text-[10px] text-[#9B7B6A] mt-1">
                    ⚠️ Stock sirf tab ghata hai jab customer payment kare. Add to Cart se stock nahi ghata.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8CFC5]">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingProductId(null); setLocalPreviews({}); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || Object.values(backgroundUploading).some(Boolean)}
                  className={`px-6 py-2.5 font-bold uppercase tracking-wider rounded-xl shadow-md transition-all text-xs ${
                    Object.values(backgroundUploading).some(Boolean)
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-[#B82E44] hover:bg-[#7C1B2A] text-[#FFF8F0]"
                  }`}
                >
                  {isLoading
                    ? "Saving..."
                    : Object.values(backgroundUploading).some(Boolean)
                    ? "⏳ Finalizing Photos..."
                    : editingProductId
                    ? "💾 Update Product"
                    : "Save Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
