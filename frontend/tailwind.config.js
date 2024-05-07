/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          blue: "#659FDF",
          orange: "#f19e38",
          "dark-orange": "#dd7832",
          "dark-blue": "#252f3d",
          "gray-dark": "#1d201f",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        "amazon-ember": ["AmazonEmber", "sans-serif"],
      },
    },
  },
  plugins: [],
};
