# Stock Release Workflow & Lifecycle Architecture

This document describes the state machine, inventory deduction flow, and user interaction model for the **Stock Release Management** module in SIMS Lite.

---

## 1. Stock Release Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft : Create Stock Release
    Draft --> Draft : Edit Draft (Creator / Officer / Admin)
    Draft --> Submitted : Submit for Approval (Storekeeper / Officer / Admin)
    Draft --> Cancelled : Cancel Release Request
    Submitted --> Approved : Approve Release (Admin / Warehouse Manager)
    Submitted --> Cancelled : Reject / Cancel (Manager / Admin)
    Approved --> [*] : Final State (Stock Deducted)
    Cancelled --> [*] : Final State (Terminated)
```

---

## 2. Inventory Deduction Flow

When a Manager approves a Stock Release (`PATCH /api/v1/stock-releases/:id/approve`), the system updates live stock levels and invalidates client-side caches.

```mermaid
sequenceDiagram
    autonumber
    actor User as Store Manager / Admin
    participant UI as StockReleaseDetailPage
    participant Hook as useApproveStockRelease
    participant API as Backend Stock Release API
    participant Cache as TanStack Query Cache

    User->>UI: Click "Approve & Deduct Stock"
    UI->>Hook: trigger mutateAsync(id)
    Hook->>API: PATCH /api/v1/stock-releases/:id/approve
    API-->>Hook: 200 OK (Updated StockRelease Object)
    
    rect rgb(235, 248, 255)
        note right of Hook: Invalidate Caches
        Hook->>Cache: invalidateQueries(["stock-releases"])
        Hook->>Cache: invalidateQueries(["inventory"])
        Hook->>Cache: invalidateQueries(["inventory-ledger"])
        Hook->>Cache: invalidateQueries(["dashboard"])
        Hook->>Cache: invalidateQueries(["notifications"])
        Hook->>Cache: invalidateQueries(["reports"])
    end
    
    Hook-->>UI: Display Toast Notification ("Stock Release Approved!")
    UI-->>User: Update Status Badge to Approved & Render Timeline
```

---

## 3. User Interaction Flow

```mermaid
flowchart TD
    A[User Opens Stock Release Page] --> B{Action?}
    B -->|View List| C[Fetch Stock Release List API]
    B -->|Click New Release| D[Open StockReleaseForm]
    
    D --> E[Select Product from Store Inventory]
    E --> F[Display Live Available Stock Badge]
    F --> G[Enter Release Quantity]
    G --> H{Quantity Valid?}
    
    H -->|Qty > Available Stock| I[Show Validation Error: Exceeds Stock]
    H -->|Duplicate Product| J[Disable Option / Show Error]
    H -->|Valid Qty <= Available| K[Enable Submit / Save Draft]
    
    K --> L[Submit Form]
    L --> M[API Creates / Updates Draft]
    M --> N[Redirect to Detail / List Page]
```
