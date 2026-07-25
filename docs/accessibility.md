# SIMS Lite — Accessibility

## Standards Target

SIMS Lite targets **WCAG 2.1 Level AA** compliance. All shared components are built with accessibility as a first-class concern.

> **Note:** Full WCAG compliance requires manual testing with assistive technologies (screen readers, keyboard-only navigation, etc.) and expert review. This document describes the technical implementation; functional testing is outside the automated test suite.

## Keyboard Navigation

All interactive components support full keyboard navigation:

| Component | Keyboard Support |
|---|---|
| Buttons | `Enter`, `Space` to activate |
| Links | `Enter` to follow |
| Dialogs | `Esc` to close; focus trapped inside |
| Select / Combobox | Arrow keys to navigate; `Enter` to select |
| DataTable | Tab through cells; `Space` for row selection checkboxes |
| Pagination | Tab through buttons; `Enter`/`Space` to activate |
| Filter Panel (Sheet) | `Esc` to close |
| Date Pickers | Arrow keys for date navigation |
| Dropdowns | Arrow keys + `Enter` |

## Focus Management

```css
/* globals.css — visible focus ring */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-ring);
}
```

All interactive elements have a clearly visible 2px primary-colour focus ring.

## ARIA Attributes

### DataTable
- `<table aria-label="...">` for screen reader identification
- `<th aria-sort="ascending|descending|none">` on sortable columns
- Sort buttons are `<button type="button">` (not anchor tags)
- Checkboxes have `aria-label="Select row"` / `"Select all rows"`

### Dialogs
- `<DialogTitle>` and `<DialogDescription>` per Radix Dialog spec
- Focus trapped inside open dialogs
- `Esc` closes all dialogs

### Status Badges
- Colour-coding is never the only visual indicator
- Text label always accompanies the colour

### Loading States
- `<div role="status" aria-label="Loading…">` for screen reader announcements
- `aria-busy="true"` on skeleton containers

### Error States
- `<div role="alert">` for error announcements
- Error messages are visible text, not just colour

### Pagination
- `aria-label="Pagination"` on the nav container
- `aria-live="polite"` on page info text for dynamic announcements
- Navigation buttons have descriptive `aria-label` values

### Forms
- All fields use `<label>` associated with inputs via `htmlFor` / `id`
- `aria-invalid="true"` set on fields with errors
- `aria-describedby` links error messages to their inputs

### Breadcrumb
- `<nav aria-label="Breadcrumb">` wrapper
- `<ol>` for ordered trail
- `aria-current="page"` on the last item

## Colour Contrast

All text/background pairs in the design token system are verified to meet 4.5:1 ratio for normal text and 3:1 for large text at WCAG AA level.

| Pair | Ratio (Light) |
|---|---|
| `foreground` on `background` | ≥ 7:1 |
| `primary-foreground` on `primary` | ≥ 4.5:1 |
| `muted-foreground` on `background` | ≥ 4.5:1 |
| `destructive-foreground` on `destructive` | ≥ 4.5:1 |

## Dark Mode

All semantic tokens have dark-mode counterparts. Components do not use hardcoded colours. The system respects the OS preference via `next-themes`.

## Screen Reader Testing

Recommended tools:
- **Windows**: NVDA + Chrome, JAWS + Chrome
- **macOS**: VoiceOver + Safari
- **Mobile**: iOS VoiceOver, Android TalkBack

## Automated Testing

The test suite includes basic accessibility assertions:
- Correct `role` attributes
- `aria-label` presence on icon buttons
- Live region behaviour for loading/error states
- Focus-trapping in dialogs (via Radix UI's built-in behaviour)

Run with: `npm run test`
