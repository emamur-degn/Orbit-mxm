import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#09090f',
          900: '#0e0f17',
          850: '#13141f',
          800: '#181a28',
          700: '#222538',
        },
        orbit: {
          500: '#7c3aed',
          600: '#6d28d9',
          400: '#a78bfa',
        },
      },
    },
  },
  plugins: [],
};
export default config;
