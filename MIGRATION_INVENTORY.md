# Migration Inventory — AWS → DigitalOcean

Phase 0 output per `MIGRATION_AWS_TO_DO.md`. Compiled 2026-07-25 from read-only repo scan + live AWS CLI check. See `MIGRATION_LOG.md` for the exact commands run.

## 1. Stack & runtime

| Item | Value | Source |
|---|---|---|
| Framework | Next.js 15.2.3 (App Router: `(public)`, `[locale]`, `admin`, `api` route groups) | `package.json` |
| UI | React 19 / React DOM 19 | `package.json` |
| Language | TypeScript ^5.8.3 | `package.json` |
| ORM | Prisma ^6.6.0 + `@prisma/client` ^6.6.0, plus raw `pg` ^8.20.0 | `package.json` |
| Auth | `next-auth` ^4.24.11, `bcryptjs` | `package.json` |
| Validation | `zod` ^3.24.2, `react-hook-form` | `package.json` |
| Email | `resend` ^6.9.4 (**not** AWS SES) | `lib/email.ts` |
| File storage SDK | `@aws-sdk/client-s3` ^3.1024.0, `@aws-sdk/s3-request-presigner` ^3.1026.0 | `package.json`, `lib/storage.ts` |
| Node version | Not pinned anywhere (no `engines` field, no `.nvmrc`). Only concrete reference is Node 20 in the disabled CI workflow. | `.github/workflows/e2e.yml.disabled` |
| Other runtimes in repo | None relevant — `building-visual-agent/server/` is an unrelated standalone Express/TS tool; `three.js-master/` is a vendored JS library, not app code. No Python/PHP/.NET/Java anywhere. | — |

## 2. Windows / legacy stop-condition check

**Result: clear, no blocker.** No `web.config`, `.aspx/.asax/.ascx/.asmx`, `.cs/.csproj/.sln`, or `System.Web` references found anywhere in the repo. No IIS, Classic ASP, ASP.NET Framework, or Windows-only SQL Server. **Migration may proceed** per playbook principle 6.

## 3. Database

| Item | Value | Source |
|---|---|---|
| Engine | PostgreSQL (Prisma `provider = "postgresql"`) | `prisma/schema.prisma` |
| Local/dev connection string | `postgresql://postgres:postgres@localhost:5432/real_estate_index` | `.env.example` |
| Production connection string | **Not in repo.** Injected at Amplify build time via its own env var store; `DATABASE_URL` is only referenced by name in `amplify.yml`. | `amplify.yml` |
| Actual RDS host / instance class / engine version | **Unknown — blocked.** `aws rds describe-db-instances` returned `AccessDenied` for the currently configured IAM user. | Live AWS CLI check, `MIGRATION_LOG.md` |
| Prior dump precedent | `backup.sql` (79 KB) + `pg_dump_log.txt` at repo root — a manual `pg_dump` taken 2026-04-05 with `pg_dump` v18.3 against a server reporting PostgreSQL 17.7. Confirms Postgres 17.x is the live engine version, but not the host. | `backup.sql`, `pg_dump_log.txt` |

## 4. Storage — ⚠️ two asset sets exist, both need migrating

| Item | Value | Source |
|---|---|---|
| Abstraction | `StorageProvider` interface in `lib/storage.ts` with `LocalStorageProvider` and `S3StorageProvider`, selected by `STORAGE_PROVIDER` env var (`local` \| `s3`) | `lib/storage.ts` |
| Currently active backend | `STORAGE_PROVIDER=local` — files under `public/uploads/`, **only 6 files**, 0 orphans, 0 broken refs, per most recent `find-orphans` run | `docs/orphan-report.md` (generated 2026-05-08) |
| Legacy S3 bucket | `aradre-assets`, region `eu-north-1` — confirmed by real object URLs already present in DB rows in `backup.sql` (`AdminUser.profileImage`, `Customer.logoUrl`, `HeroImage.url`, e.g. `https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/...`) | `backup.sql` |
| Actual bucket size / object count | **Unknown — blocked.** `aws s3 ls s3://aradre-assets --recursive --summarize` returned `AccessDenied`. | Live AWS CLI check |
| Large-file upload path | `app/api/upload/presign/route.ts` generates presigned S3 PUT URLs (5 min expiry) for `.exr`/`.hdr` environment files that exceed Amplify's 5 MB body limit; writes final URL into `db.project.environmentExrUrl` | `app/api/upload/presign/route.ts` |
| Credential naming quirk | App uses `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` instead of the conventional `AWS_*` names — code comment: "Amplify blocks AWS_ prefix env vars" | `lib/storage.ts:77` |

**Decision (user-approved):** migrate both the legacy S3 objects and the current local `public/uploads` files into a new DO Spaces bucket, then make Spaces the standing backend (`STORAGE_PROVIDER=s3` pointed at the Spaces endpoint).

## 5. Env vars in use

From `.env.example` / `amplify.yml`'s preBuild env-var allowlist:

```
DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL,
ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD,
NEXT_PUBLIC_MAP_LAT, NEXT_PUBLIC_MAP_LNG, NEXT_PUBLIC_MAP_ZOOM,
PLATFORM (local|aws), STORAGE_PROVIDER (local|s3),
S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY,
RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_TO_EMAIL
```

`lib/platform.ts` also reads two AWS-native runtime env vars (not app-configured, set by the Lambda/Amplify runtime itself) — `AWS_LAMBDA_FUNCTION_NAME`, `AWS_EXECUTION_ENV` — to detect "aws" mode and switch the writable temp dir to `/tmp`. These will simply be unset on DO App Platform, which is the desired behavior once storage no longer depends on local disk.

## 6. Deploy pipeline

| Item | Value |
|---|---|
| Current hosting | AWS Amplify Hosting (SSR compute, Lambda/CloudFront-backed under the hood) |
| Build spec | `amplify.yml`: `npm ci` → `prisma generate` → `prisma migrate deploy` (best-effort) → filter env vars into `.env.production` → `next build`; artifacts from `.next` |
| Dockerfile / docker-compose | **None exist** — this will be a from-scratch DO App Platform spec, not a lift-and-shift of existing container config |
| CI/CD | Only `.github/workflows/e2e.yml.disabled` exists, and it's disabled — it runs Playwright e2e against a `postgres:16` service container, does not deploy anything. Deployment is entirely Amplify's own git-triggered pipeline, external to this repo's CI. |

## 7. Cron jobs / scheduled tasks

**None found.** No `node-cron`, no Vercel/AWS cron config, no EventBridge/Lambda trigger references in app code. `scripts/find-orphans.ts` and `prisma/seed.ts` are manually-invoked maintenance scripts only.

## 8. Other AWS touchpoints

| Item | Result |
|---|---|
| IAM roles / ARNs hardcoded in app code | None found |
| SES | Not used — email goes through Resend (third-party API, no AWS dependency, no code change needed for migration) |
| Lambda handler code | None in repo — only Amplify's implicit managed SSR compute and the `lib/platform.ts` detection vars |
| CloudFront / Route53 resource IDs | None in repo — Amplify almost certainly uses CloudFront implicitly, but no distribution ID or domain binding is checked in |
| Region hardcoding | `eu-north-1` only, in `lib/storage.ts:72` and `app/api/upload/presign/route.ts:35` (both as env var defaults) |

## 9. Live AWS access — current status

| Check | Result |
|---|---|
| `aws sts get-caller-identity` | ✅ Authenticated as IAM user `aradre-s3-access` (Account `227103015295`) |
| `aws rds describe-db-instances` | ❌ AccessDenied |
| `aws s3 ls` (list buckets) | ❌ AccessDenied |
| `aws s3 ls s3://aradre-assets --recursive --summarize` | ❌ AccessDenied |
| `aws amplify list-apps` | ❌ AccessDenied |
| `aws ec2 describe-instances` | ❌ AccessDenied |
| `doctl version` | ❌ Not installed |

**Action required from user (per playbook principle 1 — Claude will not modify AWS IAM itself):** attach a read-only policy to `aradre-s3-access` (or provide a separate read-only profile) covering `rds:Describe*`, `ec2:Describe*`, `s3:ListBucket`/`ListAllMyBuckets`, `amplify:Get*`/`List*`, `route53:List*`, so the remaining live-resource sizing can be completed and folded into `MIGRATION_PLAN.md` before Phase 2 provisioning.

---

**Status:** Phase 0 repo-based discovery complete. Live AWS resource sizing (RDS instance class/engine version, real bucket size, Amplify/CloudFront/Route53 domain bindings) is blocked pending expanded IAM access — see open items in `MIGRATION_LOG.md`. Proceeding to draft `MIGRATION_PLAN.md` with the data available; sizing/cost figures there are conservative estimates to be refined once access is granted.
