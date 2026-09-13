/**
 * ============================================================
 * FILE: src/app/api/users/route.ts
 * PURPOSE: Next.js App Router API Endpoint for Registered Users
 * ============================================================
 *
 * GET    /api/users           -> Fetch all registered users
 * DELETE /api/users?id=xyz    -> Delete user account
 * PATCH  /api/users           -> Update user role ({ id, role })
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
} from "@/backend/controllers/userController";

export const dynamic = "force-dynamic";

// ============================================================
// GET /api/users
// ============================================================
export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ============================================================
// DELETE /api/users?id=<user_id>
// ============================================================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const wasDeleted = await deleteUser(id);
    return NextResponse.json({ success: true, deleted: wasDeleted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ============================================================
// PATCH /api/users
// ============================================================
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, role } = body;

    if (!id || !role || !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Valid ID and role ('user' | 'admin') are required" },
        { status: 400 }
      );
    }

    const updated = await updateUserRole(id, role);
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user role";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
