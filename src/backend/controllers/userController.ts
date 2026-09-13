/**
 * ============================================================
 * FILE: src/backend/controllers/userController.ts
 * PURPOSE: Database operations for User Management (Fetch, Role update, Delete)
 * ============================================================
 */

import connectToDatabase from "@/backend/config/db";
import UserModel from "@/backend/models/User";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
}

// Default Seed Users to show in UI if MongoDB database has no registered users yet
const DEFAULT_SEED_USERS: UserDTO[] = [
  {
    id: "user-seed-1",
    name: "Himanshu Soni",
    email: "himanshu@kesharjewellers.com",
    phone: "+91 98765 43210",
    role: "admin",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user-seed-2",
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91 91234 56789",
    role: "user",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user-seed-3",
    name: "Rajesh Kumar",
    email: "rajesh.k@yahoo.com",
    phone: "+91 99887 76655",
    role: "user",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user-seed-4",
    name: "Ananya Verma",
    email: "ananya.verma@outlook.com",
    phone: "+91 98112 23344",
    role: "user",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user-seed-5",
    name: "Arvind Sen",
    email: "arvind.sen@kesharjewellers.com",
    phone: "+91 97766 55443",
    role: "admin",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Helper: Convert MongoDB document to clean DTO
 */

function formatUser(doc: any): UserDTO {
  return {
    id: doc._id ? doc._id.toString() : doc.id || "",
    name: doc.name || "Customer",
    email: doc.email || "",
    phone: doc.phone || "N/A",
    role: doc.role === "admin" ? "admin" : "user",
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

/**
 * Get all registered users from MongoDB Atlas
 */
export async function getAllUsers(): Promise<UserDTO[]> {
  try {
    await connectToDatabase();
    const docs = await UserModel.find({}).sort({ createdAt: -1 }).lean();

    if (!docs || docs.length === 0) {
      return DEFAULT_SEED_USERS;
    }

    return docs.map((doc: any) => formatUser(doc));
  } catch (error) {
    console.warn("Failed to fetch users from MongoDB, returning seed users:", error);
    return DEFAULT_SEED_USERS;
  }
}

/**
 * Delete a user by ID
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const res = await UserModel.findByIdAndDelete(id);
    return !!res;
  } catch (error) {
    console.error("Failed to delete user from MongoDB:", error);
    return false;
  }
}

/**
 * Update user role (toggle between 'user' and 'admin')
 */
export async function updateUserRole(id: string, newRole: "user" | "admin"): Promise<boolean> {
  try {
    await connectToDatabase();
    const res = await UserModel.findByIdAndUpdate(id, { role: newRole }, { new: true });
    return !!res;
  } catch (error) {
    console.error("Failed to update user role:", error);
    return false;
  }
}
