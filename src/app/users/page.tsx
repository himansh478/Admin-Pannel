/**
 * ============================================================
 * FILE: src/app/users/page.tsx (Registered Users Management Page)
 * PURPOSE: Control Center to view, search, and manage registered store users
 * ============================================================
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import StatCard from "@/components/admin/StatCard";
import { fetchFromAPI } from "@/services/api";
import {
  IconUsers,
  IconCrown,
  IconSearch,
  IconFilter,
  IconRefreshCw,
  IconShieldCheck,
  IconClock,
} from "@/components/admin/Icons";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fetch users from API endpoint (Express Backend or fallback API)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchFromAPI("/api/users");
      if (data && data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch registered users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user handler
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user account "${name}"?`)) {
      return;
    }

    try {
      setActionLoadingId(id);
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(data.error || "Failed to delete user account");
      }
    } catch (err) {
      console.error("Delete user error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle role handler
  const handleToggleRole = async (id: string, currentRole: "user" | "admin") => {
    const newRole: "user" | "admin" = currentRole === "admin" ? "user" : "admin";
    try {
      setActionLoadingId(id);
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.error || "Failed to update user role");
      }
    } catch (err) {
      console.error("Update role error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q));
      return matchesRole && matchesQuery;
    });
  }, [users, roleFilter, searchQuery]);

  // Derived metrics
  const totalUsers = users.length;
  const totalCustomers = users.filter((u) => u.role === "user").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-[#35191C]/10 rounded-3xl w-full border border-[#E8CFC5]" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-[#FFF0EA] rounded-2xl border border-[#E8CFC5]" />
          ))}
        </div>
        <div className="h-96 bg-[#FFF0EA] rounded-3xl border border-[#E8CFC5]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* ── 1. HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2C1417] via-[#35191C] to-[#4A0E17] text-[#FFF8F0] p-6 sm:p-8 shadow-2xl border border-[#D4AF37]/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E6C766] text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
              <IconUsers className="w-3.5 h-3.5" />
              Member Directory ✦
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl text-white font-extrabold tracking-tight">
              Registered Users &amp; <span className="text-[#E6C766]">Admins</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#E8CFC5]/90 font-light max-w-xl">
              View all customer accounts registered on Keshar Jewellers portal, manage access privileges, and review contact details.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="px-4 py-2.5 bg-[#4A2528]/80 hover:bg-[#5A3538] border border-[#E8CFC5]/30 text-[#FFF8F0] text-xs font-bold uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 shrink-0 shadow-sm"
          >
            <IconRefreshCw className="w-4 h-4 text-[#E6C766]" />
            <span>Refresh Users</span>
          </button>
        </div>
      </div>

      {/* ── 2. SUMMARY KPI STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          icon={<IconUsers className="w-6 h-6 text-white" />}
          title="Total Registered Accounts"
          value={totalUsers}
          subtitle="Registered on Keshar Jewellers"
          trend="Live Database"
          trendUp={true}
          color="gold"
        />

        <StatCard
          icon={<IconShieldCheck className="w-6 h-6 text-white" />}
          title="Store Customers"
          value={totalCustomers}
          subtitle="Active shoppers &amp; buyers"
          trend="Role: User"
          trendUp={true}
          color="green"
        />

        <StatCard
          icon={<IconCrown className="w-6 h-6 text-white" />}
          title="Admin Accounts"
          value={totalAdmins}
          subtitle="Full management privileges"
          trend="Role: Admin"
          trendUp={true}
          color="maroon"
        />
      </div>

      {/* ── 3. SEARCH & ROLE FILTER BAR ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#FFF0EA]/80 border border-[#E8CFC5] text-xs w-full md:w-80 focus-within:border-[#B82E44] focus-within:bg-white transition-all shadow-xs">
          <IconSearch className="w-4 h-4 text-[#6F4A4A] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="bg-transparent border-none outline-none w-full text-xs text-[#35191C] placeholder-[#6F4A4A]/60"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-2 bg-[#FFF0EA] p-1.5 rounded-2xl border border-[#E8CFC5] w-full md:w-auto">
          <button
            onClick={() => setRoleFilter("all")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === "all"
                ? "bg-[#B82E44] text-white shadow-xs"
                : "text-[#6F4A4A] hover:text-[#35191C]"
            }`}
          >
            All Accounts ({totalUsers})
          </button>
          <button
            onClick={() => setRoleFilter("user")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === "user"
                ? "bg-[#B82E44] text-white shadow-xs"
                : "text-[#6F4A4A] hover:text-[#35191C]"
            }`}
          >
            Customers ({totalCustomers})
          </button>
          <button
            onClick={() => setRoleFilter("admin")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === "admin"
                ? "bg-[#B82E44] text-white shadow-xs"
                : "text-[#6F4A4A] hover:text-[#35191C]"
            }`}
          >
            Admins ({totalAdmins})
          </button>
        </div>
      </div>

      {/* ── 4. REGISTERED USERS LIST / DATA TABLE ── */}
      <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E8CFC5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FFF0EA] text-[#B82E44]">
              <IconFilter className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-base text-[#7C1B2A] font-bold">
              User Directory ({filteredUsers.length})
            </h3>
          </div>
          <span className="text-xs text-[#6F4A4A] font-medium">
            Showing {filteredUsers.length} of {totalUsers} registered members
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#6F4A4A] space-y-2">
            <p className="font-bold text-[#35191C]">No users found matching your search</p>
            <p className="text-xs">Try adjusting your search query or clear the filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8CFC5]/50 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF0EA]/70 text-[#7C1B2A] text-[11px] uppercase tracking-wider font-extrabold">
                  <th className="py-3.5 px-6">User Account</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Access Role</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8CFC5]/40 text-xs">
                {filteredUsers.map((user) => {
                  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";
                  const isAdmin = user.role === "admin";
                  const isActionLoading = actionLoadingId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#FFF0EA]/50 transition-colors"
                    >
                      {/* User Account & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0 ${
                              isAdmin
                                ? "bg-gradient-to-br from-[#E6C766] via-[#D4AF37] to-[#A77C18] text-[#35191C]"
                                : "bg-gradient-to-br from-[#B82E44] to-[#7C1B2A]"
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-[#35191C] flex items-center gap-1.5">
                              {user.name}
                              {isAdmin && (
                                <span className="text-[#A77C18]" title="Admin Account">
                                  <IconCrown className="w-3.5 h-3.5 inline" />
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-[#6F4A4A]">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6 font-medium text-[#35191C]">
                        {user.phone ? (
                          <span>📞 {user.phone}</span>
                        ) : (
                          <span className="text-[#6F4A4A]/60 italic">No Phone</span>
                        )}
                      </td>

                      {/* Access Role */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isAdmin
                              ? "bg-[#FFF8E7] text-[#9E7310] border border-[#F3C2AE]"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {isAdmin ? (
                            <>
                              <IconCrown className="w-3 h-3 text-[#9E7310]" />
                              Admin
                            </>
                          ) : (
                            <>
                              <IconShieldCheck className="w-3 h-3 text-emerald-600" />
                              Customer
                            </>
                          )}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-[#6F4A4A]">
                        <span className="flex items-center gap-1 text-[11px]">
                          <IconClock className="w-3.5 h-3.5 text-[#A77C18]" />
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={isActionLoading}
                            onClick={() => handleToggleRole(user.id, user.role)}
                            className="px-3 py-1.5 rounded-xl bg-[#FFF0EA] hover:bg-[#FFE2D8] border border-[#E8CFC5] text-[#7C1B2A] text-[11px] font-bold transition-all disabled:opacity-50"
                          >
                            {isAdmin ? "Make Customer" : "Make Admin"}
                          </button>

                          <button
                            disabled={isActionLoading}
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[11px] font-bold transition-all disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
