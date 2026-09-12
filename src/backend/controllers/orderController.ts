/**
 * ============================================================
 * FILE: src/backend/controllers/orderController.ts
 * PURPOSE: Contains all database operations for Orders.
 * ============================================================
 *
 * BEGINNER EXPLANATION:
 * This controller handles everything related to customer orders.
 * When a customer places an order, the admin can see it here.
 *
 * Functions:
 *   - getAllOrders()        → Get all orders (newest first)
 *   - createOrder()         → Save a new order
 *   - updateOrderStatus()   → Change order status (pending→shipped etc)
 *   - deleteOrder()         → Remove an order
 *   - getOrderStats()       → Summary numbers for dashboard
 */

import connectToDatabase from "@/backend/config/db";
import OrderModel from "@/backend/models/Order";

// ----------------------------------------------------------
// Helper: Convert raw MongoDB order document to clean object
// ----------------------------------------------------------
function toOrder(doc: any) {
  return {
    id:              doc._id.toString(),
    customerName:    doc.customerName,
    customerPhone:   doc.customerPhone,
    customerEmail:   doc.customerEmail ?? "",
    customerAddress: doc.customerAddress ?? "",
    items:           doc.items ?? [],
    totalAmount:     doc.totalAmount,
    status:          doc.status,
    notes:           doc.notes ?? "",
    createdAt:       doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
    updatedAt:       doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
  };
}

// ----------------------------------------------------------
// READ: Get ALL orders (newest first)
// Optional filter: pass status string to filter by status
// ----------------------------------------------------------
export async function getAllOrders(status?: string) {
  try {
    const conn = await connectToDatabase();
    if (!conn) return [];

    // Build query — if status is provided, filter by it
    const query = status ? { status } : {};
    const docs = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map(toOrder);
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    return [];
  }
}

// ----------------------------------------------------------
// CREATE: Save a new customer order to the database
// ----------------------------------------------------------
export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  items: { productId?: string; productName: string; category?: string; quantity: number; price: number }[];
  totalAmount: number;
  notes?: string;
}) {
  const conn = await connectToDatabase();
  if (!conn) throw new Error("Database not connected");

  // Calculate totalAmount from items if not provided
  const total = data.totalAmount ||
    data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await OrderModel.create({ ...data, totalAmount: total });
  return toOrder(order);
}

// ----------------------------------------------------------
// UPDATE: Change the status of an existing order
// Status flow: pending → confirmed → shipped → delivered
// ----------------------------------------------------------
export async function updateOrderStatus(id: string, status: string) {
  try {
    const conn = await connectToDatabase();
    if (!conn) return false;

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const result = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    return result !== null;
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    return false;
  }
}

// ----------------------------------------------------------
// DELETE: Remove an order permanently
// ----------------------------------------------------------
export async function deleteOrder(id: string): Promise<boolean> {
  try {
    const conn = await connectToDatabase();
    if (!conn) return false;

    const deleted = await OrderModel.findByIdAndDelete(id);
    return deleted !== null;
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    return false;
  }
}

// ----------------------------------------------------------
// STATS: Get summary numbers for the Dashboard
// Returns: total orders, revenue, pending count, delivered count
// ----------------------------------------------------------
export async function getOrderStats() {
  try {
    const conn = await connectToDatabase();
    if (!conn) return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0 };

    const [stats] = await OrderModel.aggregate([
      {
        $group: {
          _id: null,
          totalOrders:     { $sum: 1 },
          totalRevenue:    { $sum: "$totalAmount" },
          pendingOrders:   { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        },
      },
    ]);

    return stats
      ? { totalOrders: stats.totalOrders, totalRevenue: stats.totalRevenue, pendingOrders: stats.pendingOrders, deliveredOrders: stats.deliveredOrders }
      : { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0 };
  } catch (error) {
    console.error("Error in getOrderStats:", error);
    return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0 };
  }
}
