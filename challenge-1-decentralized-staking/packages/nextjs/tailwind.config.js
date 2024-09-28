/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#8B5CF6", // Light neon purple
          "primary-content": "#FFFFFF", // White for contrast
          secondary: "#4C1D95", // Dark purple
          "secondary-content": "#D8B4FE", // Lighter purple for contrast
          accent: "#A78BFA", // Accent neon purple
          "accent-content": "#EDE9FE",
          neutral: "#27272A", // Black for neutral elements
          "neutral-content": "#F5F3FF",
          "base-100": "#F3F4F6", // Light grey as a base color
          "base-200": "#E5E7EB", // Slightly darker grey for depth
          "base-300": "#A78BFA", // Neon purple accent for depth
          "base-content": "#27272A", // Black content for readability
          info: "#A78BFA", // Neon purple for information elements
          success: "#34D399", // Green shade for success
          warning: "#FBBF24", // Orange shade for warning
          error: "#EF4444", // Red for errors

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#4C1D95", // Dark purple
          "primary-content": "#EDE9FE", // Light purple for contrast
          secondary: "#27272A", // Black for secondary elements
          "secondary-content": "#A78BFA", // Light neon purple for contrast
          accent: "#8B5CF6", // Neon purple
          "accent-content": "#FFFFFF",
          neutral: "#1E1E20", // Dark black for neutral elements
          "neutral-content": "#A78BFA", // Light purple for content
          "base-100": "#121212", // Black for base color in dark mode
          "base-200": "#1E1E20", // Darker black for depth
          "base-300": "#4C1D95", // Purple accent for dark theme depth
          "base-content": "#FFFFFF", // White for high contrast in dark mode
          info: "#8B5CF6",
          success: "#34D399",
          warning: "#FBBF24",
          error: "#EF4444",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      fontFamily: {
        "space-grotesk": ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
