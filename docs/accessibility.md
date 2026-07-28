# SIMS Lite Frontend Accessibility (a11y) & WCAG 2.1 AA Compliance Guide

## 1. Executive Summary
SIMS Lite is engineered to meet WCAG 2.1 Level AA accessibility guidelines. All core components support screen readers, keyboard navigation, high contrast themes, and ARIA semantic structures.

## 2. ARIA & Semantic HTML Standards
- **Landmarks:** Every layout includes `<header role="banner">`, `<nav aria-label="...">`, `<main role="main">`, and `<aside aria-label="...">`.
- **Live Regions:** Dynamic status changes use `role="status"` (`aria-live="polite"`) for loading/empty states and `role="alert"` (`aria-live="assertive"`) for error messages and toasts.
- **Form Controls:** Form inputs are connected with `<FormLabel>` via `aria-labelledby`, `<FormDescription>` via `aria-describedby`, and validation errors via `aria-invalid`.

## 3. Keyboard Navigation Shortcuts & Behavior
- **Tab Order:** Logical left-to-right, top-to-bottom tab order across header actions, navigation sidebar, main form fields, and table rows.
- **Focus Visibility:** Custom double-ring focus styling (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`).
- **Table Navigation:** Focusable table rows (`tabIndex={0}`) with `Space` key toggle for row selection.
- **Dialogs & Dropdowns:** Focus trap within active modal dialogs with `Escape` key close.

## 4. Color Contrast Compliance
- All body text maintains a contrast ratio of at least 4.5:1 against card and page backgrounds in both Light and Dark themes.
- Large text (headings) and active UI borders maintain a minimum contrast ratio of 3:1.
