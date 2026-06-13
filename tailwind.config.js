/** @type {import('tailwindcss').Config} */

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        brand: {
          pink: {
            DEFAULT: '#6236FF',
            50: 'rgba(98, 54, 255, 0.05)',
            100: 'rgba(98, 54, 255, 0.10)',
            200: 'rgba(98, 54, 255, 0.20)',
            300: 'rgba(98, 54, 255, 0.30)',
            400: 'rgba(98, 54, 255, 0.50)',
            500: '#6236FF',
            600: '#5028E6',
            700: '#3F1FCC',
          },
          blue: {
            DEFAULT: '#6236FF',
            50: 'rgba(98, 54, 255, 0.05)',
            100: 'rgba(98, 54, 255, 0.10)',
            200: 'rgba(98, 54, 255, 0.20)',
            300: 'rgba(98, 54, 255, 0.30)',
            400: 'rgba(98, 54, 255, 0.50)',
            500: '#6236FF',
            600: '#5028E6',
            700: '#3F1FCC',
          },
          indigo: {
            DEFAULT: '#6236FF',
            50: 'rgba(98, 54, 255, 0.05)',
            100: 'rgba(98, 54, 255, 0.10)',
            200: 'rgba(98, 54, 255, 0.20)',
            500: '#6236FF',
          },
          surface: {
            DEFAULT: 'var(--finapp-body-bg, #EDEDF5)',
            card: 'var(--finapp-content-bg, #ffffff)',
            dark: 'var(--app-text-primary, #27173E)',
            muted: 'var(--app-text-muted, rgb(149, 141, 158))',
          },
        },
      },
      boxShadow: {
        'glass-base': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-highlight':
          'inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.05)',
        'glass-inner': 'inset 0 2px 10px 0 rgba(255, 255, 255, 0.2)',
        'glass-elevated':
          '0 8px 32px 0 rgba(31, 38, 135, 0.07), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'glass-gradient':
          'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.15) 100%)',
        'glass-gradient-brand':
          'linear-gradient(135deg, rgba(219, 44, 245, 0.08) 0%, rgba(78, 135, 255, 0.12) 50%, rgba(74, 37, 225, 0.06) 100%)',
        'frosted-mesh':
          'radial-gradient(ellipse at 20% 0%, rgba(78, 135, 255, 0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(219, 44, 245, 0.14) 0%, transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(74, 37, 225, 0.10) 0%, transparent 55%)',
      },
      backdropBlur: {
        glass: '20px',
        'glass-heavy': '40px',
      },
    },
  },
  plugins: [],
}
