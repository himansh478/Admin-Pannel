/**
 * ============================================================
 * FILE: src/backend/controllers/adminController.ts
 * PURPOSE: Admin Controller operations for Next.js App Router API
 * ============================================================
 */

import connectToDatabase from "@/backend/config/db";
import AdminModel from "@/backend/models/Admin";

export interface AdminDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "superadmin" | "admin" | "manager";
  permissions: string[];
  status: "active" | "suspended";
  lastLogin: string | null;
  createdAt: string;
}

// Seed admin fallback data if database table is fresh
const SEED_ADMINS: AdminDTO[] = [
  {
    id: "admin-seed-1",
    name: "Himanshu Soni (Owner)",
    email: "himanshu@kesharjewellers.com",
    phone: "+91 98765 43210",
    role: "superadmin",
    permissions: ["products", "orders", "inventory", "users", "analytics", "settings"],
    status: "active",
    lastLogin: new Date().toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "admin-seed-2",
    name: "Arvind Sen (Manager)",
    email: "arvind.sen@kesharjewellers.com",
    phone: "+91 97766 55443",
    role: "admin",
    permissions: ["products", "orders", "inventory", "analytics"],
    status: "active",
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function formatAdmin(doc: any): AdminDTO {
  return {
    id: doc._id ? doc._id.toString() : doc.id || "",
    name: doc.name || "Admin",
    email: doc.email || "",
    phone: doc.phone || "N/A",
    role: doc.role || "admin",
    permissions: doc.permissions || ["products", "orders", "inventory", "users", "analytics"],
    status: doc.status || "active",
    lastLogin: doc.lastLogin ? new Date(doc.lastLogin).toISOString() : null,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

/**
 * Fetch all admins
 */
export async function getAllAdmins(): Promise<AdminDTO[]> {
  try {
    await connectToDatabase();
    const docs = await AdminModel.find({}).sort({ createdAt: -1 }).lean();

    if (!docs || docs.length === 0) {
      return SEED_ADMINS;
    }

    return docs.map((d: any) => formatAdmin(d));
  } catch (error) {
    console.warn("Failed to fetch admins from MongoDB, returning seed admins:", error);
    return SEED_ADMINS;
  }
}

/**
 * Delete admin account (Super Admin is Protected)
 */
export async function deleteAdmin(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const adminToDelete = await AdminModel.findById(id);

    if (!adminToDelete) {
      return { success: false, error: "Admin account not found" };
    }

    if (adminToDelete.role === "superadmin") {
      return { success: false, error: "The Super Admin account cannot be deleted." };
    }

    await AdminModel.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete admin:", error);
    return { success: false, error: "Failed to delete admin account" };
  }
}

/**
 * Update admin role or status (Single Super Admin Enforced)
 */
export async function updateAdmin(
  id: string,
  data: { role?: "superadmin" | "admin" | "manager"; status?: "active" | "suspended" }
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const admin = await AdminModel.findById(id);

    if (!admin) {
      return { success: false, error: "Admin account not found" };
    }

    // ── STRICT SINGLE SUPER ADMIN RULE FOR PROMOTION ──
    if (data.role === "superadmin" && admin.role !== "superadmin") {
      const existingSuperAdmin = await AdminModel.findOne({ role: "superadmin" }).lean();
      if (existingSuperAdmin) {
        return {
          success: false,
          error: "A Super Admin account already exists. Only ONE Super Admin is permitted.",
        };
      }
    }

    // Protect Super Admin from suspension
    if (admin.role === "superadmin" && data.status === "suspended") {
      return { success: false, error: "The Super Admin account cannot be suspended." };
    }

    await AdminModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    return { success: true };
  } catch (error) {
    console.error("Failed to update admin:", error);
    return { success: false, error: "Failed to update admin account" };
  }
}

