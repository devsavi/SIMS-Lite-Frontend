# Numbering Sequences — SIMS Lite

> [!NOTE]
> Numbering Sequences are accessible at `/admin/sequences`. Requires `settings.edit` permission.

## Overview

The Numbering Sequences page configures automatic document number generation for all transactional modules in SIMS Lite. Each module has an independently configurable sequence with a prefix, suffix, counter, zero-padding, and a reset frequency.

---

## Supported Modules

| Module | Example Number |
|--------|---------------|
| Purchase Orders | `PO-00042-2026` |
| Goods Received Notes (GRN) | `GRN-000007` |
| Stock Releases | `REL-000015-2026` |

---

## Sequence Configuration Fields

| Field | Description |
|-------|-------------|
| Prefix | Text prepended before the number (e.g. `PO-`) |
| Suffix | Text appended after the number (e.g. `-2026`) |
| Next Number | The counter value to be used for the next document |
| Padding Digits | Zero-pad the counter to this many digits (e.g. 5 → 00042) |
| Reset Frequency | `NEVER`, `YEARLY`, `MONTHLY`, `DAILY` |

---

## Format Algorithm

```
{prefix}{padded(nextNumber, paddingDigits)}{suffix}
```

**Example:**
```
prefix       = "PO-"
nextNumber   = 42
paddingDigits = 5
suffix       = "-2026"

result = "PO-" + "00042" + "-2026" = "PO-00042-2026"
```

The `formatSequenceNumber` utility is exported from `SequencePreviewBadge.tsx` and used both in the list view and the live preview in the edit dialog.

---

## Reset Frequencies

| Frequency | Behavior |
|-----------|----------|
| `NEVER` | Counter increments indefinitely |
| `YEARLY` | Resets to `1` at the start of each calendar year |
| `MONTHLY` | Resets to `1` on the first day of each month |
| `DAILY` | Resets to `1` every midnight |

> [!WARNING]
> Resetting to a number already used in an active document can cause duplicate numbering conflicts. Coordinate with operations teams before adjusting `nextNumber` manually.

---

## Live Preview

The `SequenceFormDialog` and the list's `SequencePreviewBadge` both render a live preview as configuration values change, helping administrators visualize the resulting document number before saving.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/admin/numbering-sequences` | List all configured sequences |
| `PUT` | `/api/v1/admin/numbering-sequences/:id` | Update a sequence configuration |

---

## Query Hooks

```typescript
const { data: sequences, isLoading } = useNumberingSequences();
const { mutate: updateSequence } = useUpdateSequence();

// Update example
updateSequence({
  id: "seq-po",
  payload: { prefix: "PO-", nextNumber: 100, paddingDigits: 5, suffix: "-2026", resetFrequency: "YEARLY" }
});
```

---

## Module Location

```
src/features/admin/sequences/
├── api/        sequences-api.ts
├── components/ SequenceList.tsx, SequenceFormDialog.tsx, SequencePreviewBadge.tsx
├── hooks/      use-numbering-sequences.ts
├── pages/      NumberingSequencesPage.tsx
├── schemas/    sequence.schema.ts
└── types/      index.ts
```
