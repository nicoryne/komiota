/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4627b6",
          light: "#5a3bcf",
          dark: "#361d8f",
        },
        background: {
          DEFAULT: "#f4f0fc",
          dark: "#171520",
        },
        surface: {
          DEFAULT: "#FCFAFF",
          dark: "#232036",
        },
        text: {
          DEFAULT: "#1C1A22",
          muted: "#8E8A9A",
          dark: "#FAFAFA",
          "dark-muted": "#6B6780",
        },
        status: {
          success: "#4ADE80",
          warning: "#FBBF24",
          error: "#F87171",
        },
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
