/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
      extend: {
        boxShadow: {
          soft: "0 10px 30px rgba(0,0,0,.10)",
          glow: "0 0 0 4px rgba(99,102,241,.18)",
        },
        keyframes: {
          pop: {
            "0%": { transform: "scale(.96)", opacity: "0" },
            "100%": { transform: "scale(1)", opacity: "1" },
          },
        },
        animation: {
          pop: "pop .14s ease-out",
        },
      },
    },
    plugins: [],
  };