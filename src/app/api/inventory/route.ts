/**
 * ============================================================
 * FILE: src/app/api/inventory/route.ts
 * PURPOSE: REST API endpoint for managing product inventory/stock.
 * ============================================================
 *
 * BEGINNER EXPLANATION:
 * This file handles HTTP requests to /api/inventory
 *
 * GET   /api/inventory          → Get category-wise stock summary
 * PATCH /api/inventory          → Update stock for a single product
 */

import { NextRequest, NextResponse } from "next/server";
import { getCategorySummary, updateProductStock } from "@/backend/controllers/productController";

// ----------------------------------------------------------
// GET: Return category-wise product count and total stock
// Used on Admin Dashboard and Inventory page
// ----------------------------------------------------------
export async function GET() {
  try {
    const summary = await getCategorySummary();
    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error("GET /api/inventory error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------
// PATCH: Update the stock count for a specific product
// Body: { id: "product_id", stock: 25 }
// ----------------------------------------------------------
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, stock } = body;

    if (!id || stock === undefined) {
      return NextResponse.json(
        { success: false, error: "Product id and stock value are required." },
        { status: 400 }
      );
    }

    // stock must be a non-negative number
    const stockValue = Math.max(0, Number(stock));
    const updated = await updateProductStock(id, stockValue);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: `Stock updated to ${stockValue} pieces.` });
  } catch (error: any) {
    console.error("PATCH /api/inventory error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update stock" },
      { status: 500 }
    );
  }
}
