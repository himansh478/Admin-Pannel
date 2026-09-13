/**
 * ============================================================
 * FILE: src/components/admin/GoldRateWidget.tsx
 * PURPOSE: Interactive Live Gold & Silver Market Rate Banner for Keshar Jewellers.
 * ============================================================
 */

"use client";

import React, { useState } from "react";
import { IconSparkles, IconRefreshCw, IconShieldCheck } from "./Icons";

export default function GoldRateWidget() {
  const [gold24k, setGold24k] = useState(7480);
  const [gold22k, setGold22k] = useState(6860);
  const [silver925, setSilver925] = useState(92);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Today, 10:30 AM");

  const handleUpdate = () => {
    setLastUpdated("Just now");
    setIsEditing(false);
  };

  return (
    <div className="luxury-card bg-gradient-to-r from-[#35191C] via-[#4A0E17] to-[#7C1B2A] text-[#FFF8F0] rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative background glow & pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#B82E44]/30 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Header Title & Hallmark Badge */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#E6C766] border border-[#D4AF37]/30">
              <IconSparkles className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E6C766]">
              Live Bullion Market
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Rates Active
            </span>
          </div>
          <h2 className="font-serif text-xl md:text-2xl text-white font-bold tracking-tight">
            Today&apos;s Store Gold &amp; Silver Benchmark
          </h2>
          <p className="text-xs text-[#E8CFC5] flex items-center gap-2">
            <IconShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Used for daily tag pricing &amp; customer billing estimation.</span>
          </p>
        </div>

        {/* Rates Display Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
          {/* Gold 24K */}
          <div className="bg-black/25 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl p-3.5 min-w-[140px] text-center hover:border-[#D4AF37] transition-all">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E6C766] block">
              Gold 24K (Pure)
            </span>
            {isEditing ? (
              <input
                type="number"
                value={gold24k}
                onChange={(e) => setGold24k(Number(e.target.value))}
                className="w-20 mx-auto mt-1 px-2 py-0.5 text-center bg-black/50 text-white rounded text-sm font-bold border border-[#D4AF37]"
              />
            ) : (
              <span className="font-serif text-xl font-bold text-white block mt-0.5">
                ₹{gold24k.toLocaleString("en-IN")}<span className="text-[10px] font-normal text-[#E8CFC5]">/g</span>
              </span>
            )}
            <span className="text-[9px] text-[#E8CFC5]">99.9% Purity Standard</span>
          </div>

          {/* Gold 22K */}
          <div className="bg-black/25 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl p-3.5 min-w-[140px] text-center hover:border-[#D4AF37] transition-all">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E6C766] block">
              Gold 22K (Hallmarked)
            </span>
            {isEditing ? (
              <input
                type="number"
                value={gold22k}
                onChange={(e) => setGold22k(Number(e.target.value))}
                className="w-20 mx-auto mt-1 px-2 py-0.5 text-center bg-black/50 text-white rounded text-sm font-bold border border-[#D4AF37]"
              />
            ) : (
              <span className="font-serif text-xl font-bold text-white block mt-0.5">
                ₹{gold22k.toLocaleString("en-IN")}<span className="text-[10px] font-normal text-[#E8CFC5]">/g</span>
              </span>
            )}
            <span className="text-[9px] text-[#E8CFC5]">BIS 916 Standard</span>
          </div>

          {/* Silver 92.5% */}
          <div className="bg-black/25 backdrop-blur-md border border-[#E8CFC5]/30 rounded-xl p-3.5 min-w-[140px] text-center hover:border-[#E8CFC5] transition-all">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              Silver 92.5% (Sterling)
            </span>
            {isEditing ? (
              <input
                type="number"
                value={silver925}
                onChange={(e) => setSilver925(Number(e.target.value))}
                className="w-20 mx-auto mt-1 px-2 py-0.5 text-center bg-black/50 text-white rounded text-sm font-bold border border-[#E8CFC5]"
              />
            ) : (
              <span className="font-serif text-xl font-bold text-white block mt-0.5">
                ₹{silver925}<span className="text-[10px] font-normal text-[#E8CFC5]">/g</span>
              </span>
            )}
            <span className="text-[9px] text-[#E8CFC5]">Pure Silver Rate</span>
          </div>
        </div>

        {/* Control Button */}
        <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
          {isEditing ? (
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E6C766] text-[#35191C] text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              Save Rates
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <IconRefreshCw className="w-3.5 h-3.5 text-[#E6C766]" />
              <span>Update Rate</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#E8CFC5]">
        <span>Last updated: {lastUpdated}</span>
        <span>Store Reference Currency: INR (₹)</span>
      </div>
    </div>
  );
}
