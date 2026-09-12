/**
 * ============================================================
 * FILE: src/app/api/products/route.ts
 * PURPOSE: The API endpoint for products.
 * ============================================================
 *
 * BEGINNER EXPLANATION � What is an API Route?
 * This file is the "door" to the backend.
 * When your browser or admin panel visits:
 *   GET  /api/products            ? Returns all products
 *   GET  /api/products?category=rings  ? Returns only rings
 *   POST /api/products            ? Saves a new product
 *   DELETE /api/products?id=xyz   ? Deletes a product
 *
 * This file does NOT talk to MongoDB directly.
 * It delegates (passes the task) to the Controller.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  getProductsByCategory,
  saveProduct,
  saveMultipleProducts,
  deleteProduct,
} from "@/backend/controllers/productController";

// Tell Next.js this route is always dynamic (never cache it)
export const dynamic = "force-dynamic";

// ============================================================
// GET /api/products
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // If a category filter is provided, return only that category
    if (category) {
      const products = await getProductsByCategory(category);
      return NextResponse.json({ success: true, products });
    }

    // Otherwise return all products
    const products = await getAllProducts();
    return NextResponse.json({ success: true, products });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ============================================================
// POST /api/products
// Accepts a single product object OR an array (bulk upload)
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // --- BULK UPLOAD (Array of products, from CSV) ---
    if (Array.isArray(body)) {
      // Clean and format each row from the CSV
      const formatted = body.map((item, idx) => ({
        id:           item.id || `temp-${Date.now()}-${idx}`,
        category:     String(item.category     || "").toLowerCase().trim(),
        productType:  String(item.productType  || "").trim(),
        description:  String(item.description  || "").trim(),
        material:     String(item.material     || "").trim(),
        dimensionL:   String(item.dimensionL   || ""),
        dimensionW:   String(item.dimensionW   || ""),
        dimensionH:   String(item.dimensionH   || ""),
        weight:       String(item.weight       || ""),
        sellingPrice: Number(item.sellingPrice) || 0,
        mrp:          Number(item.mrp)          || 0,
        frontImage:   String(item.frontImage   || ""),
        backImage:    String(item.backImage    || ""),
        modelImage:   String(item.modelImage   || ""),
      }));

      const result = await saveMultipleProducts(formatted);
      return NextResponse.json({ success: true, message: `Saved ${result.count} products` });
    }

    // --- SINGLE PRODUCT ---
    await saveProduct(body);
    return NextResponse.json({ success: true, message: "Product saved successfully" });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ============================================================
// DELETE /api/products?id=<mongodb_id>
// ============================================================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validate that an ID was provided
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const wasDeleted = await deleteProduct(id);

    if (!wasDeleted) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Product deleted" });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
