# SIMS Lite Frontend Responsive Design Audit & Breakpoint Strategy

## 1. Breakpoint Hierarchy
SIMS Lite is designed mobile-first and scales fluidly across 5 standard viewport ranges:

| Breakpoint | Viewport Width | Typical Devices | Navigation Layout | Grid Columns |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile** | `< 640px` | Phones (Portrait) | Mobile Drawer Overlay | Single Column (`grid-cols-1`) |
| **Tablet** | `640px - 768px` | Tablets / Large Phones | Mobile Drawer Overlay | 2 Columns (`grid-cols-2`) |
| **Laptop** | `768px - 1024px` | Small Laptops / Tablets | Collapsible Sidebar (64px) | 2 to 3 Columns |
| **Desktop** | `1024px - 1440px` | Laptops / Desktop Monitors | Expanded Sidebar (256px) | 3 to 4 Columns |
| **Ultra-wide**| `> 1440px` | 4K / Ultrawide Monitors | Expanded Sidebar | Max-width Containers |

## 2. Responsive Component Behaviors
1. **DataTable Usability:**
   - Wraps tables in horizontal overflow containers (`overflow-auto`) with sticky headers and scroll indicators.
   - Column visibility toggle allows hiding low-priority columns on smaller viewports.
2. **Form Layouts:**
   - Form grids collapse to single-column on mobile viewports and expand to 2-column or 3-column layouts on desktop.
3. **Touch Targets:**
   - Interactive buttons and links enforce a minimum touch target area of 44x44px on mobile devices.
