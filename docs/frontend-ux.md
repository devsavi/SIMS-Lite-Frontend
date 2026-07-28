# SIMS Lite Frontend UX Architecture & Visual Guidelines

## 1. Overview
This document outlines the user experience architecture, design system tokens, visual hierarchy, loading/empty/error state guidelines, micro-interactions, and perceived performance standards across the SIMS Lite Frontend application.

## 2. Design System Tokens
SIMS Lite uses a modern, enterprise dark/light theme palette built with CSS custom properties and Tailwind v4 `@theme`.

- **Primary Color:** `hsl(221 83% 53%)` — High contrast indigo blue for active states, CTA buttons, and interactive focus rings.
- **Backgrounds:**
  - Light mode: Pure white `hsl(0 0% 100%)` with neutral slate cards `hsl(0 0% 98%)`.
  - Dark mode: Deep obsidian `hsl(222 47% 7%)` with dark slate cards `hsl(222 47% 10%)`.
- **Typography:** Inter sans-serif stack (`var(--font-sans)`), optimized for high legibility, clean tabular figures, and balanced line heights.

## 3. UI Micro-interactions & Transitions
1. **Page Transitions:** `.animate-fade-in` (200ms ease-out) smooth opacity transition upon route navigation.
2. **Dialog & Popover Scale:** `.animate-scale-in` (150ms cubic-bezier) subtle scale transition from 97% to 100%.
3. **Sidebar Collapse:** Smooth width transition (`transition-all duration-200 ease-in-out`) with toggle state persistence.
4. **Table Row Hover:** Elevated background contrast (`hover:bg-muted/50 transition-colors`) with keyboard row focus.

## 4. State Management Standards
- **Loading States:**
  - Full Page: `FullPageLoader` with branding & spin state.
  - Tables: `TableSkeleton` with matching column structures to eliminate layout shifts.
  - Buttons: `Button` with built-in `isLoading` spinner state and automatic double-click prevention.
- **Empty States:** `EmptyState` component with clear titles, descriptions, icon illustrations, and actionable CTAs.
- **Error Feedback:** Inline form validation, toast notifications via `useToast()`, `NetworkErrorState` for offline errors, and `PermissionDeniedPage` for 403 authorization failures.
