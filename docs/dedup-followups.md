# Deduplication Follow-ups

The QA hardening plan unified the 5 highest-impact duplications. The 6
remaining items below are documented for a later pass — they are smaller,
lower-risk, and not blocking.

## 1. `linkBankImageToProperty` vs `linkBankImageToProject`
`lib/actions.ts` has two near-identical functions for attaching a bank image
to either entity. Extract a helper that takes a Prisma image delegate, the
entity field name, and the bank image; both link functions become one-liners.

## 2. Auto-slug hook
Both `components/forms/property-form.tsx` and `components/forms/project-form.tsx`
maintain a `[autoSlug, setAutoSlug] = useState(mode === "create")` flag and a
`handleTitleChange` that calls `slugify`. Extract `useAutoSlug(mode, setValue)`
into `lib/use-auto-slug.ts`.

## 3. Customer-name display "pill"
The same `<div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "#f0fdf4" }}>` block appears in property-form, project-form, and a couple of admin pages. Extract `components/admin/customer-pill.tsx`.

## 4. `getNextSortOrder` helper
`app/api/upload/route.ts` repeats `aggregate({ _max: { sortOrder } })` four
times across hero images, project documents, project images, and property
images. Extract to `lib/sort-order.ts`.

## 5. Filter UI subcomponents
The three admin tables (`admin-property-table`, `admin-project-table`,
`admin-inquiry-table`) all repeat search box + filter select markup. Extract
`<TableSearchBox>`, `<TableFilterSelect>`, `<TableViewToggle>` to
`components/admin/table-toolbar.tsx`. Note: filter *state* differs per table,
so the components should accept value+onChange, not own state.

## 6. API response field-mapping
`app/api/v1/properties/route.ts` and `app/api/v1/projects/route.ts` both run
the same image/document mapping. Extract `mapImageForApi` and
`mapDocumentForApi` to `lib/api-mappers.ts`.

---

Total estimated effort if revisited together: 2–3 hours, ~150 LoC removed.
None of these are correctness issues, so they can ship whenever there's an
appropriate window.
