-- Drop the single-column status index on Inquiry. The composite
-- (status, createdAt DESC) index added in 20260507000000_perf_indexes
-- has `status` as its leading column, which makes a separate single-
-- column index redundant — the planner can use the composite for any
-- query that filters on `status` alone. Keeping both wastes write IO
-- and disk on every Inquiry mutation.
DROP INDEX IF EXISTS "Inquiry_status_idx";
