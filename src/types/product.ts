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

// ✅ SYNCED WITH STOREFRONT — All 28 categories must match exactly
// so products added here appear in the correct storefront slider/card.
export const STORE_CATEGORIES: CategoryMeta[] = [
  { slug: "necklaces",              name: "Necklaces",                                  hallmarkText: "✦ BIS 91.6 & 92.5 HALLMARK CERTIFIED ✦" },
  { slug: "necklace-sets",          name: "Necklace Sets",                              hallmarkText: "✦ BIS 91.6 & 92.5 HALLMARK CERTIFIED ✦" },
  { slug: "earrings",               name: "Earrings",                                   hallmarkText: "✦ BIS 91.6 & 92.5 STERLING HALLMARK CERTIFIED ✦" },
  { slug: "bangles",                name: "Bangles",                                    hallmarkText: "✦ BIS 91.6 GOLD & 92.5 SILVER CERTIFIED ✦" },
  { slug: "bracelets",              name: "Bracelets",                                  hallmarkText: "✦ BIS 91.6 & 92.5 HALLMARK CERTIFIED ✦" },
  { slug: "rings",                  name: "Rings",                                      hallmarkText: "✦ BIS 91.6 GOLD & 92.5 SILVER CERTIFIED ✦" },
  { slug: "mangalsutra",            name: "Mangalsutra",                                hallmarkText: "✦ 22K 916 HALLMARKED GOLD & 925 SILVER ✦" },
  { slug: "chains",                 name: "Chains",                                     hallmarkText: "✦ 22K GOLD & 92.5 STERLING SILVER ✦" },
  { slug: "pendants",               name: "Pendants",                                   hallmarkText: "✦ BIS 91.6 & 92.5 HALLMARK CERTIFIED ✦" },
  { slug: "nose-pins",              name: "Nose Pins",                                  hallmarkText: "✦ BIS 91.6 & 92.5 HALLMARK CERTIFIED ✦" },
  { slug: "maang-tikka",            name: "Maang Tikka",                                hallmarkText: "✦ BIS 91.6 & 92.5 HALLMARK CERTIFIED ✦" },
  { slug: "anklets",                name: "Anklets",                                    hallmarkText: "✦ BIS 92.5 STERLING HALLMARK CERTIFIED ✦" },
  { slug: "toe-rings",              name: "Toe Rings",                                  hallmarkText: "✦ PURE 92.5 STERLING SILVER ✦" },
  { slug: "kada",                   name: "Kada",                                       hallmarkText: "✦ 22K GOLD & 92.5 STERLING SILVER ✦" },
  { slug: "waist-jewellery",        name: "Waist Jewellery",                            hallmarkText: "✦ TRADITIONAL HANDCRAFTED 925 SILVER ✦" },
  { slug: "bajuband-armlets",       name: "Bajuband / Armlets",                         hallmarkText: "✦ ROYAL TRADITIONAL JEWELLERY ✦" },
  { slug: "hair-jewellery",         name: "Hair Jewellery",                             hallmarkText: "✦ BRIDAL HANDCRAFTED JEWELLERY ✦" },
  { slug: "nath",                   name: "Nath",                                       hallmarkText: "✦ BRIDAL 22K GOLD & 925 SILVER NATH ✦" },
  { slug: "bridal-jewellery-sets",  name: "Bridal Jewellery Sets",                      hallmarkText: "✦ EXQUISITE BRIDAL JEWELLERY SETS ✦" },
  { slug: "evil-eye",               name: "Evil Eye",                                   hallmarkText: "✦ 92.5 STERLING SILVER PROTECTIVE JEWELLERY ✦" },
  { slug: "kids",                   name: "Kids/Baby",                                  hallmarkText: "✦ SKIN SAFE 92.5 PURE SILVER ✦" },
  { slug: "pens",                   name: "Pens",                                       hallmarkText: "✦ 92.5 STERLING SILVER LUXURY GIFTS ✦" },
  { slug: "utensils",               name: "Utensils",                                   hallmarkText: "✦ 999 PURE SILVER UTENSILS & ARTIFACTS ✦" },
  { slug: "artifacts",              name: "Artifacts & Idols",                          hallmarkText: "✦ 999 PURE SILVER ARTIFACTS & IDOLS ✦" },
  { slug: "coins-bars",             name: "Coins & Bars",                               hallmarkText: "✦ 24K 999 PURE GOLD & 999 SILVER COINS ✦" },
  { slug: "pooja-articles",         name: "Pooja Articles",                             hallmarkText: "✦ AUTHENTIC SACRED SILVER ARTICLES ✦" },
  { slug: "festival-collection",    name: "Festival Collection",                        hallmarkText: "✦ AUSPICIOUS FESTIVE 91.6 GOLD & 92.5 SILVER ✦" },
  { slug: "customized-jewellery",   name: "Customized Jewellery (Customer On Demand)",  hallmarkText: "✦ BESPOKE HANDCRAFTED 91.6 GOLD & 92.5 SILVER ✦" },
];
