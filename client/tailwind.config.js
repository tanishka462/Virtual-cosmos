/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cosmos: {
          bg: '#0a0a1a',
          surface: '#111128',
          border: '#1e1e3f',
          accent: '#7c3aed',
          glow: '#a78bfa'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Space Grotesk"', 'sans-serif']
      }
    }
  },
  plugins: []
}
