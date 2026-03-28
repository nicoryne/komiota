/**
 * Komiota Brand Colors
 * Based on the official brand guidelines
 */

export const colors = {
  // Primary brand colors
  deepAmethyst: '#402859',
  plumBuilder: '#895C9A',
  orchidPetal: '#CAB6CE',
  vanillaMilk: '#F8F4F1',
  
  // Semantic colors
  primary: '#402859', // Deep Amethyst
  secondary: '#895C9A', // Plum Builder
  accent: '#CAB6CE', // Orchid Petal
  background: '#F8F4F1', // Vanilla Milk
  
  // Text colors
  text: {
    primary: '#402859',
    secondary: '#895C9A',
    muted: '#6B7280',
  },
} as const;

// Tailwind class helpers
export const brandColors = {
  primary: 'text-deep-amethyst',
  primaryBg: 'bg-deep-amethyst',
  primaryBorder: 'border-deep-amethyst',
  
  secondary: 'text-plum-builder',
  secondaryBg: 'bg-plum-builder',
  secondaryBorder: 'border-plum-builder',
  
  accent: 'text-orchid-petal',
  accentBg: 'bg-orchid-petal',
  accentBorder: 'border-orchid-petal',
  
  background: 'bg-vanilla-milk',
} as const;
