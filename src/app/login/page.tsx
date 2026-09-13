/**
 * ============================================================
 * FILE: src/app/login/page.tsx (Standalone Luxury Admin Login Portal)
 * PURPOSE: Admin Login & Register Form Screen with Auth Guard Integration
 * ============================================================
 */

"use client";

import { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  IconCrown,
  IconSparkles,
  IconShieldCheck,
  IconPlus,
} from "@/components/admin/Icons";

export default function AdminLoginPage() {
  const { login, registerAdmin, isLoggedIn, logout, admin } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<"login" | "create">("login");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register admin form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState<"admin" | "manager" | "superadmin">("admin");

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const res = await login(loginEmail, loginPassword);
    if (!res.success) {
      setErrorMessage(res.error || "Invalid email or password");
    }
    setSubmitting(false);
  };

  // Submit Register Admin
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setErrorMessage("Name, email and password are required.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const res = await registerAdmin({
      name: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      role: "admin",
    });

    if (res.success) {
      setSuccessMessage(`Admin account "${regName}" created successfully! 👑 You can now log in.`);
      // Clear form
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegPhone("");
      setActiveTab("login");
      setLoginEmail(regEmail);
    } else {
      setErrorMessage(res.error || "Failed to create admin account.");
    }
    setSubmitting(false);
  };

  // If already logged in, show status banner & option to return to dashboard
  if (isLoggedIn && admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C1417] via-[#35191C] to-[#4A0E17] flex items-center justify-center p-4">
        <div className="bg-[#FFFDFC] border border-[#D4AF37]/40 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E6C766] to-[#D4AF37] text-[#35191C] mx-auto flex items-center justify-center text-2xl font-bold shadow-lg">
            👑
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A77C18]">
              Active Session Detected
            </span>
            <h2 className="font-serif text-2xl text-[#7C1B2A] font-extrabold mt-1">
              Logged in as {admin.name}
            </h2>
            <p className="text-xs text-[#6F4A4A] mt-1">{admin.email} • Role: {admin.role.toUpperCase()}</p>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="/"
              className="w-full py-3 bg-gradient-to-r from-[#B82E44] to-[#7C1B2A] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:brightness-110 flex items-center justify-center gap-2"
            >
              <IconSparkles className="w-4 h-4 text-[#E6C766]" />
              <span>Go to Admin Dashboard</span>
            </a>

            <button
              onClick={logout}
              className="w-full py-3 bg-[#FFF0EA] hover:bg-[#FFE2D8] border border-[#E8CFC5] text-[#7C1B2A] text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F0D10] via-[#35191C] to-[#4A0E17] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#B82E44] selection:text-white">
      {/* Background Decorative Gold Ornaments */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-[#B82E44]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Container */}
      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Auth Card */}
        <div className="bg-[#FFFDFC] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Tab Switcher */}
          <div className="flex items-center bg-[#FFF0EA] p-1.5 rounded-2xl border border-[#E8CFC5] mb-6">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorMessage("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all uppercase tracking-wider ${
                activeTab === "login"
                  ? "bg-gradient-to-r from-[#B82E44] to-[#7C1B2A] text-white shadow-md"
                  : "text-[#6F4A4A] hover:text-[#35191C]"
              }`}
            >
              Admin Login
            </button>
            <button
              onClick={() => {
                setActiveTab("create");
                setErrorMessage("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all uppercase tracking-wider ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-[#B82E44] to-[#7C1B2A] text-white shadow-md"
                  : "text-[#6F4A4A] hover:text-[#35191C]"
              }`}
            >
              + Create New Admin
            </button>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2.5 animate-shake">
              <span className="text-base leading-none">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5">
              <span className="text-base leading-none">✅</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F4A4A] mb-1.5">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="himanshu@kesharjewellers.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#FFF0EA]/70 border border-[#E8CFC5] text-xs text-[#35191C] placeholder-[#6F4A4A]/50 focus:outline-none focus:border-[#B82E44] focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F4A4A]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-[#B82E44] font-bold hover:underline"
                  >
                    {showPassword ? "Hide Password" : "Show Password"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#FFF0EA]/70 border border-[#E8CFC5] text-xs text-[#35191C] placeholder-[#6F4A4A]/50 focus:outline-none focus:border-[#B82E44] focus:bg-white transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#E6C766] via-[#D4AF37] to-[#C79C1E] hover:from-[#FFF3C4] hover:to-[#E6C766] text-[#35191C] text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-[#D4AF37]/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                <IconShieldCheck className="w-4 h-4 text-[#35191C]" />
                <span>{submitting ? "Authenticating..." : "Login to Control Center"}</span>
              </button>
            </form>
          )}

          {/* TAB 2: CREATE NEW ADMIN FORM */}
          {activeTab === "create" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F4A4A] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ramesh Soni"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFF0EA]/70 border border-[#E8CFC5] text-xs text-[#35191C] placeholder-[#6F4A4A]/50 focus:outline-none focus:border-[#B82E44] focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F4A4A] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ramesh@kesharjewellers.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFF0EA]/70 border border-[#E8CFC5] text-xs text-[#35191C] placeholder-[#6F4A4A]/50 focus:outline-none focus:border-[#B82E44] focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F4A4A] mb-1">
                  Password (min 6 chars) *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFF0EA]/70 border border-[#E8CFC5] text-xs text-[#35191C] placeholder-[#6F4A4A]/50 focus:outline-none focus:border-[#B82E44] focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F4A4A] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFF0EA]/70 border border-[#E8CFC5] text-xs text-[#35191C] placeholder-[#6F4A4A]/50 focus:outline-none focus:border-[#B82E44] focus:bg-white transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-[#B82E44] to-[#7C1B2A] hover:brightness-110 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                <IconPlus className="w-4 h-4 text-[#E6C766]" />
                <span>{submitting ? "Registering..." : "Create Admin Account"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
