/**
 * ============================================================
 * FILE: src/backend/controllers/productController.ts
 * PURPOSE: Contains all database operations for Products.
 * ============================================================
 *
 * BEGINNER EXPLANATION - What is a Controller?
 * A Controller is where the actual database work happens.
 *
 * Think of it like a cashier at a shop:
 *   - Customer (API Route) says: "Give me all rings"
 *   - Cashier (Controller) goes to the database, fetches them,
 *     and hands them back in a clean format.
 *
 * This file has CRUD operations + inventory functions:
 *   C - CREATE  → saveProduct() / saveMultipleProducts()
 *   R - READ    → getAllProducts() / getProductsByCategory()
 *   U - UPDATE  → saveProduct() / updateProductStock()
 *   D - DELETE  → deleteProduct()
 *   SUMMARY     → getCategorySummary() / getLowStockProducts()
 */

import connectToDatabase from "@/backend/config/db";
import ProductModel from "@/backend/models/Product";
import { Product } from "@/frontend/types/product";

// ----------------------------------------------------------
// Helper: Convert a raw MongoDB document to a clean Product object
// MongoDB adds internal fields like _id and __v.
// This helper strips those out and gives us a clean Product.
// ----------------------------------------------------------
function toProduct(doc: any): Product {
  return {
    id:           doc._id.toString(), // MongoDB _id → plain string id
    category:     doc.category,
    productType:  doc.productType,
    description:  doc.description,
    material:     doc.material,
    dimensionL:   doc.dimensionL ?? "",
    dimensionW:   doc.dimensionW ?? "",
    dimensionH:   doc.dimensionH ?? "",
    weight:       doc.weight,
    sellingPrice: doc.sellingPrice,
    mrp:          doc.mrp,
    frontImage:   doc.frontImage ?? "",
    backImage:    doc.backImage ?? "",
    modelImage:   doc.modelImage ?? "",
    stock:        doc.stock ?? 0,   // Available pieces in inventory
    likes:        doc.likes ?? 0,   // Popularity counter
    createdAt:    doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
  };
}

// ----------------------------------------------------------
// READ: Get ALL products from the database (newest first)
// ----------------------------------------------------------
export async function getAllProducts(): Promise<Product[]> {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      console.warn("Database not connected. Returning empty product list.");
      return [];
    }
    const docs = await ProductModel.find({}).sort({ createdAt: -1 }).lean();
    return docs.map(toProduct);
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return [];
  }
}

// ----------------------------------------------------------
// READ: Get products filtered by category slug
// Example: getProductsByCategory("rings") → only rings
// ----------------------------------------------------------
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      console.warn("Database not connected. Returning empty product list.");
      return [];
    }
    const normalizedSlug = categorySlug.toLowerCase().trim();
    const docs = await ProductModel
      .find({ category: normalizedSlug })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(toProduct);
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    return [];
  }
}

// ----------------------------------------------------------
// CREATE / UPDATE: Save a single product
// - If product has a valid MongoDB id → UPDATE it
// - If no id → CREATE a new product
// ----------------------------------------------------------
export async function saveProduct(productData: Partial<Product>): Promise<void> {
  const conn = await connectToDatabase();
  if (!conn) {
    throw new Error("Cannot save product: Database connection is not available.");
  }

  const { id, ...data } = productData;

  if (id && id.length === 24) {
    await ProductModel.findByIdAndUpdate(id, data, { new: true });
  } else {
    await ProductModel.create(data);
  }
}

// ----------------------------------------------------------
// CREATE (BULK): Save many products at once (used for CSV upload)
// Much faster than calling saveProduct() one-by-one in a loop.
// ----------------------------------------------------------
export async function saveMultipleProducts(
  products: Partial<Product>[]
): Promise<{ count: number }> {
  const conn = await connectToDatabase();
  if (!conn) {
    throw new Error("Cannot save products: Database connection is not available.");
  }

  const cleanedDocs = products.map(({ id, ...rest }) => rest);
  const result = await ProductModel.insertMany(cleanedDocs);
  return { count: result.length };
}

// ----------------------------------------------------------
// DELETE: Remove a product permanently from the database by id
// ----------------------------------------------------------
export async function deleteProduct(id: string): Promise<boolean> {
  const conn = await connectToDatabase();
  if (!conn) {
    throw new Error("Cannot delete product: Database connection is not available.");
  }

  const deleted = await ProductModel.findByIdAndDelete(id);
  return deleted !== null;
}

// ----------------------------------------------------------
// SUMMARY: Get category-wise product count and total stock
// Used on Admin Dashboard and Analytics pages
// MongoDB aggregate groups all products by category and counts them
// ----------------------------------------------------------
export async function getCategorySummary(): Promise<{ category: string; count: number; totalStock: number }[]> {
  try {
    const conn = await connectToDatabase();
    if (!conn) return [];

    const summary = await ProductModel.aggregate([
      {
        // Group all products by their category field
        $group: {
          _id: "$category",
          count: { $sum: 1 },            // Count how many products in each category
          totalStock: { $sum: "$stock" }, // Sum all stock pieces in each category
        },
      },
      { $sort: { count: -1 } },          // Sort: category with most products first
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          totalStock: 1,
        },
      },
    ]);
    return summary;
  } catch (error) {
    console.error("Error in getCategorySummary:", error);
    return [];
  }
}

// ----------------------------------------------------------
// UPDATE: Set stock (pieces available) for a specific product
// Called from Inventory page when admin updates the stock count
// ----------------------------------------------------------
export async function updateProductStock(id: string, stock: number): Promise<boolean> {
  try {
    const conn = await connectToDatabase();
    if (!conn) return false;

    const result = await ProductModel.findByIdAndUpdate(
      id,
      { stock: Math.max(0, stock) }, // Never allow negative stock
      { new: true }
    );
    return result !== null;
  } catch (error) {
    console.error("Error in updateProductStock:", error);
    return false;
  }
}

// ----------------------------------------------------------
// READ: Get all products with stock below a threshold
// Used on Dashboard to show "Low Stock Alerts"
// Default threshold is 5 pieces
// ----------------------------------------------------------
export async function getLowStockProducts(threshold: number = 5): Promise<Product[]> {
  try {
    const conn = await connectToDatabase();
    if (!conn) return [];

    const docs = await ProductModel
      .find({ stock: { $lt: threshold } })
      .sort({ stock: 1 }) // Lowest stock first (most urgent)
      .lean();
    return docs.map(toProduct);
  } catch (error) {
    console.error("Error in getLowStockProducts:", error);
    return [];
  }
}
