import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#080807',
          2: '#0e0e0c',
          3: '#161614',
          4: '#1c1c19',
        },
        border: {
          DEFAULT: '#252520',
          2: '#2e2e28',
        },
        gold: {
          DEFAULT: '#c9a84c',
          hi: '#e2c76a',
          lo: '#7a641e',
          dim: 'rgba(201,168,76,0.08)',
        },
        text: {
          DEFAULT: '#f0ebe0',
          2: '#8a8478',
          3: '#4a4840',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'DM Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '9999px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
