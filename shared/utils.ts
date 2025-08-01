/**
 * Convert a product name to a standardized slug format
 * Used for consistent product key generation across frontend and backend
 * 
 * @param name - The product name to convert
 * @returns A URL-friendly slug (lowercase with hyphens)
 * 
 * @example
 * generateProductSlug("Tinted Face Powder") // "tinted-face-powder"
 * generateProductSlug("Lip & Cheek Stick") // "lip-cheek-stick"
 * generateProductSlug("The Best Mascara!!!") // "the-best-mascara"
 */
export function generateProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens and spaces
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '')  // Remove leading/trailing hyphens
    .trim();
}

/**
 * Convert a slug back to a display name format
 * Used when displaying product names from slugs
 * 
 * @param slug - The product slug to convert
 * @returns A properly capitalized display name
 * 
 * @example
 * slugToDisplayName("tinted-face-powder") // "Tinted Face Powder"
 * slugToDisplayName("lip-cheek-stick") // "Lip Cheek Stick"
 */
export function slugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
} 