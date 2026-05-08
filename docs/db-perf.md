# Database Performance Notes

## Indexes

All indexes added by Phase A3 of the QA hardening plan. Run
`npx prisma migrate deploy` to apply.

### Inquiry — `(status, createdAt DESC)`
The admin inquiry list filters by status and sorts by date. The pre-existing
single-column `(status)` index served the WHERE but forced an in-memory sort
on every render. The new composite avoids that.

```sql
CREATE INDEX "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt" DESC);
```

### Property — `(price)`
The home page and properties listing accept price-range filters. Without a
price index Postgres falls back to a sequential scan once the table grows past
a few thousand rows.

```sql
CREATE INDEX "Property_price_idx" ON "Property"("price");
```

## Verifying

After migration, against the seeded test DB:

```sql
EXPLAIN ANALYZE
SELECT * FROM "Inquiry" WHERE status='new' ORDER BY "createdAt" DESC LIMIT 50;
```

Expected: `Index Scan using Inquiry_status_createdAt_idx`. If you see a
`Sort` node above an `Index Scan`, the composite index isn't being chosen —
check that `ANALYZE` has been run on the table after seed.

```sql
EXPLAIN ANALYZE
SELECT * FROM "Property" WHERE price BETWEEN 200000 AND 600000 LIMIT 20;
```

Expected: `Bitmap Index Scan using Property_price_idx` for selective ranges.
For very wide ranges Postgres may still pick a sequential scan; this is the
correct behavior.

## Existing indexes (already in schema, do not duplicate)

- `Property(city)`, `(published, status)`, `(featured)`, `(projectId)`, `(customerId)`, `(apiEnabled, published, status)`
- `Project(city)`, `(published, status)`, `(customerId)`, `(apiEnabled, published, status)`
- `PropertyImage(propertyId, sortOrder)` and `ProjectImage(projectId, sortOrder)` — covers gallery rendering + cascade
- `ProjectDocument(projectId, sortOrder)` — covers document list rendering + cascade
- `ProjectUnit(projectId, building, entrance, floor)` and `(propertyId)`
- `Inquiry(propertyId, createdAt)`, `(projectId)`, `(status, createdAt DESC)`
  - The single-column `(status)` index that originally lived alongside the
    composite was dropped in `20260510000000_drop_redundant_inquiry_status_idx`.
    Its leading column is `status`, so the composite covers any query the
    single-column one could serve. Keeping both wasted disk and write IO.
- `InquiryNote(inquiryId, createdAt)`, `Appointment(inquiryId, dateTime)`, `EmailLog(inquiryId, sentAt)`
- `HeroImage(active, sortOrder)`, `Customer(companyName)`, `AdminUser(customerId)`, `ApiClient(customerId)`

## What we deliberately did NOT add

- **No full-text index.** The existing `LIKE`/`ILIKE` filters work fine at
  current scale. If listings cross ~50k rows, revisit with `pg_trgm` or a
  dedicated search index.
- **No covering/INCLUDE indexes.** Postgres can use the existing btrees plus a
  visibility check; covering indexes only pay off for very hot read paths
  that the metrics haven't flagged yet.
- **No partial indexes** (e.g. `WHERE published=true`). The composite
  `(published, status)` indexes already give the planner everything it needs
  for typical filters.
