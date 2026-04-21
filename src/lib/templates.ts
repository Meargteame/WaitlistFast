export const TEMPLATES = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple, perfect for any product',
    preview: '/templates/minimal.png',
    defaultColors: {
      primary: '#18181b',
      background: '#FAFAFA',
      text: '#18181b',
      textSecondary: '#71717a',
    },
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Eye-catching with gradients and large typography',
    preview: '/templates/bold.png',
    defaultColors: {
      primary: '#6366f1',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff',
      textSecondary: '#e0e7ff',
    },
  },
  startup: {
    id: 'startup',
    name: 'Startup',
    description: 'Professional with features and social proof',
    preview: '/templates/startup.png',
    defaultColors: {
      primary: '#0ea5e9',
      background: '#ffffff',
      text: '#0f172a',
      textSecondary: '#64748b',
    },
  },
  product: {
    id: 'product',
    name: 'Product',
    description: 'Showcase your product with images and details',
    preview: '/templates/product.png',
    defaultColors: {
      primary: '#f59e0b',
      background: '#fffbeb',
      text: '#78350f',
      textSecondary: '#92400e',
    },
  },
  comingSoon: {
    id: 'comingSoon',
    name: 'Coming Soon',
    description: 'Build hype with countdown and teaser content',
    preview: '/templates/coming-soon.png',
    defaultColors: {
      primary: '#ec4899',
      background: '#18181b',
      text: '#ffffff',
      textSecondary: '#d4d4d8',
    },
  },
} as const;

export const FONT_PAIRS = [
  { id: 'inter', name: 'Inter', heading: 'Inter', body: 'Inter' },
  { id: 'outfit', name: 'Outfit + Inter', heading: 'Outfit', body: 'Inter' },
  { id: 'space', name: 'Space Grotesk', heading: 'Space Grotesk', body: 'Space Grotesk' },
  { id: 'playfair', name: 'Playfair + Source Sans', heading: 'Playfair Display', body: 'Source Sans Pro' },
  { id: 'montserrat', name: 'Montserrat', heading: 'Montserrat', body: 'Montserrat' },
  { id: 'poppins', name: 'Poppins', heading: 'Poppins', body: 'Poppins' },
  { id: 'raleway', name: 'Raleway + Lato', heading: 'Raleway', body: 'Lato' },
  { id: 'dm-sans', name: 'DM Sans', heading: 'DM Sans', body: 'DM Sans' },
] as const;

export type TemplateId = keyof typeof TEMPLATES;
export type FontPairId = typeof FONT_PAIRS[number]['id'];
