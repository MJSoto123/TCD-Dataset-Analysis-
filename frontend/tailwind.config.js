/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#bcd7ff",
          300: "#8dbbff",
          400: "#5896ff",
          500: "#2f73ff",
          600: "#1a56f5",
          700: "#1844e1",
          800: "#1b38b6",
          900: "#1c338f",
        },
      },
      boxShadow: {
        panel: "0 10px 30px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};
