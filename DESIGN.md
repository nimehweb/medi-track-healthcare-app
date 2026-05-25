---
name: "MediTrack Design System"
description: "A calm, trustworthy, and highly accessible design system balancing patient reassurance and lab workflow speed."
colors:
  background: "#ffffff"
  foreground: "#212121"
  primary: "#2e2e2e"
  primary-foreground: "#fafafa"
  secondary: "#f5f5f5"
  secondary-foreground: "#2e2e2e"
  muted: "#f5f5f5"
  muted-foreground: "#8a8a8a"
  destructive: "#ba1a1a"
  border: "#ebebeb"
  input: "#ebebeb"
  ring: "#b3b3b3"
typography:
  display:
    fontFamily: "Geist, 'Geist Fallback', sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.15
  headline:
    fontFamily: "Geist, 'Geist Fallback', sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "Geist, 'Geist Fallback', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Geist, 'Geist Fallback', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Mono, 'Geist Mono Fallback', monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "oklch(0.3 0 0)"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-secondary-hover:
    backgroundColor: "oklch(0.9 0 0)"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "4px 12px"
---

# Design System: MediTrack Design System

## 1. Overview

**Creative North Star: "The Clinical Sanctuary"**

The Clinical Sanctuary is an interface design strategy formulated specifically for multi-register healthcare portals. It represents the meeting point of deep clinical accuracy and absolute patient composure. By prioritizing serene whitespace, clear semantic layouts, and highly readable high-contrast typographic grids, the system offers an anchor of safety for stressed patients while ensuring a friction-free, high-speed environment for clinical laboratory workers. 

This design system deliberately rejects the chaotic sensory overload of contemporary tech dashboards, opting instead for a quiet, structured environment. Visual density is calculated and deliberate—dense and grid-aligned where lab operators need data, but spacious and descriptive where patients look for reassurance.

**Key Characteristics:**
- **Calm Atmosphere**: Generous whitespace and low-stimulus transitions reduce cognitive friction.
- **Extreme Contrast & Legibility**: High typographic scales and dark carbon text elements on pristine background layers ensure effortless readability.
- **Symmetric Balance**: A strict grid layout keeps dashboard data structured, uncrowded, and highly reassuring.

## 2. Colors

A highly restrained and intentional OKLCH palette optimized for absolute contrast, pristine clarity, and long-session visual safety.

### Primary
- **Carbon Gray** (#2e2e2e / oklch(0.205 0 0)): Used for major text headings, primary buttons, and essential structural borders. It represents absolute stability and clinical authority.

### Neutral
- **Sanctuary Background** (#ffffff / oklch(1 0 0)): The pristine, clean ground layer of the patient and lab interfaces.
- **Charcoal Text** (#212121 / oklch(0.145 0 0)): The primary body text color, offering excellent contrast and ease of parsing.
- **Alabaster Surface** (#f5f5f5 / oklch(0.97 0 0)): Used for secondary backgrounds, passive muted states, and low-contrast surface divisions.
- **Clinical Border** (#ebebeb / oklch(0.922 0 0)): A delicate, highly-structured border color that separates key interface grids without creating visual noise.

### Named Rules
**The Rarity Rule.** Bold red and destructive statuses must be used on less than 5% of any screen. If everything screams, nothing is heard. High-contrast indicators are reserved solely for true clinical alerts or required user corrections.
**The No-Color-Reflex Rule.** Avoid default blue and teal highlights for active elements. Keep the interface monochromatic (carbon, gray, and pristine alabaster) so status colors (green for normal, red for alert, yellow for pending) remain completely distinct.

## 3. Typography

**Display Font:** Geist (with 'Geist Fallback', sans-serif)
**Body Font:** Geist (with 'Geist Fallback', sans-serif)
**Label/Mono Font:** Geist Mono (with 'Geist Mono Fallback', monospace)

**Character:** The typography utilizes the clean, high-legibility sans-serif typeface Geist to deliver an atmosphere of clinical precision and modern calmness, complemented by Geist Mono for tabular data, ranges, and test metrics.

### Hierarchy
- **Display** (700, clamp(2.25rem, 5vw, 3.5rem), 1.15): Used for main marketing headers, empty states, and welcome greetings.
- **Headline** (600, 1.875rem, 1.25): Used for top-level screen headers and major workspace titles.
- **Title** (600, 1.25rem, 1.3): Used for card titles, section headers, and modal actions.
- **Body** (400, 1rem, 1.5): Used for descriptions, lab notes, and clinical summaries. Maximum line length is capped at 65ch to reduce eye strain.
- **Label** (500, 0.875rem, 1.4): Used for tabular stats, buttons, input labels, and precise numeric metrics.

### Named Rules
**The 65ch Doctrine.** To maximize readability, paragraph and text container content must never extend past 65 characters in line length.

## 4. Elevation

The system is flat-by-default, utilizing crisp layout lines and subtle tonal shifts rather than heavy artificial drop shadows to denote hierarchy. This creates a clean, digital ledger look that aligns with clinical environments.

### Shadow Vocabulary
- **Interactive Rise** (`box-shadow: 0 4px 12px oklch(0 0 0 / 0.04)`): Used solely to give feedback during button active states or when hovering over draggable medical cards.
- **Popover Focus** (`box-shadow: 0 10px 30px oklch(0 0 0 / 0.08)`): Used on absolute-positioned elements like dropdown menus, search autocompletes, and diagnostic overlays.

### Named Rules
**The Flat Resting Rule.** Surfaces rest entirely flat on the Sanctuary Background canvas. Depth is conveyed purely through alabaster background blocks or clean clinical border divisions.

## 5. Components

Every UI element is crafted with clean lines, functional border strokes, and extremely subtle transitions.

### Buttons
- **Shape:** Softly curved corners (6px radius).
- **Primary:** Carbon background, pristine text, default inline-flex with horizontal padding (16px) and vertical height (36px).
- **Hover / Focus:** Transitions smoothly via background shift (`oklch(0.3 0 0)`) with a crisp, 3px ring focus overlay.
- **Secondary:** Alabaster background, Carbon text, same vertical height and border-radius.

### Cards / Containers
- **Corner Style:** Medium curved corners (10px radius).
- **Background:** Sanctuary Background white or Alabaster Surface light gray.
- **Border:** Clean, subtle border stroke (1px clinical border).
- **Internal Padding:** Generous spacing (24px padding on all sides) to prevent information overcrowding.

### Inputs / Fields
- **Style:** Clean border outline (1px clinical border), alabaster background, soft border-radius (6px).
- **Focus:** Sharp border shift with active ring focus shadow.
- **Error:** Destructive red text and matching border outline (`oklch(0.577 0.245 27.325)`).

### Navigation
- **Style:** Flat top-bar layout. Alabaster surface or deep primary accent bar.
- **Active state:** Denoted using sharp, solid carbon background shapes or clear, high-contrast label changes. No colored side underlines.

## 6. Do's and Don'ts

### Do:
- **Do** wrap tabular medical reports in clean, grid-aligned cards with a minimum of 24px of internal padding to ensure high readability.
- **Do** use Geist Mono for all test result metrics, normal ranges, and reference values.
- **Do** use whitespace as a functional layout tool, ensuring at least 32px of spacing between major dashboard sections.

### Don't:
- **Don't** use border-left or border-right greater than 1px as a colored side-stripe accent on status cards or alert notifications.
- **Don't** combine background-clip: text with gradient fills to create decorative headers.
- **Don't** use heavy glassmorphic blurs or decorative transparent overlays on medical report screens.
- **Don't** design identical multi-column card grids with repetitious icons for diverse clinical operations.
- **Don't** use modals as a first-choice interaction for editing records; prefer inline forms or dedicated routes.
- **Don't** use em-dashes (`--` or `—`) in medical labels or instruction copy; use colons, semicolons, or commas instead.
