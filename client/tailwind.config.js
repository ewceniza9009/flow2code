/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'background': '#111111',
        'surface': '#1c1c1c',
        'primary': '#4f46e5',
        'primary-hover': '#4338ca',
        'text-main': '#e5e7eb',
        'text-muted': '#9ca3af',
        'border': '#374151',
        'dark-background': '#ffffff',
        'dark-surface': '#f3f4f6',
        'dark-text-main': '#1f2937',
        'dark-text-muted': '#6b7280',
        'dark-border': '#e5e7eb',
      }
    },
  },
  plugins: [],
}