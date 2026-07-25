# QA Plan — E2E Regression Suite

## 1. Purpose & scope

This document describes the Playwright end-to-end test suite as an ongoing regression gate for the app, and records the coverage added after the AWS→DigitalOcean migration (see `MIGRATION_LOG.md`/`MIGRATION_PLAN.md` for the migration itself). Out of scope here: `scripts/find-orphans.ts` (storage/DB orphan detection — a separate, manually-run maintenance tool, not part of the automated test gate).

## 2. How to run the suite

- Full local run: `npm run test:e2e` (auto-starts the dev server against `.env.test`, runs all specs across chromium/firefox/webkit, serially).
- Interactive/debug: `npm run test:e2e:ui`.
- Seed the test DB standalone: `npm run test:e2e:seed`.
- Storage-provider (S3/Spaces) round-trip check, run manually against a dedicated test bucket:
  `STORAGE_PROVIDER=s3 S3_ENDPOINT=... S3_BUCKET=... S3_REGION=... S3_ACCESS_KEY_ID=... S3_SECRET_ACCESS_KEY=... npm run verify:s3-storage`

## 3. Architecture of the existing suite

- `playwright.config.ts` — serial workers (`workers: 1`, `fullyParallel: false`), 3 browser projects, `webServer` auto-starts `npm run dev:test` against `.env.test`.
- `tests/e2e/global-setup.ts` / `global-teardown.ts` — guard on `DATABASE_URL` containing `real_estate_index_test` before running `prisma migrate deploy` / `TRUNCATE ... CASCADE`. Never point this suite at a database that isn't a disposable test DB.
- `tests/e2e/seed.ts` — wipes and re-seeds a known fixture set (`TEST_FIXTURES`: 2 customers, 2 admins, 1 project, 3 properties, 2 inquiries, 2 API clients, 1 hero image, site settings) before every run.
- `tests/e2e/helpers/auth.ts` (`loginAsSuperAdmin`, `loginAsCustomerManager`), `tests/e2e/helpers/db.ts` (`testDb()` — throws if `DATABASE_URL` isn't the test DB, a deliberate guard rail).

## 4. Coverage map

| Area | Spec(s) | Notes |
|---|---|---|
| Public property/project pages, SEO | `tests/e2e/public/*.spec.ts` | Content rendering, 404s for drafts |
| Inquiry form submission | `tests/e2e/public/property-detail.spec.ts` | Asserts `Inquiry` DB row |
| **Contact form submission** | `tests/e2e/public/contact-form.spec.ts` (new) | Asserts `EmailLog` row (`inquiryId: null`) |
| Admin auth/RBAC | `tests/e2e/admin/auth.spec.ts`, `rbac.spec.ts` | |
| Admin CRUD (properties/projects/inquiries/users) | `tests/e2e/admin/*-crud.spec.ts`, `inquiry-crm.spec.ts`, `users-customers.spec.ts` | |
| **Real image upload through the admin UI** | `tests/e2e/admin/image-upload.spec.ts` (new) | Exercises `ImageManagerGeneric` → `/api/upload` → `lib/upload.ts` → `getStorage().upload()` — the exact path whose shape changed during the storage migration |
| Cascade deletes | `tests/e2e/cascade.spec.ts` | |
| API endpoints | `tests/e2e/api/*.spec.ts` | |

Known gap still open (not built in this pass, see §7): image-bank/hero-image admin upload specs — same underlying code path as the new `image-upload.spec.ts`, mechanical to add once needed.

## 5. Storage-provider testing strategy

The Playwright browser suite always runs with `STORAGE_PROVIDER=local` (per `.env.test`) — this is deliberate, not an oversight. Running the full 3-browser serial suite against live DO Spaces credentials would be slow, network-flaky, and triple-exercises a code path that has nothing to do with the browser. Instead:

- The browser suite validates the *application* upload flow (form → API route → `lib/upload.ts`) using the local filesystem provider.
- `scripts/verify-s3-storage.ts` validates the `S3StorageProvider` itself (upload → list → delete round-trip) directly, run manually against a dedicated test Spaces bucket — never the production `aradre-assets` bucket.

## 6. CI

`.github/workflows/e2e.yml` (just re-enabled from `.e2e.yml.disabled`) runs the full suite against a `postgres:16` service container on push to `master`/`migrate/digitalocean` and on every PR. `.env.test`'s values (`STORAGE_PROVIDER=local`, `EMAIL_DRY_RUN=1`, etc.) are loaded automatically by `npm run test:e2e`'s `dotenv -e .env.test` wrapper; the workflow's explicit `DATABASE_URL`/`NEXTAUTH_*` env vars are defense-in-depth overrides matching the service container.

TODO: remove `migrate/digitalocean` from the trigger branches once it's merged into `master` and retired.

## 7. Backlog (deferred, not built in this pass)

- Remote `baseURL` parameterization (`E2E_BASE_URL` env override) + a `@smoke`-tagged, read-only subset for running against a live deployed URL — useful as a post-deploy sanity check, not required to validate the current migration.
- Image-bank / hero-image admin upload specs (mechanical extension of `image-upload.spec.ts`'s pattern to `components/admin/hero-image-manager.tsx` / `image-bank-picker.tsx`).
- Automated post-deploy smoke workflow (`workflow_dispatch` or triggered off a DO deployment webhook).
- Node/Postgres version parity check between CI's `postgres:16`/Node 20 and the actual DO App Platform/Managed Postgres configured versions — not verifiable from the repo alone.

## 8. Known blocker discovered while building this plan

Running `scripts/find-orphans.ts` against the production DO Postgres database failed with `FATAL: remaining connection slots are reserved for roles with the SUPERUSER attribute` — the production database is currently at its connection limit, unrelated to anything in this change set. Worth investigating separately (e.g. connection pooling/pgbouncer in front of the app, or a higher-connection-limit DB tier) before this or similar one-off scripts can run against production. See `MIGRATION_LOG.md` for how the app connects today.

## 9. Change log

- 2026-07-25 — Initial version. Added `image-upload.spec.ts`, `contact-form.spec.ts`, `verify-s3-storage.ts`; fixed `LOCAL_UPLOAD_DIR` bug in `lib/storage.ts`; wired up `EMAIL_DRY_RUN` in `lib/email.ts`; made `EmailLog.inquiryId` optional so contact-form submissions can be logged; re-enabled `.github/workflows/e2e.yml`.
