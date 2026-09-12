# 👑 Keshar Jewellers — Standalone Enterprise Admin Panel

A dedicated, production-ready Admin Management System for **Keshar Jewellers** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **MongoDB Atlas (Mongoose)**.

---

## 🚀 Quick Start (Run on Localhost)

### 1. Open Terminal in this folder
```bash
cd "D:\Admin pannel"
```

### 2. Run the Development Server
```bash
npm run dev -- --webpack
```
*(Note: On this Windows machine, use the `--webpack` flag).*

### 3. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Architecture & Folder Structure

```
D:\Admin pannel\
├── public/                 # Static assets & logos
├── src/
│   ├── app/                # Next.js App Router (Pages & API Routes)
│   │   ├── layout.tsx      # Root layout with sidebar navigation shell
│   │   ├── globals.css     # Brand color tokens & Tailwind utilities
│   │   ├── page.tsx        # 🏠 Dashboard (Key stats, Category breakdown, Recent orders)
│   │   ├── products/       # 📦 Products (Single Add, Bulk CSV Upload, Live Catalog)
│   │   │   └── page.tsx
│   │   ├── inventory/      # 📊 Inventory (Stock management, Piece counter, Low stock alerts)
│   │   │   └── page.tsx
│   │   ├── orders/         # 🛒 Orders (Booking, Status cycling, Customer details modal)
│   │   │   └── page.tsx
│   │   ├── analytics/      # 📈 Analytics (Revenue metrics, Category performance, Funnel)
│   │   │   └── page.tsx
│   │   └── api/            # Serverless REST API Endpoints
│   │       ├── products/   # GET (all/category), POST (single/bulk), DELETE
│   │       ├── inventory/  # GET (summary), PATCH (stock update)
│   │       ├── orders/     # GET (all/status), POST (create), PATCH (status), DELETE
│   │       └── upload/     # Image upload handler
│   │
│   ├── backend/            # Modular Backend Core
│   │   ├── config/
│   │   │   └── db.ts       # Cached MongoDB Atlas connection handler
│   │   ├── models/
│   │   │   ├── Product.ts  # Mongoose Schema (11 Specs + stock + likes + timestamps)
│   │   │   └── Order.ts    # Mongoose Schema (Customer details + items + status + timestamps)
│   │   └── controllers/
│   │       ├── productController.ts # Full CRUD + Aggregations + Stock update logic
│   │       └── orderController.ts   # Order CRUD + Metrics calculation
│   │
│   ├── components/admin/   # Reusable UI Components
│   │   ├── AdminSidebar.tsx # Responsive navigation sidebar with active route highlights
│   │   ├── StatCard.tsx    # Dashboard metric cards with color variants
│   │   └── DataTable.tsx   # Reusable data table wrapper
│   │
│   └── types/              # TypeScript Data Contracts
│       └── product.ts      # Product, CategoryMeta, STORE_CATEGORIES definitions
│
├── .env.local              # Environment variables (MONGODB_URI)
├── package.json            # Dependencies & build scripts
├── tailwind.config.js      # Keshar Jewellers theme configuration
└── tsconfig.json           # TypeScript configuration with @/ path aliases
```

---

## ⚡ Key Modules & Features

### 1. 🏠 Dashboard (`/`)
- Real-time overview of **Total Products**, **Active Categories**, **Total Orders**, and **Gross Revenue**.
- Category breakdown with product counts and stock availability.
- Recent customer bookings with instant status indicators.
- Automatic **Critical Low Stock Warning banner** when items drop below 5 pieces.

### 2. 📦 Products Management (`/products`)
- **Category Filter & Full-Text Search**: Instantly find products by type, category, or description.
- **Single Product Modal**: Add items with all 11 mandatory specifications (Weight, Dimensions, Purity, Pricing, Stock, Image URLs).
- **Fast Bulk Excel/CSV Upload**: Download pre-formatted sample CSV template, parse client spreadsheets in-browser, preview records, and publish in bulk with 1 click.
- **Client Integration Links**: Quick access to connected Google Sheet and Google Drive folder (`free1himansh@gmail.com`).

### 3. 📊 Inventory Control (`/inventory`)
- Monitor available pieces across every jewellery collection.
- Color-coded stock status:
  - 🔴 **Red**: Critical (< 5 pieces)
  - 🟡 **Amber**: Low (< 20 pieces)
  - 🟢 **Green**: Healthy (20+ pieces)
- **Inline Stock Adjuster**: Increment (+), decrement (-), or type custom stock number and click "Save" to update MongoDB in real-time.

### 4. 🛒 Orders & Bookings (`/orders`)
- Book customer orders manually or receive incoming customer purchases.
- Clickable fulfillment lifecycle: `Pending` ➔ `Confirmed` ➔ `Shipped` ➔ `Delivered`.
- Order Details Modal displaying customer phone number, delivery address, notes, and ordered product items.

### 5. 📈 Analytics & Reports (`/analytics`)
- Category-wise revenue performance ranking.
- Order fulfillment funnel visualization.
- Average Order Value (AOV) and gross sales computation.
- Top performing products tracking.

---

## 🌐 Connecting to Any Store Frontend

Both the customer-facing website and this Admin Panel share the same **MongoDB Atlas database**:
```env
MONGODB_URI="mongodb+srv://..."
```

Any product added or stock updated in this Admin Panel immediately reflects live on the customer website!
