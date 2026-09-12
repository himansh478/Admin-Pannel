/**
 * ============================================================
 * FILE: src/backend/models/Order.ts
 * PURPOSE: Defines the shape (Schema) of a Customer Order in MongoDB.
 * ============================================================
 *
 * BEGINNER EXPLANATION:
 * When a customer places an order, we need to save:
 *   - Who ordered (name, phone, address)
 *   - What they ordered (list of products with quantities)
 *   - How much they paid (total amount)
 *   - Order status (pending → confirmed → shipped → delivered)
 *
 * This schema defines all those fields.
 */

import mongoose, { Schema, Document } from "mongoose";

// ----------------------------------------------------------
// STEP 1: Define what each ordered item looks like
// ----------------------------------------------------------
export interface IOrderItem {
  productId: string;    // MongoDB ID of the product
  productName: string;  // e.g. "Gold Ring Design 5"
  category: string;     // e.g. "rings"
  quantity: number;     // How many pieces ordered
  price: number;        // Price per piece at time of order
}

// ----------------------------------------------------------
// STEP 2: Define the full Order document shape
// ----------------------------------------------------------
export interface IOrder extends Document {
  customerName: string;     // e.g. "Rahul Sharma"
  customerPhone: string;    // e.g. "+91 98765 43210"
  customerEmail: string;    // e.g. "rahul@gmail.com"
  customerAddress: string;  // Delivery address
  items: IOrderItem[];      // List of products ordered
  totalAmount: number;      // Total bill amount in ₹
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  notes: string;            // Any special instructions
  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------------------------------------------------
// STEP 3: Create the Schema (blueprint for MongoDB)
// ----------------------------------------------------------
const OrderItemSchema = new Schema(
  {
    productId:   { type: String, default: "" },
    productName: { type: String, required: true },
    category:    { type: String, default: "" },
    quantity:    { type: Number, default: 1 },
    price:       { type: Number, required: true },
  },
  { _id: false } // Don't create separate IDs for each item
);

const OrderSchema = new Schema<IOrder>(
  {
    customerName:    { type: String, required: true },
    customerPhone:   { type: String, required: true },
    customerEmail:   { type: String, default: "" },
    customerAddress: { type: String, default: "" },
    items:           { type: [OrderItemSchema], required: true },
    totalAmount:     { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,  // Index for fast filtering by status
    },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true, // Auto-adds createdAt and updatedAt
  }
);

// Index on createdAt for sorting by newest first
OrderSchema.index({ createdAt: -1 });

// ----------------------------------------------------------
// STEP 4: Export the Model (with hot-reload protection)
// ----------------------------------------------------------
const Order =
  mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
