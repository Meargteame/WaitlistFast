/**
 * Slug Generator Utility
 * 
 * Generates URL-safe slugs from product names.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 18.1
 */

/**
 * Generates a URL-safe slug from a product name
 * 
 * Rules:
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters (keeps only a-z, 0-9, hyphens)
 * - Removes leading/trailing hyphens
 * - Ensures length is between 3 and 50 characters
 * - Handles unicode and emoji characters
 * 
 * @param productName - The product name to convert to a slug
 * @returns A valid URL slug
 */
export function generateSlug(productName: string): string {
  if (!productName || productName.trim().length === 0) {
    throw new Error('Product name cannot be empty');
  }

  let slug = productName
    // Convert to lowercase
    .toLowerCase()
    // Normalize unicode characters (e.g., café → cafe)
    .normalize('NFD')
    // Remove diacritics/accents
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');

  // Ensure minimum length of 3 characters
  if (slug.length < 3) {
    // If too short, pad with random characters
    slug = slug + '-' + Math.random().toString(36).substring(2, 5);
  }

  // Ensure maximum length of 50 characters
  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-+$/, '');
  }

  // Final check: if still empty or invalid, generate a random slug
  if (!slug || slug.length < 3) {
    slug = 'waitlist-' + Math.random().toString(36).substring(2, 9);
  }

  return slug;
}

/**
 * Validates if a string is a valid slug format
 * 
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Check length constraints
  if (slug.length < 3 || slug.length > 50) {
    return false;
  }

  // Check format: only lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return false;
  }

  // Check that it doesn't start or end with hyphen
  if (/^-|-$/.test(slug)) {
    return false;
  }

  return true;
}

/**
 * Generates a unique slug by appending a numeric suffix if needed
 * 
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Ensure we don't exceed max length
    if (slug.length > 50) {
      // Truncate base slug to make room for suffix
      const suffixLength = counter.toString().length + 1; // +1 for hyphen
      const maxBaseLength = 50 - suffixLength;
      const truncatedBase = baseSlug.substring(0, maxBaseLength).replace(/-+$/, '');
      slug = `${truncatedBase}-${counter}`;
    }
  }

  return slug;
}
