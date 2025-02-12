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
      fontFamily: {
        'roboto': ['var(--font-roboto)'],
        'jockey': ['var(--font-jockey-one)'],
      },
      colors: {
        // Rugby theme colors
        'rugby-red': 'rgb(225, 60, 50)',
        'rugby-yellow': 'rgb(255, 205, 0)',
        'rugby-teal': 'rgb(0, 85, 75)',
        'rugby-black': 'rgb(0, 0, 0)',
        'rugby-gray-4': 'rgb(195, 195, 195)',
        'rugby-gray-1': 'rgb(220, 220, 220)',
        // System colors
        'primary': 'rgb(0, 85, 75)', // rugby-teal as primary
        'secondary': 'rgb(225, 60, 50)', // rugby-red as secondary
        'accent': 'rgb(255, 205, 0)', // rugby-yellow as accent
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
