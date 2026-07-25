# SIMS Lite — Form Components

## Overview

All form fields integrate **React Hook Form + Zod** via shadcn/ui primitives. The generic wrappers in `src/components/common/form-fields/` reduce boilerplate in feature forms.

## Usage Pattern

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/app/components/ui/form"
import {
  TextField,
  PasswordField,
  SelectField,
  TextareaField,
  CheckboxField,
} from "@/components/common"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string(),
  notes: z.string().optional(),
  active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

function CreateUserForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", role: "", notes: "", active: true },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TextField control={form.control} name="name" label="Full Name" required />
        <TextField control={form.control} name="email" label="Email" type="email" required />
        <SelectField
          control={form.control}
          name="role"
          label="Role"
          options={roleOptions}
          required
        />
        <TextareaField control={form.control} name="notes" label="Notes" rows={3} />
        <SwitchField control={form.control} name="active" switchLabel="Account active" />
        <Button type="submit">Create User</Button>
      </form>
    </Form>
  )
}
```

## Available Field Components

### `TextField`
Standard text input. Use `type="email"`, `type="url"`, etc.

```tsx
<TextField control={control} name="sku" label="SKU" placeholder="e.g. PROD-001" required />
```

### `PasswordField`
Password input with show/hide toggle.

```tsx
<PasswordField control={control} name="password" label="Password" required />
```

### `NumberField`
Numeric input with min/max/step constraints.

```tsx
<NumberField control={control} name="quantity" label="Quantity" min={0} step={1} />
```

### `CurrencyField`
Number input with currency prefix.

```tsx
<CurrencyField control={control} name="unitPrice" label="Unit Price" currencySymbol="$" />
```

### `TextareaField`
Multi-line text input.

```tsx
<TextareaField control={control} name="description" label="Description" rows={4} />
```

### `SelectField`
Single-value select dropdown.

```tsx
<SelectField
  control={control}
  name="category"
  label="Category"
  options={[
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
  ]}
/>
```

### `MultiSelectField`
Multi-value select with badge display.

```tsx
<MultiSelectField
  control={control}
  name="tags"
  label="Tags"
  options={tagOptions}
  maxDisplay={3}
/>
```

### `SearchableSelectField`
Combobox with client-side search.

```tsx
<SearchableSelectField
  control={control}
  name="supplierId"
  label="Supplier"
  options={suppliers.map(s => ({ value: s.id, label: s.name }))}
  searchPlaceholder="Search suppliers…"
/>
```

### `CheckboxField`
Single checkbox with optional label.

```tsx
<CheckboxField
  control={control}
  name="rememberMe"
  checkboxLabel="Remember me for 30 days"
/>
```

### `SwitchField`
Toggle switch with label.

```tsx
<SwitchField control={control} name="isActive" switchLabel="Active" />
```

### `RadioGroupField`
Radio button group.

```tsx
<RadioGroupField
  control={control}
  name="shippingMethod"
  label="Shipping Method"
  options={[
    { value: "standard", label: "Standard (3-5 days)" },
    { value: "express", label: "Express (1-2 days)" },
  ]}
  orientation="vertical"
/>
```

## DatePicker (form usage)

```tsx
import { DatePicker } from "@/components/common"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/app/components/ui/form"

<FormField
  control={control}
  name="dueDate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Due Date</FormLabel>
      <FormControl>
        <DatePicker value={field.value} onChange={field.onChange} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Base Field Props

All field components accept these shared props:

| Prop | Type | Description |
|---|---|---|
| `control` | `Control<T>` | React Hook Form control |
| `name` | `FieldPath<T>` | Field name (typed) |
| `label?` | `string` | Field label |
| `description?` | `string` | Help text below the field |
| `required?` | `boolean` | Adds asterisk to label |
| `disabled?` | `boolean` | Disables the field |
| `className?` | `string` | Wrapper class |

Validation errors from Zod are automatically displayed via `<FormMessage />`.
