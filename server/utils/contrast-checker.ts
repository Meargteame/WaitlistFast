/**
 * Contrast Checker Utility
 * 
 * Calculates WCAG contrast ratios and validates accessibility compliance.
 * Requirements: 3.6
 */

import { getRelativeLuminance, isValidHexColor } from './color-validator';

/**
 * Result of a contrast check
 */
export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
}

/**
 * Calculates the contrast ratio between two colors
 * 
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 * where L1 is the lighter color's luminance and L2 is the darker
 * 
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio (1-21)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  if (!isValidHexColor(color1) || !isValidHexColor(color2)) {
    throw new Error('Both colors must be valid hex colors');
  }

  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if two colors meet WCAG contrast requirements
 * 
 * WCAG 2.1 Requirements:
 * - AA Normal Text: 4.5:1
 * - AA Large Text: 3:1
 * - AAA Normal Text: 7:1
 * - AAA Large Text: 4.5:1
 * 
 * @param foreground - Foreground (text) color
 * @param background - Background color
 * @returns Contrast check result with pass/fail for each level
 */
export function checkContrast(foreground: string, background: string): ContrastResult {
  const ratio = calculateContrastRatio(foreground, background);

  return {
    ratio: Math.round(ratio * 100) / 100, // Round to 2 decimal places
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
    passesAALarge: ratio >= 3,
    passesAAALarge: ratio >= 4.5,
  };
}

/**
 * Validates that a color scheme meets WCAG AA standards
 * 
 * @param textColor - Text color
 * @param backgroundColor - Background color
 * @returns True if meets WCAG AA for normal text
 */
export function meetsWCAGAA(textColor: string, backgroundColor: string): boolean {
  const result = checkContrast(textColor, backgroundColor);
  return result.passesAA;
}

/**
 * Suggests an adjusted color to meet contrast requirements
 * 
 * @param foreground - Foreground color
 * @param background - Background color
 * @param targetRatio - Target contrast ratio (default: 4.5 for AA)
 * @returns Adjusted foreground color that meets the target ratio
 */
export function adjustColorForContrast(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string {
  const currentRatio = calculateContrastRatio(foreground, background);
  
  if (currentRatio >= targetRatio) {
    return foreground; // Already meets requirements
  }

  const bgLuminance = getRelativeLuminance(background);
  
  // Determine if we should lighten or darken the foreground
  // If background is dark, lighten foreground; if light, darken foreground
  const shouldLighten = bgLuminance < 0.5;

  // Simple adjustment: move toward white or black
  if (shouldLighten) {
    return '#FFFFFF'; // Use white for dark backgrounds
  } else {
    return '#000000'; // Use black for light backgrounds
  }
}

/**
 * Gets a human-readable description of the contrast level
 * 
 * @param ratio - Contrast ratio
 * @returns Description of the contrast level
 */
export function getContrastDescription(ratio: number): string {
  if (ratio >= 7) {
    return 'Excellent (AAA)';
  } else if (ratio >= 4.5) {
    return 'Good (AA)';
  } else if (ratio >= 3) {
    return 'Fair (AA Large Text)';
  } else {
    return 'Poor (Fails WCAG)';
  }
}
