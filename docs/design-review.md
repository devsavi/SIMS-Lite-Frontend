# SIMS Lite Frontend Phase 11 Design Review & Architecture Diagrams

## 1. Overview
This document summarizes the Phase 11 UX audit, theme parity verification, internationalization architecture, and visual quality review.

---

## 2. System Architecture Diagrams

### A. Navigation Flow Diagram

```mermaid
flowchart TD
    Start[User Visit] --> AuthCheck{Authenticated?}
    AuthCheck -- No --> Login[Login Page / (auth)]
    AuthCheck -- Yes --> RoleGuard{Check Role & Permissions}
    
    RoleGuard -- Unauthorized --> PermDenied[403 Permission Denied]
    RoleGuard -- Authorized --> Layout[Dashboard Layout]

    Layout --> Dash[Dashboard /dashboard]
    Layout --> MasterData[Master Data Module]
    Layout --> Procurement[Procurement Module]
    Layout --> Inventory[Inventory & Stock Release]
    Layout --> Notifications[Notification Center]
    Layout --> Reports[Reports & Analytics]
    Layout --> Admin[Administration Module]

    MasterData --> Products[Products Page]
    MasterData --> Categories[Categories Page]
    MasterData --> Brands[Brands Page]
    MasterData --> Suppliers[Suppliers Page]

    Procurement --> POs[Purchase Orders]
    Procurement --> GRNs[Goods Received Notes]

    Admin --> AdminUsers[User Management]
    Admin --> Company[Company Profile]
    Admin --> Settings[System Settings]
    Admin --> Email[Email Config]
    Admin --> Audit[Audit & Activity Logs]
```

---

### B. Component & Page Hierarchy

```mermaid
graph TD
    AppLayout[Root App Layout] --> ThemeProvider[Theme Provider next-themes]
    ThemeProvider --> QueryProvider[React Query & Auth Store]
    QueryProvider --> RouteProgress[Route Transition Progress]
    QueryProvider --> Toaster[Toaster Component]
    
    QueryProvider --> DashLayout[Dashboard Layout Component]
    
    DashLayout --> Header[AppHeader]
    DashLayout --> Sidebar[AppSidebar Nav]
    DashLayout --> MainContent[Main Content Area]

    Header --> Breadcrumbs[Dynamic Breadcrumbs]
    Header --> ThemeToggle[Theme Toggle Menu]
    Header --> NotifBell[Notification Bell Component]
    Header --> UserMenu[User Avatar & Menu]

    MainContent --> PageContainer[Page Container Component]
    PageContainer --> PageHeader[Page Header & Page Actions]
    PageContainer --> DataView{Data State?}

    DataView -- Loading --> Skeletons[TableSkeleton / CardSkeleton]
    DataView -- Error --> ErrorStateComp[ErrorState / NetworkErrorState]
    DataView -- Empty --> EmptyStateComp[EmptyState Preset]
    DataView -- Success --> DataTableComp[DataTable Component]
```

---

### C. User Interaction & State Feedback Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant View as Page View
    participant Store as State / React Query
    participant API as Backend API
    participant UI as UI Feedback (Toast / Modal)

    User->>View: Interacts with Form / Action (e.g. Submit GRN)
    View->>View: Trigger Button Loading (isLoading = true)
    View->>Store: Invoke Mutation Function
    Store->>API: Execute HTTP Request
    
    alt Success Response
        API-->>Store: Return 200 / 201 Response Data
        Store-->>View: Invalidate Query & Update Local State
        View->>UI: Trigger Success Toast ("GRN Submitted Successfully")
        View->>View: Reset Form / Close Modal & Reset Button Loading
    else Error Response
        API-->>Store: Return 4xx / 5xx Error Response
        Store-->>View: Throw ApiError Exception
        View->>UI: Display Inline Validation Error / Error Toast
        View->>View: Reset Button Loading (isLoading = false)
    end
```

---

## 3. Phase 11 Audit Summary
- **UX Consistency:** All 9 core modules share uniform spacing, breadcrumb structures, table layouts, and card styling.
- **Accessibility:** Tested for WCAG 2.1 AA compliance including ARIA attributes, semantic landmarks, and keyboard focus states.
- **Theme Parity:** Verified contrast and parity across both Light and Dark themes.
- **Internationalization:** Prepared central dictionary (`src/lib/i18n/dict.ts`) and formatting utilities (`src/utils/format.ts`).
