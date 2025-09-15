import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        waterloo: {
          gold: '#FFD54F',
          blue: '#003D82',
          red: '#C8102E',
        },
        chat: {
          dark: '#1a1a1a',
          darker: '#0f0f0f',
          gray: '#2a2a2a',
          light: '#3a3a3a',
          text: '#ffffff',
          muted: '#9ca3af',
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
export default config
