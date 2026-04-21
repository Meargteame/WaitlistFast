// Generate a full color palette from a primary color
export function generatePalette(primaryColor: string) {
  // This is a simplified version - in production, use a library like chroma.js
  return {
    primary: primaryColor,
    primaryLight: lighten(primaryColor, 20),
    primaryDark: darken(primaryColor, 20),
    background: '#FAFAFA',
    backgroundDark: '#F4F4F5',
    text: '#18181b',
    textSecondary: '#71717a',
    border: '#e4e4e7',
  };
}

function lighten(color: string, percent: number): string {
  // Simple lighten - in production use proper color manipulation
  return color;
}

function darken(color: string, percent: number): string {
  // Simple darken - in production use proper color manipulation
  return color;
}

export const PRESET_COLORS = [
  { name: 'Zinc', value: '#18181b' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
];

export const GRADIENT_PRESETS = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
  { name: 'Fire', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Night', value: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)' },
  { name: 'Aurora', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
];
