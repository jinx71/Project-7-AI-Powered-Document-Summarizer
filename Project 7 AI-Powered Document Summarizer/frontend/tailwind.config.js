/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0e1c2a',
          900: '#14283c',
          800: '#1b4f72',
          600: '#2e86c1',
          400: '#7fb3d5',
        },
        paper: '#f7f5f0',
        seal: '#b03a2e',
      },
      fontFamily: {
        display: ['"Archivo"', 'system-ui', 'sans-serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
