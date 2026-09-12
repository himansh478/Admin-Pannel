/**
 * ============================================================
 * FILE: src/backend/models/Product.ts
 * PURPOSE: Defines the shape (Schema) of a Product in MongoDB.
 * ============================================================
 *
 * BEGINNER EXPLANATION ï¿½ What is a Schema?
 * Imagine you are filling a form to add a new jewellery item.
 * The form has fixed fields: Name, Price, Category, etc.
 * A Mongoose Schema is exactly that ï¿½ a strict form definition.
 * MongoDB will REJECT any data that does not follow this form.
 *
 * BEGINNER EXPLANATION ï¿½ What is a Model?
 * The Model is the tool we use to actually talk to MongoDB.
 * Think of Schema = blueprint of a house,
 *              Model = the construction crew that builds it.
 *
 * HOW DATA IS STORED IN MONGODB:
 * Every product is stored as a "Document" (like a JSON object)
 * inside a "Collection" called "products" (like a table in Excel).
 *
 * Example of one Product Document in MongoDB:
 * {
 *   "_id": "64f3a...",          <-- Auto-generated unique ID by MongoDB
 *   "category": "rings",
 *   "productType": "Gold Ring",
 *   "sellingPrice": 5000,
 *   "mrp": 7000,
 *   "frontImage": "/images/products/ring1.jpg",
 *   "createdAt": "2026-09-07T...",
 *   "updatedAt": "2026-09-07T..."
 * }
 */

import mongoose, { Schema, Document } from "mongoose";

// ----------------------------------------------------------
// STEP 1: Define the TypeScript type for a Product
// This tells TypeScript what fields a product MUST have.
// ----------------------------------------------------------
export interface IProduct extends Document {
  category: string;      // e.g. "rings", "earrings", "bangles"
  productType: string;   // e.g. "Gold Ring", "Stud Earring"
  description: string;   // e.g. "Beautiful 22K gold ring with stone"
  material: string;      // e.g. "22K Gold" or "92.5% Silver"
  dimensionL: string;    // Length ï¿½ e.g. "20mm"
  dimensionW: string;    // Width  ï¿½ e.g. "15mm"
  dimensionH: string;    // Height ï¿½ e.g. "5mm"
  weight: string;        // e.g. "2.5 grams"
  sellingPrice: number;  // The price customer pays ï¿½ e.g. 4500
  mrp: number;           // Original MRP (shown with strikethrough) ï¿½ e.g. 6000
  frontImage: string;    // URL or path of front photo
  backImage: string;     // URL or path of back photo
  modelImage: string;    // URL or path of model wearing the jewellery
  createdAt?: Date;      // Auto-set by MongoDB when product is added
  updatedAt?: Date;      // Auto-set by MongoDB when product is edited
}

// ----------------------------------------------------------
// STEP 2: Create the Schema (the "form blueprint" for MongoDB)
// ----------------------------------------------------------
const ProductSchema = new Schema<IProduct>(
  {
    // required: true  means MongoDB will REJECT saving without this field
    category:     { type: String, required: true, index: true }, // index: true makes search faster
    productType:  { type: String, required: true },
    description:  { type: String, required: true },
    material:     { type: String, required: true },

    // Dimensions are optional (default: empty string if not provided)
    dimensionL:   { type: String, default: "" },
    dimensionW:   { type: String, default: "" },
    dimensionH:   { type: String, default: "" },

    weight:       { type: String, required: true },
    sellingPrice: { type: Number, required: true },
    mrp:          { type: Number, required: true },

    // Image paths ï¿½ optional, default to empty if not uploaded
    frontImage:   { type: String, default: "" },
    backImage:    { type: String, default: "" },
    modelImage:   { type: String, default: "" },
  },
  {
    // timestamps: true automatically adds "createdAt" and "updatedAt" fields
    timestamps: true,
  }
);

// ----------------------------------------------------------
// STEP 3: Export the Model
// We check if the model already exists (for Next.js hot-reload)
// to avoid creating it twice.
// ----------------------------------------------------------
const Product =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

