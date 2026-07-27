# End-to-End Procurement Workflow Documentation

## Overview
This document illustrates the end-to-end procurement process within SIMS Lite Frontend, tracing product requisition, purchase order issuance, supplier delivery, physical receipt via GRN, and automated inventory reconciliation.

## End-to-End Procurement Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Officer as Procurement Officer
    actor Admin as Admin / Manager
    actor StoreKeeper as Store Keeper
    participant PO as PO Module
    participant GRN as GRN Module
    participant Inv as Inventory System

    Officer->>PO: 1. Create Purchase Order (Draft)
    Officer->>PO: 2. Submit PO for Approval
    Admin->>PO: 3. Approve Purchase Order
    PO-->>Officer: 4. Notification / Email sent to Supplier
    StoreKeeper->>GRN: 5. Create GRN from Approved PO
    StoreKeeper->>GRN: 6. Record Received Quantities & Submit
    Admin->>GRN: 7. Approve GRN
    GRN->>Inv: 8. Update Product Physical Stock Levels
    Inv-->>StoreKeeper: 9. Show Inventory Impact Summary
```
