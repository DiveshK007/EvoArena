/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        evo: { 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca" },
      },
    },
  },
  plugins: [],
};
