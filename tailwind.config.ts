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
          DEFAULT: '#0a0a0a',
          2: '#111111',
          3: '#1c1c1e',
          4: '#2e2e30',
        },
        border: {
          DEFAULT: 'rgba(184,150,62,0.25)',
          2: 'rgba(184,150,62,0.4)',
        },
        gold: {
          DEFAULT: '#b8963e',
          hi: '#d4af6a',
          lo: '#7a6428',
          dim: 'rgba(184,150,62,0.08)',
        },
        text: {
          DEFAULT: '#f5f2ed',
          2: '#8a8478',
          3: '#6b6b6b',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
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
