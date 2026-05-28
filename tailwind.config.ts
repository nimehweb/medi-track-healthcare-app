import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Clinical Sanctuary Design System
        background: 'oklch(1 0 0)', // Sanctuary Background - #ffffff
        foreground: 'oklch(0.145 0 0)', // Charcoal Text - #212121
        
        primary: {
          DEFAULT: 'oklch(0.205 0 0)', // Carbon Gray - #2e2e2e
          foreground: 'oklch(0.98 0 0)', // Primary text on Carbon Gray
        },
        secondary: {
          DEFAULT: 'oklch(0.97 0 0)', // Alabaster Surface - #f5f5f5
          foreground: 'oklch(0.205 0 0)', // Carbon Gray text on Alabaster
        },
        destructive: {
          DEFAULT: 'oklch(0.577 0.245 27.325)', // Destructive Red - #ba1a1a
          foreground: 'oklch(0.98 0 0)',
        },
        muted: {
          DEFAULT: 'oklch(0.97 0 0)', // Alabaster Surface
          foreground: 'oklch(0.54 0 0)', // Medium gray - #8a8a8a
        },
        border: 'oklch(0.922 0 0)', // Clinical Border - #ebebeb
        input: 'oklch(0.922 0 0)', // Clinical Border
        ring: 'oklch(0.702 0 0)', // #b3b3b3
        card: 'oklch(1 0 0)', // Sanctuary Background
        'card-foreground': 'oklch(0.145 0 0)',
        popover: 'oklch(1 0 0)',
        'popover-foreground': 'oklch(0.145 0 0)',
        accent: 'oklch(0.205 0 0)', // Use primary for accent in this system
        'accent-foreground': 'oklch(0.98 0 0)',
      },
      fontFamily: {
        sans: ['Geist', 'Geist Fallback', 'sans-serif'],
        mono: ['Geist Mono', 'Geist Mono Fallback', 'monospace'],
      },
      fontSize: {
        // Display: Used for main marketing headers, empty states, and welcome greetings
        display: ['clamp(2.25rem, 5vw, 3.5rem)', { lineHeight: '1.15', fontWeight: '700' }],
        // Headline: Used for top-level screen headers and major workspace titles
        headline: ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        // Title: Used for card titles, section headers, and modal actions
        title: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        // Body: Used for descriptions, lab notes, and clinical summaries
        body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        // Label: Used for tabular stats, buttons, input labels, and precise numeric metrics
        label: ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        xs: '4px',  // 0.25rem
        sm: '8px',  // 0.5rem
        md: '16px', // 1rem
        lg: '24px', // 1.5rem
        xl: '32px', // 2rem
      },
      borderRadius: {
        sm: '6px',  // For buttons, inputs
        md: '10px', // For cards
        lg: '14px', // For larger containers
      },
      boxShadow: {
        // Interactive Rise: Used for button active states and draggable elements
        'interactive-rise': '0 4px 12px oklch(0 0 0 / 0.04)',
        // Popover Focus: Used for dropdowns, autocompletes, and diagnostic overlays
        'popover-focus': '0 10px 30px oklch(0 0 0 / 0.08)',
        // Additional shadows for component states
        sm: '0 1px 2px 0 oklch(0 0 0 / 0.05)',
        base: '0 2px 4px 0 oklch(0 0 0 / 0.08)',
      },
      maxWidth: {
        'prose': '65ch', // 65 character line length for body text
      },
    },
  },
  plugins: [],
};

export default config;
