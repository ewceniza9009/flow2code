/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
      }
    },
  },
  plugins: [],
}