export interface Product {
  id: string;
  category: string;       // e.g. "nose-pins", "earrings", "rings", etc.
  productType: string;    // e.g. "noz pin", "stud earring", "hoop"
  description: string;    // e.g. "silver Black+AD STONE pic 20"
  material: string;       // e.g. "92.50 % silver"
  dimensionL: string;     // e.g. "8mm"
  dimensionW: string;     // e.g. "8mm"
  dimensionH: string;     // e.g. "7mm"
  weight: string;         // e.g. "0.640mg"
  sellingPrice: number;   // e.g. 540
  mrp: number;            // e.g. 756
  frontImage: string;     // path or URL
  backImage: string;      // path or URL
  modelImage: string;     // path or URL
  stock?: number;         // available pieces in inventory (0 = out of stock)
  likes?: number;         // popularity counter
  createdAt?: string;
}

export interface CategoryMeta {
  slug: string;
  name: string;
  hallmarkText?: string;
}

export const STORE_CATEGORIES: CategoryMeta[] = [
  { slug: "anklets", name: "Anklets", hallmarkText: "✦ BIS 92.5 STERLING HALLMARK CERTIFIED ✦" },
  { slug: "bracelets", name: "Bracelets", hallmarkText: "✦ BIS 91.6 & 92.5 HALLMARK CERTIFIED ✦" },
  { slug: "rings", name: "Rings", hallmarkText: "✦ BIS 91.6 GOLD & 92.5 SILVER CERTIFIED ✦" },
  { slug: "toe-rings", name: "Toe Rings", hallmarkText: "✦ PURE 92.5 STERLING SILVER ✦" },
  { slug: "earrings", name: "Earrings", hallmarkText: "✦ BIS 91.6 & 92.5 STERLING HALLMARK CERTIFIED ✦" },
  { slug: "necklaces-pendants", name: "Necklaces & Pendants", hallmarkText: "✦ BIS 91.6 & 92.5 HALLMARK CERTIFIED ✦" },
  { slug: "mangalsutras", name: "Mangalsutra", hallmarkText: "✦ 22K 916 HALLMARKED GOLD & 925 SILVER ✦" },
  { slug: "chains", name: "Chain", hallmarkText: "✦ 22K GOLD & 92.5 STERLING SILVER ✦" },
  { slug: "nose-pins", name: "Nose Pins", hallmarkText: "✦ BIS 91.6 & 92.5 HALLMARK CERTIFIED ✦" },
  { slug: "evil-eye", name: "Evil Eye", hallmarkText: "✦ 92.5 STERLING SILVER PROTECTIVE JEWELLERY ✦" },
  { slug: "kids", name: "Kids/Baby", hallmarkText: "✦ SKIN SAFE 92.5 PURE SILVER ✦" },
  { slug: "pens", name: "Pens", hallmarkText: "✦ 92.5 STERLING SILVER LUXURY GIFTS ✦" },
  { slug: "personalised-jewellery", name: "Personalised Jewellery", hallmarkText: "✦ CUSTOM HANDCRAFTED 925 SILVER & GOLD ✦" },
  { slug: "religious-gift-items", name: "Religious & Gift Items", hallmarkText: "✦ 999 PURE SILVER & BRONZE ARTIFACTS ✦" }
];
