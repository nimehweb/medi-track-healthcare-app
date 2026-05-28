/**
 * Clinical Sanctuary Design System Tokens
 * 
 * This module provides type-safe access to design system tokens defined in
 * tailwind.config.ts and app/globals.css
 */

export const DESIGN_COLORS = {
  // Primary
  primary: 'oklch(0.205 0 0)', // Carbon Gray #2e2e2e
  
  // Neutral
  background: 'oklch(1 0 0)', // Sanctuary Background #ffffff
  foreground: 'oklch(0.145 0 0)', // Charcoal Text #212121
  secondary: 'oklch(0.97 0 0)', // Alabaster Surface #f5f5f5
  border: 'oklch(0.922 0 0)', // Clinical Border #ebebeb
  ring: 'oklch(0.702 0 0)', // #b3b3b3
  muted: 'oklch(0.54 0 0)', // Medium Gray #8a8a8a
  
  // Status
  destructive: 'oklch(0.577 0.245 27.325)', // Destructive Red #ba1a1a
  success: 'oklch(0.75 0.12 142)', // Green (normal status)
  warning: 'oklch(0.65 0.15 60)', // Yellow (pending)
} as const;

export const TYPOGRAPHY_STYLES = {
  display: 'text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.15]',
  headline: 'text-[1.875rem] font-semibold leading-[1.25]',
  title: 'text-[1.25rem] font-semibold leading-[1.3]',
  body: 'text-[1rem] font-normal leading-[1.5] max-w-prose',
  label: 'text-[0.875rem] font-medium leading-[1.4]',
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const;

export const BORDER_RADIUS = {
  sm: '6px', // Buttons, inputs
  md: '10px', // Cards
  lg: '14px', // Larger containers
} as const;

export const SHADOWS = {
  'interactive-rise': '0 4px 12px oklch(0 0 0 / 0.04)',
  'popover-focus': '0 10px 30px oklch(0 0 0 / 0.08)',
  sm: '0 1px 2px 0 oklch(0 0 0 / 0.05)',
  base: '0 2px 4px 0 oklch(0 0 0 / 0.08)',
} as const;

/**
 * Design System Rules (from DESIGN.md)
 */
export const DESIGN_RULES = {
  'The Rarity Rule': 'Bold red and destructive statuses must be used on less than 5% of any screen.',
  'The No-Color-Reflex Rule': 'Avoid default blue and teal highlights for active elements. Keep the interface monochromatic.',
  'The 65ch Doctrine': 'Paragraph and text container content must never extend past 65 characters in line length.',
  'The Flat Resting Rule': 'Surfaces rest entirely flat on the Sanctuary Background canvas. Depth is conveyed through alabaster background blocks or clean clinical border divisions.',
} as const;
