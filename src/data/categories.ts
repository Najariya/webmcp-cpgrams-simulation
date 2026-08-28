/**
 * CPGRAMS-style grievance categories for Silpi Gram (simulation).
 * Routing + SLAs per docs/01-PRODUCT.md §3 (Swachhata-informed: local works on hours).
 */
export interface Category {
  id: string;
  titleEn: string;
  titleHi: string;
  icon: string;
  authority: string;
  slaHours: number;
  requiresPhoto: boolean;
}

export const CATEGORIES: Category[] = [
  { id: "road_damage", titleEn: "Village road damaged / pothole", titleHi: "सड़क टूटी हुई / गड्ढा", icon: "🛣️", authority: "GP → Block PWD", slaHours: 7 * 24, requiresPhoto: true },
  { id: "streetlight", titleEn: "Streetlight out", titleHi: "स्ट्रीटलाइट बंद", icon: "💡", authority: "GP → Electricity Board", slaHours: 3 * 24, requiresPhoto: true },
  { id: "garbage", titleEn: "Garbage / waste not collected", titleHi: "कचरा नहीं उठाया गया", icon: "🗑️", authority: "GP Swachh Bharat team", slaHours: 48, requiresPhoto: true },
  { id: "water_supply", titleEn: "Drinking water: hand pump / tap fault", titleHi: "पेयजल: हैंडपंप / नल खराब", icon: "🚰", authority: "GP → PHED (Jal Jeevan)", slaHours: 72, requiresPhoto: false },
  { id: "drainage", titleEn: "Drainage block / waterlogging", titleHi: "नाला जाम / जलभराव", icon: "🌊", authority: "GP", slaHours: 4 * 24, requiresPhoto: true },
  { id: "stray_cattle", titleEn: "Stray cattle on village road", titleHi: "सड़क पर आवारा पशु", icon: "🐄", authority: "GP → Animal Husbandry", slaHours: 5 * 24, requiresPhoto: false },
  { id: "public_space", titleEn: "Pond / public space unclean", titleHi: "तालाब / सार्वजनिक स्थान अस्वच्छ", icon: "🪷", authority: "GP", slaHours: 5 * 24, requiresPhoto: true },
  { id: "anganwadi_school", titleEn: "Anganwadi / school infrastructure", titleHi: "आंगनबाड़ी / विद्यालय भवन", icon: "🏫", authority: "GP → Block Education", slaHours: 10 * 24, requiresPhoto: true },
];

/** Approximate centre of the Silpi Gram area (Chunar block, Mirzapur district, UP). */
export const VILLAGE_CENTER: [number, number] = [25.1, 82.88];

export const MOHALLAS = ["पूर्वी मोहल्ला · East", "पश्चिमी मोहल्ला · West", "बाज़ार मोहल्ला · Bazaar", "स्कूल मोहल्ला · School"] as const;
