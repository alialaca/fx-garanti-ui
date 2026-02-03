import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#193F78',
          50: '#F1F7FF',
          100: '#E0EDFF',
          200: '#B8D4FF',
          300: '#85B5FF',
          400: '#4D8FFF',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#193F78',
          800: '#14325F',
          900: '#0F2547'
        },
        accent: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A'
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config
