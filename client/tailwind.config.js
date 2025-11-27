/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", 
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-manrope)", "monospace"],
        serif: ["var(--font-manrope)", "serif"],
      },
      colors: {
        background: {
          light: "#ffffff",
          dark: "#1f2937", // Tailwind gray-800
        },
        foreground: {
          light: "#111827",
          dark: "#f3f4f6", // Tailwind gray-100
        },
      },
    },
  },
  plugins: [],
};
