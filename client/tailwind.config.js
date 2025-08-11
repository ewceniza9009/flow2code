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
        // Dark Mode Colors (default)
        'background': '#1f2937', // Dark charcoal
        'surface': '#374151', // Slightly lighter charcoal
        'primary': '#0d9488', // Vibrant teal
        'primary-hover': '#0f766e', // Darker teal for hover
        'text-main': '#f3f4f6', // Light gray
        'text-muted': '#9ca3af', // Muted gray
        'border': '#4b5563', // Dark gray border
        
        // Light Mode Colors
        'dark-background': '#f3f4f6', // Pale gray
        'dark-surface': '#ffffff', // White
        'dark-text-main': '#1f2937', // Dark charcoal
        'dark-text-muted': '#6b7280', // Muted gray
        'dark-border': '#e5e7eb', // Light gray border
      }
    },
  },
  plugins: [],
}