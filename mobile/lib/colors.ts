/**
 * Komiota Design Tokens — Single source of truth for all color values.
 * Mirrors tailwind.config.js. Use these for inline `style={}` props
 * where NativeWind classes aren't available (tab bar, icons, etc.).
 */
export const colors = {
  primary: {
    DEFAULT: '#4627b6',
    light: '#5a3bcf',
    dark: '#361d8f',
  },
  background: {
    DEFAULT: '#f4f0fc',
    dark: '#171520',
  },
  surface: {
    DEFAULT: '#FCFAFF',
    dark: '#232036',
  },
  text: {
    DEFAULT: '#1C1A22',
    muted: '#8E8A9A',
    dark: '#FAFAFA',
    darkMuted: '#6B6780',
  },
  status: {
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
  },
} as const;
