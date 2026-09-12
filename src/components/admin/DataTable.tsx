/**
 * ============================================================
 * FILE: src/frontend/components/admin/DataTable.tsx
 * PURPOSE: Reusable sortable/filterable table for admin pages.
 * ============================================================
 *
 * BEGINNER EXPLANATION:
 * This component renders a beautiful table with rows and columns.
 * It is reused across Products, Orders, and Inventory pages.
 *
 * Props:
 *   - columns: Array of column definitions (header name + key)
 *   - data: Array of row objects
 *   - renderRow: A function that returns the JSX for each row
 *   - emptyMessage: What to show when there are no rows
 */

"use client";

import { ReactNode } from "react";

// ----------------------------------------------------------
// Column definition: each column has a header label and a key
// ----------------------------------------------------------
export interface TableColumn {
  header: string;       // Display name (e.g. "Category")
  key: string;          // Unique key for the column
  align?: "left" | "center" | "right";  // Text alignment
  width?: string;       // Optional width (e.g. "120px")
}

// ----------------------------------------------------------
// Component Props
// ----------------------------------------------------------
interface DataTableProps<T> {
  columns: TableColumn[];
  data: T[];
  renderRow: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;  // Optional top-right action buttons
}

export default function DataTable<T>({
  columns,
  data,
  renderRow,
  emptyMessage = "No data found.",
  title,
  subtitle,
  actions,
}: DataTableProps<T>) {
  return (
    <div className="bg-[#FFFDFC] border border-[#E8CFC5] rounded-2xl shadow-sm overflow-hidden">
      {/* ── Table Header (Title + Actions) ── */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-[#E8CFC5]">
          <div>
            {title && (
              <h3 className="font-serif text-xl text-[#9B1B30]">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#6F4A4A] mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* ── Empty State ── */}
      {data.length === 0 ? (
        <div className="text-center py-16 text-[#6F4A4A]">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm font-medium">{emptyMessage}</p>
        </div>
      ) : (
        /* ── Table Body ── */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Column Headers */}
            <thead>
              <tr className="bg-[#7C1B2A] text-[#E6C766]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`p-3 border-b border-[#E8CFC5]/20 font-bold uppercase tracking-wider text-[11px] ${
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left"
                    }`}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Data Rows */}
            <tbody className="divide-y divide-[#E8CFC5]/50 bg-white">
              {data.map((item, index) => renderRow(item, index))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
