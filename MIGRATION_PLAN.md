# Migration Plan — AWS → DigitalOcean

Phase 1 output per `MIGRATION_AWS_TO_DO.md`, based on `MIGRATION_INVENTORY.md`. Drafted 2026-07-25.

✋ **This document is the Gate 1 approval artifact. No DigitalOcean resource will be created until the user replies with the literal word "מאושר".**

## Scope note — what's still an estimate

Live AWS resource inspection (real RDS instance size/engine version, actual `aradre-assets` bucket size, Amplify/CloudFront/Route53 domain bindings) is currently blocked: the configured IAM user `aradre-s3-access` only has narrow S3 permissions and every discovery call (`rds:Describe*`, `ec2:Describe*`, `s3:List*`, `amplify:List*`) returned `AccessDenied` (see `MIGRATION_LOG.md`). Everything below is therefore sized conservatively from repo-only evidence (schema complexity, `backup.sql` size, table row counts implied by it) rather than real usage metrics. Once the user grants broader read-only IAM access, Phase 2 sizing will be revisited before actually provisioning anything oversized or undersized.

## 1. Target architecture on DigitalOcean

| Component | Choice | Why |
|---|---|---|
| Compute | **App Platform**, one Node/Next.js web component | User-approved. No Dockerfile exists today; App Platform's git-based build/deploy model is the closest match to the current Amplify Hosting workflow, needs no nginx/certbot/TLS management, and fits CLAUDE.md's "keep architecture simple" mandate. |
| Database | **DO Managed PostgreSQL**, smallest tier that fits (start at the 1 vCPU / 1 GB RAM / 10 GB disk "Basic" node) | `backup.sql` is 79 KB — a small dataset today. Sizing will be confirmed once live RDS metrics are available; Managed DB tiers resize with a few minutes of downtime if this proves too small. |
| Storage | **DO Spaces** bucket (S3-compatible), same region as the app | User-approved: consolidate both the legacy AWS S3 objects and the current local `public/uploads` files here, and make it the permanent backend — App Platform's filesystem is ephemeral per deploy, same constraint as Amplify. |
| Region | **Match the user's existing DO account/project region** — to be confirmed via `doctl account get` / `doctl projects list` at the start of Phase 2. Fallback: `fra1` (Frankfurt) if the account has no existing footprint, for latency to Israel. | User instruction — don't introduce a second region if one is already established. |
| Firewall | DO Cloud Firewall on the DB: restrict trusted sources to the App Platform component only (VPC-scoped) | Playbook Phase 2 requirement; App Platform manages its own inbound TLS/ports, so no manual port 22/80/443 firewall is needed the way it would be for a Droplet. |
| Email | No change — stays on Resend (already a third-party API, not AWS-coupled) | Confirmed in inventory §8. |

## 2. Code changes required (Phase 4 — after Gate 1 + Gate 2)

1. **`lib/storage.ts`** — add an optional Spaces endpoint override to `S3StorageProvider`:
   - New env var `S3_ENDPOINT` (e.g. `https://<region>.digitaloceanspaces.com`), passed to the `S3Client` constructor alongside `forcePathStyle: false` (Spaces supports virtual-hosted style like S3).
   - When `S3_ENDPOINT` is unset, behavior is byte-for-byte identical to today (talks to AWS) — additive, zero risk until cutover.
   - Returned public URL construction (`https://${bucket}.s3.${region}.amazonaws.com/${key}`) needs a parallel branch for Spaces URLs (`https://${bucket}.${region}.digitaloceanspaces.com/${key}` or the CDN-fronted `https://${bucket}.${region}.cdn.digitaloceanspaces.com/${key}` if Spaces CDN is enabled).
2. **`app/api/upload/presign/route.ts`** — same `S3Client`/endpoint change as above, so presigned upload URLs point at Spaces instead of AWS once cut over.
3. **New `.do/app.yaml`** — DO App Platform app spec, replacing `amplify.yml`'s role:
   - Build command: `npm ci && npx prisma generate && npx next build` (matches the existing `package.json` `build` script; add `npx prisma migrate deploy` as a pre-deploy job, matching `amplify.yml`'s best-effort migrate step).
   - Run command: `npx next start` (matches `package.json` `start` script).
   - Env vars declared in the spec (values set as encrypted secrets in DO, never committed): `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, `NEXT_PUBLIC_MAP_*`, `PLATFORM`, `STORAGE_PROVIDER`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL`.
4. **`DATABASE_URL`** → DO Managed Postgres connection string, `sslmode=require`.
5. **No change needed**: `lib/email.ts` (Resend), `lib/platform.ts` (its AWS Lambda env-var detection simply won't match on DO, which is correct — it'll fall through to non-serverless behavior).
6. **`STORAGE_PROVIDER`** set to `s3` (pointed at Spaces) in the new environment — stop relying on `local` in production, per the approved storage decision.

## 3. Data migration method

**Database:**
1. `pg_dump --format=custom --no-owner` from the production DB (host TBD — pending IAM access or manual info from user) once Phase 2 provisioning is done.
2. Restore via `pg_restore` into the new DO Managed Postgres instance.
3. Verify: row counts per table match on both sides (script against `prisma/schema.prisma`'s model list); diff schema (tables/indexes/FKs); run 3–5 sanity queries (e.g. count of `ACTIVE` properties, most recent inquiry) and compare results.
4. The repo's existing `backup.sql` + `pg_dump_log.txt` establish this is already a known-working workflow locally — Phase 3 will redo it fresh against the live source at migration time, not reuse the stale dump.

**Storage:**
1. `rclone sync aws-s3:aradre-assets do-spaces:<new-bucket> --checksum --progress` for the legacy S3 objects.
2. Separately copy the current `public/uploads/` (6 files) into the same Spaces bucket (small enough to do directly via `doctl` or the Spaces API, no rclone remote needed for a local directory — or configure rclone with a local remote for consistency).
3. Verify with `rclone check` — zero differences required against the S3 source.
4. One-off script (pattern reused from `scripts/find-orphans.ts`'s existing URL-detection logic) to find any DB rows still referencing `*.s3.eu-north-1.amazonaws.com` URLs and repoint them at the new Spaces URLs for the same object keys.

## 4. Cost estimate (rough — refine once real AWS billing/usage is available)

| Item | DO estimate | Notes |
|---|---|---|
| App Platform (Basic web component) | ~$12/mo (professional-xs) or ~$5/mo (basic-xxs) depending on load | Actual CPU/RAM needs unknown — no CloudWatch access yet |
| Managed PostgreSQL (smallest tier) | ~$15/mo | 1 vCPU / 1 GB RAM / 10 GB disk; resizable later |
| Spaces (250 GB + CDN) | ~$5/mo | Covers both migrated asset sets comfortably given current small footprint |
| **Total** | **~$25–35/mo** | Compare against current Amplify Hosting + RDS + S3 bill once the user can share it — not retrievable via the currently scoped IAM credentials |

## 5. Downtime estimate, rollback, risks

- **Downtime target**: near-zero. Parallel run on DO, DNS TTL lowered to 300s 48h before cutover, final DB delta + Spaces delta synced during a short low-traffic window, then DNS flip. Expect single-digit minutes of potential inconsistency during the final sync, not a hard outage.
- **Rollback**: trivial — AWS Amplify/RDS/S3 remain fully live and untouched throughout (playbook principle 1); rollback is simply reverting the DNS record back to Amplify's domain. No AWS resource will be decommissioned until ≥14 days after a successful cutover, and only manually by the user.
- **Risks identified:**
  - Real RDS size/engine version unknown — Managed Postgres tier chosen above could be undersized; mitigated by DO's easy vertical resize and by re-checking once IAM access is expanded.
  - The storage discrepancy (local vs. legacy S3) means some DB rows may reference S3 objects that no longer exist or were never fully migrated when the app switched to local storage — the repoint script in §3 needs to tolerate "object not found" gracefully and log it rather than fail the whole migration.
  - `next start` on App Platform needs verification that Prisma's generated client and `node_modules/.prisma` cache behave the same as on Amplify (same Node runtime assumptions) — will be caught in Phase 5 smoke testing.

## Prerequisites before Phase 2 can start (user action required)

1. Attach a read-only IAM policy to `aradre-s3-access` (or supply a separate read-only profile) covering `rds:Describe*`, `ec2:Describe*`, `s3:ListBucket`/`ListAllMyBuckets`, `amplify:Get*`/`List*`, `route53:List*` — needed to confirm real sizing before provisioning.
2. Run `doctl auth init` (or export `DIGITALOCEAN_ACCESS_TOKEN`) so `doctl` can authenticate non-interactively in this environment.

---

✋ **Gate 1 — waiting for approval.** Reply "מאושר" to proceed to Phase 2 (DigitalOcean provisioning). Anything you want changed in this plan first, let me know.
