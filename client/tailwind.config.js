/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0D0D0F',
        surface: '#141418',
        borderColor: '#1F1F27',
        accent: '#C8F135',
        textPrimary: '#F0EFE9',
        textMuted: '#6B6B7A',
        danger: '#FF4444',
        success: '#3DCC7E',
      },
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        heading: ['Syne', 'sans-serif'],
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}

