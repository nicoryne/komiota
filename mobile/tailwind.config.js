/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#402859', // Deep Amethyst
        secondary: '#895C9A', // Plum Builder
        tertiary: '#CAB6CE', // Orchid Petal
        background: {
          DEFAULT: '#F8F4F1', // Vanilla Milk
          dark: '#1A1622', // Midnight Plum
        },
        surface: {
          DEFAULT: '#F8F4F1', // Reuse background for light
          dark: '#2A2435', // Twilight Surface
        },
        text: {
          DEFAULT: '#402859', // Deep Amethyst for primary text
          muted: '#895C9A', // Plum Builder for muted (darker)
          dark: '#F8F4F1', // Vanilla Milk for dark mode primary
          darkMuted: '#CAB6CE', // Orchid Petal for dark mode muted
        },
        status: {
          success: '#4ADE80',
          warning: '#FBBF24',
          error: '#F87171',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Quicksand', 'sans-serif'],
      },
      borderRadius: {
        card: "24px",
        "card-lg": "32px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
