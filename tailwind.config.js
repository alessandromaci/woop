/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        base: ["Work Sans", "ui-sans-serif", "system-ui"],
      },
      screens: {
        sm: "380px",
        md: "450px",
        lg: "1024px",
        xl: "1280px",
      },
    },
  },
  plugins: [],
};
