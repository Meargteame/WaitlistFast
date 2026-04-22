/**
 * Color Validation Utility
 * 
 * Validates hex color codes and ensures they meet format requirements.
 * Requirements: 3.2, 16.1
 */

/**
 * Validates if a string is a valid hex color code
 * 
 * Valid formats:
 * - #RRGGBB (6 hex digits)
 * - Case insensitive (accepts both uppercase and lowercase)
 * 
 * @param color - The color string to validate
 * @returns True if valid hex color, false otherwise
 */
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') {
    return false;
  }

  // Check format: # followed by exactly 6 hex digits
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexColorRegex.test(color);
}

/**
 * Normalizes a hex color to uppercase format
 * 
 * @param color - The hex color to normalize
 * @returns Normalized hex color in uppercase
 */
export function normalizeHexColor(color: string): string {
  if (!isValidHexColor(color)) {
    throw new Error(`Invalid hex color: ${color}`);
  }

  return color.toUpperCase();
}

/**
 * Converts hex color to RGB values
 * 
 * @param hex - The hex color code
 * @returns RGB values as { r, g, b }
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (!isValidHexColor(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
  if (!result) {
    throw new Error(`Failed to parse hex color: ${hex}`);
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Converts RGB values to hex color
 * 
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color code
 */
export function rgbToHex(r: number, g: number, b: number): string {
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new Error('RGB values must be between 0 and 255');
  }

  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calculates the relative luminance of a color
 * Used for contrast ratio calculations
 * 
 * @param hex - The hex color code
 * @returns Relative luminance value (0-1)
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);

  // Convert to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  // Apply gamma correction
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
