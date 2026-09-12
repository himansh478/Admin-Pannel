import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import AdminSidebar from "@/components/admin/AdminSidebar";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Admin Portal | Keshar Jewellers Management",
  description: "Enterprise Admin Panel for Keshar Jewellers — Inventory, Products, Orders, and Analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${lato.variable} antialiased min-h-screen bg-[#FFF8F0] text-[#35191C]`}
      >
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block shrink-0">
            <AdminSidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Navigation Bar */}
            <header className="bg-[#FFFDFC] border-b border-[#E8CFC5] px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <span className="text-[#B82E44] font-serif text-xl font-bold">
                  Keshar Jewellers
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF0EA] text-[#7C1B2A] border border-[#E8CFC5]">
                  Control Center
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live Database Connected
                </span>
                <a
                  href="https://kesharjewellers.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-[#480C14] hover:bg-[#7C1B2A] text-[#FFF8F0] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>↗</span>
                  <span className="hidden md:inline">Open Website</span>
                </a>
              </div>
            </header>

            {/* Page Body */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
