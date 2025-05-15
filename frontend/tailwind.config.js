/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  future: {
    hoverOnlyWhenSupported: true,
  },
  safelist: [
    // Add common utility classes that might be used in your app
    "p-6", "px-6", "py-6", "pt-6", "pr-6", "pb-6", "pl-6",
    "m-6", "mx-6", "my-6", "mt-6", "mr-6", "mb-6", "ml-6",
    "dark:from-[#1e3a8a]", "dark:to-[#581c87]"
  ],
  theme: {
    extend: {
      spacing: {
        // Explicitly define spacing for padding and margin classes
        '0': '0px',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem',
      },
      colors: {
        primary: {
          purple: "#CF86FF",
          blue: "#AED2FF",
          lightPurple: "#EDD3FF",
          mediumBlue: "#61A3F5",
          darkPurple: "#9400FF",
          lightBlue: "#89BCFF",
        },
        gradient: {
          start: "#CF86FF",
          end: "#61A3F5",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "chat-gradient": "linear-gradient(to right, #CF86FF, #61A3F5)",
        "gradient-soft":
          "linear-gradient(135deg, #EDD3FF 0%, #AED2FF 50%, rgba(174, 210, 255, 0.2) 100%)",
        "gradient-bubble": "linear-gradient(135deg, #CF86FF 0%, #61A3F5 100%)",
      },
      animation: {
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bubble: "bubble 0.5s ease-out forwards",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05)",
          },
        },
        bubble: {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0.7",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },
      boxShadow: {
        button: "0 4px 14px 0 rgba(207, 134, 255, 0.25)",
      },
    },
  },
  plugins: [],
};