/**
 * ============================================================
 * FILE: src/backend/models/Admin.ts
 * PURPOSE: Admin Mongoose Model & Interface for Standalone Admin Panel
 * ============================================================
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "superadmin" | "admin" | "manager";
  permissions: string[];
  status: "active" | "suspended";
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: {
      type: String,
      enum: ["superadmin", "admin", "manager"],
      default: "admin",
    },
    permissions: {
      type: [String],
      default: ["products", "orders", "inventory", "users", "analytics"],
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const Admin =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
