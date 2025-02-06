import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-blue': '#1a56db',
        'secondary-navy': '#000033',
        'accent-blue': '#1E90FF',
        'gray-light': '#F5F5F5',
        'gray-medium': '#666666',
        'gray-dark': '#333333',
        'card-bg': {
          light: '#F8F9FA',
          dark: '#1A1A1A',
        },
        'content': {
          light: '#171717',
          dark: '#E5E5E5',
        },
        'content-medium': {
          light: '#666666',
          dark: '#A3A3A3',
        },
        'content-light': {
          light: '#737373',
          dark: '#8F8F8F',
        },
        'bg': {
          light: '#FFFFFF',
          dark: '#0A0A0A',
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
