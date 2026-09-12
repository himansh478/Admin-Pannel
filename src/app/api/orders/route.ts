/**
 * ============================================================
 * FILE: src/app/api/orders/route.ts
 * PURPOSE: REST API endpoint for managing customer orders.
 * ============================================================
 *
 * BEGINNER EXPLANATION:
 * This file handles HTTP requests to /api/orders
 *
 * GET    /api/orders           → Get all orders
 * GET    /api/orders?status=pending → Filter by status
 * POST   /api/orders           → Create a new order
 * PATCH  /api/orders           → Update order status
 * DELETE /api/orders?id=xxx    → Delete an order
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "@/backend/controllers/orderController";

// ----------------------------------------------------------
// GET: Fetch all orders (optionally filtered by status)
// Usage: GET /api/orders
// Usage: GET /api/orders?status=pending
// ----------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const orders = await getAllOrders(status);
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------
// POST: Create a new order
// Body: { customerName, customerPhone, customerEmail?, customerAddress?, items[], totalAmount, notes? }
// ----------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.customerName || !body.customerPhone) {
      return NextResponse.json(
        { success: false, error: "Customer name and phone are required." },
        { status: 400 }
      );
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one item is required." },
        { status: 400 }
      );
    }

    const order = await createOrder(body);
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------
// PATCH: Update the status of an existing order
// Body: { id: "...", status: "confirmed" }
// ----------------------------------------------------------
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Order id and status are required." },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Order not found or update failed." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Order status updated." });
  } catch (error: any) {
    console.error("PATCH /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------
// DELETE: Remove an order permanently
// Usage: DELETE /api/orders?id=xxx
// ----------------------------------------------------------
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order id is required." },
        { status: 400 }
      );
    }

    const deleted = await deleteOrder(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Order deleted." });
  } catch (error: any) {
    console.error("DELETE /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}
