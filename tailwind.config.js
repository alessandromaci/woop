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
        mobile: "380px",
        tablet: "640px",
      },
    },
  },
  plugins: [],
};
