/**
 * ============================================================
 * FILE: src/app/api/admin/route.ts
 * PURPOSE: Next.js App Router API Route for Admin System (/api/admin)
 * ============================================================
 *
 * GET    /api/admin           -> Returns list of admins
 * DELETE /api/admin?id=xyz    -> Deletes admin account
 * PATCH  /api/admin           -> Updates admin role or status
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllAdmins,
  deleteAdmin,
  updateAdmin,
} from "@/backend/controllers/adminController";

export const dynamic = "force-dynamic";

// GET /api/admin
export async function GET() {
  try {
    const admins = await getAllAdmins();
    return NextResponse.json({ success: true, admins });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch admins";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/admin?id=xyz
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Admin ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteAdmin(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to delete admin" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Admin account deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete admin";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PATCH /api/admin
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, role, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Admin ID is required" },
        { status: 400 }
      );
    }

    const result = await updateAdmin(id, { role, status });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to update admin" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Admin updated successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update admin";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

