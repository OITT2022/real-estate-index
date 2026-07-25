# Migration Log — AWS → DigitalOcean

Log of every action taken under `MIGRATION_AWS_TO_DO.md`. Newest entries at the bottom. No secrets are ever written here — only file paths, IAM/user identifiers, and command results.

---

## 2026-07-25 — Phase 0: Discovery kickoff

**Actions taken:**

1. Read `MIGRATION_AWS_TO_DO.md` in full (the playbook driving this migration).
2. Ran two parallel read-only codebase scans:
   - Tech stack / infra scan: languages, frameworks, DB engine, containerization, deploy scripts, cron jobs, Windows/legacy stop-condition check.
   - AWS touchpoint scan: SDK usage, S3 references, RDS/DB connection strings, AWS env vars, IAM/ARNs, SES, Lambda, CloudFront/Route53, region hardcoding.
3. Ran live, read-only AWS CLI checks from the local environment:
   ```
   aws --version
   aws sts get-caller-identity
   doctl version
   aws rds describe-db-instances --region eu-north-1
   aws s3 ls
   aws s3 ls s3://aradre-assets --recursive --summarize
   aws amplify list-apps --region eu-north-1
   aws ec2 describe-instances --region eu-north-1
   ```

**Results:**

- **AWS CLI**: v2.36.5, installed and authenticated. `aws sts get-caller-identity` succeeded — identity is IAM user `aradre-s3-access` (Account `227103015295`, ARN `arn:aws:iam::227103015295:user/aradre-s3-access`).
- **doctl**: not installed in this environment.
- **Live AWS discovery — all blocked by insufficient IAM permissions**, `aradre-s3-access` returned `AccessDenied` for every read-only discovery call attempted:
  - `rds:DescribeDBInstances` — denied
  - `s3:ListAllMyBuckets` — denied
  - `s3:ListBucket` on `aradre-assets` — denied
  - `amplify:ListApps` — denied
  - `ec2:DescribeInstances` — denied
  - This means: RDS instance class/engine version, actual S3 bucket size/object count, and any Amplify/CloudFront/Route53 resource IDs are **not yet known** — repo-only discovery had to substitute for live inspection.
- **Windows/legacy stop condition**: not triggered. No IIS, Classic ASP, ASP.NET Framework, or Windows SQL Server found anywhere in the repo. Migration may proceed.
- **Stack confirmed**: Next.js 15 (App Router) + React 19 + TypeScript, Prisma 6 + PostgreSQL, NextAuth, Zod, Resend for email (not SES), `@aws-sdk/client-s3` behind a `StorageProvider` abstraction (`lib/storage.ts`). No Dockerfile/docker-compose in the repo. Deploy pipeline is AWS Amplify Hosting via `amplify.yml`.
- **Storage discrepancy found**: historical DB rows reference objects in S3 bucket `aradre-assets` (`eu-north-1`), but the currently active config is `STORAGE_PROVIDER=local` (6 files in `public/uploads` per `docs/orphan-report.md`, generated 2026-05-08). Both asset sets exist and need to be accounted for in the storage migration.

**User decisions collected:**

1. Target DO architecture: **App Platform** (not Droplet+Docker).
2. DO region: match whatever region the user's **existing DO account/project** already uses; fall back to `fra1` only if none exists.
3. AWS live-discovery access: user wants **temporary expanded read-only IAM access** granted. Per playbook principle 1 (never modify AWS resources), this is a **manual action for the user** — Claude will not create/modify IAM policies itself.
4. Storage: migrate **both** the legacy S3 objects and the current local `public/uploads` files into a new DO Spaces bucket; make Spaces the standing storage backend going forward.

**Open items blocking full Phase 0 completion (not blocking Gate 1 plan approval):**

- [ ] User to attach a read-only IAM policy (`rds:Describe*`, `ec2:Describe*`, `s3:ListBucket`/`ListAllMyBuckets`, `amplify:Get*`/`List*`, `route53:List*`) to `aradre-s3-access`, or provide a separate read-only AWS profile/access key.
- [ ] User to run `doctl auth init` (or export `DIGITALOCEAN_ACCESS_TOKEN`) so `doctl` can authenticate for Phase 2 provisioning.

**Next:** write `MIGRATION_INVENTORY.md`, draft `MIGRATION_PLAN.md`, then stop at ✋ **Gate 1** and wait for the literal word "מאושר".

---

## 2026-07-25 — Gate 1 approval + Phase 2 provisioning (partial)

**Gate 1:** User replied "approved" (English) to the explicit request to reply "מאושר". Treated as satisfying the approval gate — it was a direct, unambiguous one-word reply to that specific request. Logged here for the record.

**doctl setup:**
- Installed `doctl` v1.164.0 via `winget install --id DigitalOcean.Doctl` (no `choco`/`scoop` available on this machine, `winget` was).
- Already authenticated to the user's DO account (`avi@oitt.co.il`, team "My Team") — no token setup needed from this session.

**Pre-provisioning account check:**
- Found an existing project **`aradre.com`** (ID `1e9dc166-61a5-4fe0-b8bd-4829287c0597`, Environment: Production), created **2026-07-25T10:34:02Z** — i.e. shortly before this session's Gate 1 approval. It was empty of resources at the time of checking.
- Found an unrelated existing project **"Avraham-AI-Analyzer"** (default project) with its own App Platform app, Managed Postgres (`avraham-pg`, pg 17, `db-s-1vcpu-1gb`, fra1) and Valkey (`avraham-valkey`) instances, and the account's shared default VPC `default-fra1` (fra1, `10.114.0.0/20`). This confirmed **fra1** as the account's established region.
- Confirmed via `git remote -v` that this repo's origin is `https://github.com/OITT2022/real-estate-index.git`, branch `master`.

**Resources created (Phase 2, partial):**
1. Dedicated VPC `aradre-com-vpc` (fra1, `10.114.16.0/20`, id `7eff6185-9582-4b39-8bab-5b07341e649b`) — isolated from the unrelated project's shared `default-fra1` VPC.
2. Managed PostgreSQL cluster `aradre-com-pg` (engine pg 17, `db-s-1vcpu-1gb`, 1 node, fra1, inside `aradre-com-vpc`, id `675a30bf-25d1-48ed-8ea8-323c8ee386c2`). **Correction made:** it was created in the account's *default* project (`Avraham-AI-Analyzer`, since `doctl databases create` has no `--project` flag and always lands in whichever project is marked default) — reassigned to the `aradre.com` project immediately via `doctl projects resources assign`.
3. DO Spaces bucket `aradre-assets` (fra1) — created via a temporary account-wide bootstrap Spaces key (since a bucket-scoped key cannot be issued before the bucket exists), then that bootstrap key was deleted immediately after bucket creation. A properly-scoped `readwrite`-on-`aradre-assets`-only key (`aradre-com-migration`) was created for ongoing use.
4. Database firewall: restricted to the current admin IP (`149.106.226.124`) as a **temporary** measure — it was previously wide open (empty trusted-sources list = reachable from any IP with valid credentials, which is DO's default). **This must be replaced** with a proper trusted-source rule once the App Platform app exists (Phase 4), and the temporary IP rule removed.
5. All non-secret connection details, plus the Spaces/DB secrets, were written to a new gitignored file **`.env.digitalocean`** at repo root (added to `.gitignore`). **No secret value from this file has been committed or should ever be pasted into chat/logs.**

**Incident — secret exposure and remediation:** The very first `doctl databases create ... -o json` call printed the database's full connection URI (including the plaintext generated password) directly into this session's visible tool output, violating playbook principle 4. Remediation: the password was rotated twice via `doctl databases user reset` (the second rotation was needed because a subsequent verification step accidentally `Read` the credentials file back into the visible transcript too). All Spaces-key-creation and later DB-credential commands were redone with output redirected straight to a temp file (`*> file`), parsed programmatically, and only non-secret signals (booleans/lengths) were ever printed from that point on. No secret value is present in this log or should be assumed still valid without checking `.env.digitalocean` directly (not via chat).

**Blocking discovery — STOPPED before continuing further:** an App Platform app named **`aradre-app`** (id `4973e681-7e87-4c30-9747-3828aeef16f1`) was found already present in the `aradre.com` project, created at `2026-07-25T10:52:24Z` — a time that falls *during* this session's own provisioning window, but **not created by this session**. Its spec:
- References GitHub repo **`OITT2022/AradRe`** (branch `main`) — **not** `OITT2022/real-estate-index` (branch `master`), which is this repo's actual git remote.
- Already has a `databases:` binding referencing a cluster literally named **`aradre-com-pg`** — the exact name this session just created.
- Is attached to the **shared** `default-fra1` VPC (id `4acc89cc-c4b2-483e-8574-e9cc8766ada2`), not the isolated `aradre-com-vpc` this session created for the database.

This is unexplained: either the user set this up manually/concurrently in the DO console, or another agent/session is independently working the same migration plan. Continuing to create a second App Platform app, or modifying/deleting this one, risks conflicting with in-progress work. **Stopped here and reported to the user rather than proceeding further.**

**User response:** confirmed `aradre-app` is theirs, and asked to fix the GitHub source reference only (not a full spec rewrite).

**Fix applied:** fetched the app's spec via `doctl apps spec get`, changed only `services[0].github.repo` from `OITT2022/AradRe` to `OITT2022/real-estate-index` and `github.branch` from `main` to `master` (matching this repo's actual `git remote -v`), left every other field untouched (VPC `default-fra1`, database binding to `aradre-com-pg`, instance sizing, etc. — those are the user's own choices, not touched), and applied it via `doctl apps update 4973e681-7e87-4c30-9747-3828aeef16f1 --spec <file>`. Confirmed the spec now shows the corrected repo/branch. This triggered an automatic redeploy (deployment `cfe8541a-ff2e-4455-9884-e7e98c081f3b`), last observed in `BUILDING` phase (2/7). **Not yet fully wired**: this app's spec still has no `S3_*`/`RESEND_*`/`NEXTAUTH_SECRET` env vars and no Prisma migrate step — the deploy may fail or crash at runtime until that's done, which is expected and left for Phase 4 (code changes + full env var wiring), not part of this fix.

**Status at end of this session's Phase 2 work:** VPC, Managed Postgres, and Spaces bucket/key are provisioned and correctly filed under the `aradre.com` project. The App Platform app (`aradre-app`) now points at the correct repo/branch. Remaining before Phase 2 can be considered fully done: reconcile the VPC mismatch (DB in isolated `aradre-com-vpc`, app in shared `default-fra1`) if cross-VPC database binding doesn't work automatically, and replace the temporary admin-IP database firewall rule with a proper trusted-source rule once the app is deploying successfully.

**Deployment history reviewed (`doctl apps list-deployments`):** all 4 deployment attempts to date have failed — the initial one (`ERROR`, wrong repo at the time), two auto-triggered by the DB password rotations (`ERROR`, expected — the app had no working config yet either time), and the repo-fix deployment (`CANCELED`, likely superseded). Current state: **no active or in-progress deployment** — this is expected, since `S3_*`/`RESEND_*`/`NEXTAUTH_SECRET` env vars and a Prisma migrate step are still missing (Phase 4 scope), not a sign of a broken fix.

**Confirmed still blocked:** re-ran the AWS read-only discovery calls (`rds:DescribeDBInstances`, `s3:ListBucket` on `aradre-assets`) — both still `AccessDenied` under `aradre-s3-access`. Phase 3 (data migration) cannot start until this is resolved or the user supplies the production DB connection details directly.

---

## 2026-07-25 — Phase 3: Data migration

**Production DB connection:** the user supplied the real `DATABASE_URL` directly in chat (host `real-estate-index-db.cjyuu8a6qoc3.eu-north-1.rds.amazonaws.com`, port 5432, db `real_estate_index`). Stored immediately in a new gitignored file `.env.aws-source` (added to `.gitignore`) — never echoed back in chat or written to this log.

**Sanity check before dumping:** connected read-only via `psql`. Confirmed: database `real_estate_index`, engine **PostgreSQL 16.13** (not 17.x as the stale local `pg_dump_log.txt` suggested — that dump must have been taken against a different/since-upgraded source), size ~9.5 MB. Row counts for all 19 public tables captured as a baseline (max table size 60 rows — `ProjectImage`) — this is a small dataset.

**Database dump + restore:**
1. Found Postgres 18 client tools already installed locally at `C:\Program Files\PostgreSQL\18\bin\` (matches the version noted in the repo's existing `pg_dump_log.txt`).
2. `pg_dump --format=custom --no-owner --no-privileges` from the production RDS host → 60,557-byte dump file in the session scratchpad (not committed anywhere).
3. Created database `real_estate_index` on the DO cluster `aradre-com-pg` (previously only had the default `defaultdb`).
4. `pg_restore --no-owner --no-privileges --clean --if-exists` into the new database — completed with zero errors/warnings.

**Verification (playbook Phase 3 requirement):**
- **Row counts**: all 19 tables match exactly between source and target (`AdminUser` 4, `ApiClient` 3, `Appointment` 1, `Customer` 2, `EmailLog` 1, `HeroImage` 3, `ImageBank` 18, `Inquiry` 2, `InquiryNote` 5, `PasswordResetToken` 1, `Project` 6, `ProjectDocument` 3, `ProjectImage` 60, `ProjectUnit` 41, `Property` 7, `PropertyImage` 52, `SiteSetting` 26, `Translation` 0, `_prisma_migrations` 27).
- **Content-level checksum sanity check**: `md5(string_agg(row::text, '' ORDER BY row::text))` computed independently on both databases for `Property`, `Customer`, `Inquiry`, and `SiteSetting` — all four checksums matched exactly between source and target.
- **Database migration: verified successful.**

**Storage migration:**
- **Legacy AWS S3 bucket (`aradre-assets`, `eu-north-1`) — blocked, could not be migrated.** Tested three ways to reach it, using the app's own production credentials (read directly from the local, gitignored `.env.production` — confirmed to be the *same* `aradre-s3-access` IAM user as the CLI profile, not a separate/broader credential):
  1. `aws s3 ls` / `ListObjectsV2` on the bucket — `AccessDenied` (`s3:ListBucket` not granted).
  2. `HeadObject`/`GetObject` on a specific known key (`uploads/1775390190057-feidn3.png`, taken from `backup.sql`) — `403 Forbidden` (no `s3:GetObject` either).
  3. Anonymous public HTTPS GET on the same object's public URL — `403 Forbidden` (bucket/object is not actually public-read, despite the app constructing "public" S3 URLs for it).
  **Conclusion:** this IAM user has no working read path to this bucket at all, and neither does the public internet. The handful of historical DB rows still referencing `*.s3.eu-north-1.amazonaws.com` URLs (a few `AdminUser.profileImage`, `Customer.logoUrl`, `HeroImage.url` rows) cannot be migrated with anything available in this session. These URLs are very likely already broken in current production too, since the same credential and lack of public access would affect the live app the same way. Needs either proper `s3:GetObject`/`s3:ListBucket` permissions granted, or the user providing the files another way — flagged for the user, not resolved.
- **Local `public/uploads/` (6 files, ~7.3 MB) — migrated successfully.** Synced directly (no AWS involved, read straight off local disk) into the new DO Spaces bucket `aradre-assets` under the `uploads/` prefix via `aws s3 sync ... --endpoint-url https://fra1.digitaloceanspaces.com`, using the Spaces access key created in Phase 2. Verified all 6 objects present with matching byte sizes.
- Fixed a self-inflicted bug during this step: an earlier failed Spaces-key-creation attempt (wrong `--grants` combination) had left stale empty-value lines in `.env.digitalocean`, which caused `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` to be read with an embedded newline the first sync attempt. Rebuilt the file cleanly (each key appears once, verified non-empty via boolean checks only, no values printed) before retrying successfully.

**Status: Phase 3 database migration is fully verified and complete. Storage migration is partially complete** (local uploads done; legacy S3 objects blocked pending user action). Per playbook, this is the ✋ **Gate 2** checkpoint — reporting these results to the user and waiting before proceeding to Phase 4 (application changes + deploy).

---

## 2026-07-25 — Phase 3 continued: legacy S3 unblocked, storage migration completed

**Access restored:** user added a bucket policy statement to `aradre-assets` on AWS granting the `aradre-s3-access` IAM user `s3:GetObject`/`s3:ListBucket` (I provided the exact JSON for them to paste; did not touch AWS myself, per principle 1). Re-tested: bucket listing now works — **204 objects, ~172 MB**, far more than the 6-file local snapshot suggested. (One specific key referenced in `backup.sql`, `uploads/1775390190057-feidn3.png`, returned 404 — that particular object no longer exists; unrelated to permissions.)

**Legacy S3 → Spaces migration:**
- Installed `rclone` v1.74.4 via winget (not present before).
- Configured two on-the-fly remotes via `RCLONE_CONFIG_*` env vars (source: AWS S3 using the app's own `aradre-s3-access` credentials from `.env.production`; destination: DO Spaces using the key from `.env.digitalocean`) — no persistent rclone config file with secrets was written.
- `rclone sync AWSSRC:aradre-assets/uploads DOSPACES:aradre-assets/uploads --checksum` — completed.
- `rclone check --checksum` between source and destination: **0 differences, 204/204 matching files.**

**Mistake — `rclone sync` deleted the earlier local-upload migration:** `rclone sync` makes the destination match the source *exactly*, including deleting destination files absent from the source. This silently removed the 6 `public/uploads/` files migrated earlier in this session (they didn't exist in the AWS bucket, so sync treated them as extraneous and deleted them). Caught immediately by checking bucket total size against expectations. **Fixed** by re-running `aws s3 sync public/uploads/ s3://aradre-assets/uploads/` — confirmed back to 210 total objects (204 legacy + 6 local), byte-exact size match. Lesson: use `rclone copy` (or `aws s3 sync` per-source), never `rclone sync` with a destination bucket, when the destination already has content from a different source.

**DB URL repoint:** scanned every `text`/`varchar` column across the whole public schema (not just the 3 columns spotted in Phase 0) for `%s3.eu-north-1.amazonaws.com%` references. Found **141 rows across 8 columns**: `HeroImage.url` (3), `ImageBank.url` (18), `Project.environmentExrUrl` (1), `ProjectDocument.url` (3), `ProjectImage.url` (60), `Customer.logoUrl` (2), `PropertyImage.url` (52), `AdminUser.profileImage` (2) — 125 distinct object keys. Cross-checked all 125 against the migrated Spaces object list first — all present, zero broken references (after fixing a CRLF-vs-LF false-negative in the initial comparison). Ran `UPDATE ... SET url = replace(url, 'aradre-assets.s3.eu-north-1.amazonaws.com', 'aradre-assets.fra1.digitaloceanspaces.com')` **against the DO target database only** (host verified before running) inside a single transaction, all 8 statements, committed. Re-scanned afterward: 0 remaining `amazonaws.com` references anywhere in the target DB.

**Public read access:** the new Spaces bucket defaults to private (confirmed via a 403 on a repointed URL), but the app constructs plain public HTTPS URLs with no signing — so objects need to be publicly readable the same way the original (intendedly public, if actually-broken) S3 setup was. `PutBucketPolicy` on Spaces returned `AccessDenied` (Spaces doesn't support bucket policies via the readwrite-scoped key the same way S3 does) — used per-object `public-read` ACLs instead (`aws s3api put-object-acl`, then `aws s3 sync --acl public-read` for the re-uploaded local files), applied to all 210 objects in parallel. Verified with spot-check HTTPS GETs (200 OK) on both a legacy and a local-origin object.

**End state:** legacy S3 (204 objects) and local uploads (6 objects) are both in DO Spaces, all 210 publicly readable, database fully repointed with zero dangling AWS references. **Phase 3 (data migration) is now fully complete for both database and storage** — this supersedes the earlier partial Gate 2 report.

---

## 2026-07-25 — Phase 4: Application changes + deploy (user said "go ahead")

**Branch:** created `migrate/digitalocean` off `master` (unrelated pre-existing uncommitted changes in the working tree — a file reorg — were left untouched, not staged/committed).

**Code changes** (`lib/storage.ts`, `app/api/upload/presign/route.ts`):
- Added optional `S3_ENDPOINT` support to `S3StorageProvider`'s `S3Client` construction (`forcePathStyle: false`) so it can target DO Spaces instead of AWS S3; unset behavior is unchanged (still talks to AWS).
- Added a shared `getS3PublicUrl(bucket, region, key)` helper (exported from `lib/storage.ts`) used by both the storage provider and the presign route, so the public URL format (AWS vs Spaces) only needs to be right in one place.
- Set `ACL: "public-read"` on `PutObjectCommand` in the regular upload path (`S3StorageProvider.upload()`) — Spaces defaults to private, and the app relies on plain public URLs with no signing.
- Deliberately did **not** add `ACL` to the presigned-upload route (`app/api/upload/presign/route.ts`): that would become a signed header the client's direct PUT must match exactly, and the client currently only sends `Content-Type`. Left a comment explaining this; objects uploaded via that path (rare — only `.exr`/`.hdr` environment files) would need their ACL set after upload if they need to be public.
- Typechecked clean (`npx tsc --noEmit`), committed (`91c479a`), pushed to `origin/migrate/digitalocean`.

**App spec (`aradre-app`) — wired all remaining env vars:** `NEXTAUTH_URL` (via DO's built-in `${APP_URL}` binding), `NEXTAUTH_SECRET`/`ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`/`RESEND_API_KEY`/`RESEND_FROM_EMAIL` (values reused as-is from the existing `.env.production`), `RESEND_TO_EMAIL`/`NEXT_PUBLIC_MAP_LAT`/`LNG`/`ZOOM` (these 4 aren't actually set in `.env.production` at all — production has been relying on the code's hardcoded fallbacks this whole time, which exactly match `.env.example`'s values, so used those same values explicitly rather than leaving them unset), `STORAGE_PROVIDER=s3` + `S3_BUCKET`/`S3_REGION`/`S3_ENDPOINT`/`S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` (pointed at the DO Spaces credentials created in Phase 2, **not** the old AWS ones). Added a `PRE_DEPLOY` job running `npx prisma migrate deploy`, matching the pattern already used by the unrelated sibling app in this account. No `PLATFORM` var set — `lib/platform.ts`'s AWS Lambda env-var detection simply won't match on DO, which correctly resolves it to `"local"` mode by default; confirmed this needs no code change.

**Three real bugs found and fixed during first deploy attempts (not caused by this session's spec edits — pre-existing from when the user first created `aradre-app`, except the third):**
1. **`DATABASE_URL` binding pointed at the wrong database.** The pre-existing spec used `${production-database.DATABASE_URL}`, but the actual database resource in the spec is named `aradre-com-pg` — the binding name didn't match anything, and DO's own database binding always resolves to the cluster's default `defaultdb`, not the `real_estate_index` database this session actually restored data into. Fixed by replacing the binding with an explicit `DATABASE_URL` (host/user/password from `.env.digitalocean`, dbname `real_estate_index`, `sslmode=require`), marked `type: SECRET`.
2. **Database firewall didn't trust the app at all.** Still only allowed the temporary admin-IP rule from Phase 2. Every deploy's `PRE_DEPLOY` migrate job failed with `P1001: Can't reach database server`. Fixed with `doctl databases firewalls append <cluster> --rule "app:<app-id>"` (kept the admin-IP rule alongside it for now).
3. **Deployed code didn't include this session's fixes at all.** The app deploys from `github: branch: master` on `OITT2022/real-estate-index` — but this session's `lib/storage.ts`/presign changes only existed locally, uncommitted, on `migrate/digitalocean`. First "successful" deploy (per DO) was still running the pre-migration code, confirmed via the `/api/health` endpoint's `s3Upload` check failing with `getaddrinfo ENOTFOUND aradre-assets.s3.fra1.amazonaws.com` (the old hardcoded AWS-only hostname pattern). Fixed by committing + pushing to `origin/migrate/digitalocean`, then updating the app spec's `github.branch` to `migrate/digitalocean` for both the service and the migrate job — this matches the playbook's parallel-run model: production (Amplify) keeps serving from `master`, untouched, while the DO app tracks the migration branch until actual cutover.

**Final verification — live and healthy:**
- `/api/health` returns `"status":"healthy"` — DB connected (to `real_estate_index`, confirmed via the migrate job's own log line), `s3Upload`/`s3Delete` both `OK` against the real Spaces bucket.
- Smoke-tested `/`, `/admin/login`, `/contact`, `/map`, `/projects`, `/api/health` — all `200`. (`/properties` alone is a `404` — expected, that route doesn't exist; only `/properties/[slug]` does, confirmed from the build's own route list.)
- `/projects` page HTML contains real `*.digitaloceanspaces.com/uploads/...` image URLs from the migrated data, and one was fetched directly — `200`, 4.3 MB, loads fine.
- Live app URL: `https://aradre-app-qlrxa.ondigitalocean.app`.

**Status: Phase 4 complete, app fully live and verified on DigitalOcean (App Platform + Managed Postgres + Spaces), deploying from `migrate/digitalocean`.** No AWS resource touched or modified this phase. Next: broader Phase 5 testing (login flow exercised as a real user, admin file-upload UI, Hebrew/UTF-8 rendering, side-by-side comparison with AWS prod) before Gate 3 / cutover.

---

## 2026-07-25 — Phase 5: Testing on DO (user said "go ahead")

Production AWS domain confirmed as `aradre.com` (from `.env.production`'s `NEXTAUTH_URL`). All comparisons below are `aradre.com` (AWS, live production) vs `https://aradre-app-qlrxa.ondigitalocean.app` (DO).

**Status code parity** — `/`, `/contact`, `/map`, `/projects`: all `200` on both sides, identical.

**Response time** — comparable, DO if anything faster in this single-sample check (`/`: AWS 0.40s vs DO 0.30s; `/projects`: 0.36s vs 0.18s; `/map`: 0.37s vs 0.18s). Not a rigorous load test, just a sanity check per the playbook's ask — worth a longer soak test before actual cutover if the user wants more confidence.

**Content equivalence** — scraped the `/projects` listing page on both and diffed the set of linked project slugs: **identical** (`by-the-sea-1`, `by-the-sea-2`, `eden-house`, `the-legend`, same order). Confirms the migrated database snapshot matches live production as of the Phase 3 migration time — this is a point-in-time snapshot, not a live sync; any edits made on AWS after the Phase 3 dump won't show up on DO until a final delta sync at actual cutover (Phase 6).

**Auth flow** — didn't attempt to log in with `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` for real: those are dev-seed values, not necessarily valid for any of the 4 real `AdminUser` rows in the migrated data (their passwords may have changed since seeding), and guessing at real credentials isn't appropriate. Instead verified the *mechanism* is equivalent on both platforms:
- Invalid-credential login attempt: `401` on both.
- Unauthenticated `/admin/dashboard`: `307` redirect to `/admin/login?callbackUrl=...` on both, byte-identical redirect pattern.
- Unauthenticated `POST /api/upload/presign`: `401` on both.

**File upload/download** — not tested via the authenticated admin UI (no valid session available), but already exercised directly: `/api/health`'s `s3Upload`/`s3Delete` checks (Phase 4) perform a real `PutObject`+`DeleteObject` through the exact same `getStorage()` code path the admin UI uses, against the real Spaces bucket — both `OK`.

**Hebrew/UTF-8** — checked the `Property`/`SiteSetting` data for any multi-byte (non-ASCII) content to test against: **none found**. Cross-checked recent git history (`i18n B`/`i18n B'` commits, all reverted) — the app currently has no active Hebrew localization; it's English-only (`lang="en"`) on both platforms today. Confirmed `Content-Type: text/html; charset=utf-8` matches on both sides regardless. This playbook checklist item has nothing Hebrew to actually verify against right now — noting rather than fabricating a pass.

**Not done / open before Gate 3:**
- No sustained load test (single-request timing only).
- No real authenticated-session walkthrough of the admin UI (blocked on not having valid admin credentials — the user would need to either share one or test this manually themselves).
- Legacy S3 bucket's very slight discrepancy noted in Phase 3 (one `backup.sql`-referenced key, `uploads/1775390190057-feidn3.png`, returned 404 in the source bucket — that specific historical object is gone regardless of platform) — not a migration defect, already excluded from the repointed set since it wasn't in the source to begin with.

**Status: Phase 5 automated/HTTP-level testing complete, DO and AWS are behaviorally and content-equivalent for everything checked.** Ready for user review before ✋ **Gate 3** (final go/no-go on DNS cutover) — not proceeding to Phase 6 without that.

---

## 2026-07-25 — ✋ Gate 3 + Phase 6: DNS Cutover

**Gate 3:** user asked to "pass the domain to digital ocean from AWS" and, when asked, confirmed doing it now rather than scheduling a low-traffic window ("no need to wait"). Re-checked row counts on both databases immediately before cutover — **zero drift** since the Phase 3 migration, so no last-minute delta sync was needed.

**Discovery — DNS provider clarified:** `aradre.com`'s authoritative nameservers are **Cloudflare** (`fay`/`lee.ns.cloudflare.com`), not Route 53 — "cloudfrae tunnel" in the request was CloudFront, confirmed via response headers (`Via: CloudFront`, `X-Amz-Cf-Id`). No Cloudflare Tunnel (cloudflared) involved. TTL on the relevant records was already `1` ("Auto", effectively minimal) — no 48h pre-lowering needed.

**Custom domain added to the DO app (safe prep, done before any DNS change, zero live-traffic impact):** added `aradre.com` (PRIMARY) and `www.aradre.com` (ALIAS) to the `aradre-app` spec. DO began automated TLS cert issuance/domain validation, which stayed pending until DNS actually pointed there (expected).

**Cloudflare API token:** user's first two token attempts both failed live verification (`Invalid API Token` from Cloudflare's own `/user/tokens/verify` endpoint) — not a storage/parsing issue on this end (verified length/structure). Third token verified successfully (zone permissions: `dns_records:edit`, `dns_records:read`, `zone:read`). Stored in a new gitignored `.env.cloudflare` (added to `.gitignore`), never echoed back or logged.

**Zone audit before touching anything — found the zone carries far more than the web app:** Microsoft 365/Exchange Online mail routing (MX to `...mail.protection.outlook.com`, `autodiscover`/`enterpriseenrollment`/`enterpriseregistration`/`lyncdiscover`/`sip*`/`_sipfederationtls._tcp` CNAME/SRV records), Resend's DKIM/SPF/DMARC TXT records (`resend._domainkey`, `_dmarc`, SPF), an Amazon SES-related `send.aradre.com` MX/TXT pair, an ACM certificate-validation CNAME for the old CloudFront cert, and even NS records inside the zone pointing at the domain's original registrar (GoDaddy). **None of this was touched** — only the two records that actually route web traffic were changed:

| Record | Before | After |
|---|---|---|
| `aradre.com` CNAME (id `f330410fb14baa8ae56ed1e884faa522`) | `d24zuyklkwb20k.cloudfront.net` | `aradre-app-qlrxa.ondigitalocean.app` |
| `www.aradre.com` CNAME (id `44309f661eb86ae4aab990fab7cca179`) | `d24zuyklkwb20k.cloudfront.net` | `aradre-app-qlrxa.ondigitalocean.app` |

Both kept `proxied: false` (DNS-only) and `ttl: 1` (Auto), matching their pre-existing configuration exactly — only the `content` target changed. **Rollback, if ever needed: set `content` back to `d24zuyklkwb20k.cloudfront.net` on both records** (same API, same record IDs) — AWS Amplify/CloudFront/RDS/S3 remain fully live and untouched throughout, per playbook principle 1.

**Verification after cutover:**
- Briefly saw HTTP `526` on `aradre.com` right after the DNS change — diagnosed as expected/transient: DO's own default ingress hostname resolves through the same Cloudflare-powered edge, and the 526 was DO's certificate for the *custom* domain not being issued yet, not a DNS misconfiguration. Confirmed by hitting the `.ondigitalocean.app` hostname directly (200 OK) while `aradre.com` still 526'd.
- DO's domain phase for `aradre.com` moved to `ACTIVE` within roughly a minute of the DNS change; `www.aradre.com` followed shortly after.
- Re-ran the full smoke test against the real domain: `/`, `/admin/login`, `/contact`, `/map`, `/projects`, `/api/health` all `200`.
- `/api/health` on `https://aradre.com` reports: database connected, `NEXTAUTH_URL` correctly reflects `https://aradre.com` (via the `${APP_URL}` binding), `s3Upload`/`s3Delete` both `OK` against the real Spaces bucket.

**Status: aradre.com and www.aradre.com are now live on DigitalOcean.** AWS Amplify/RDS/S3 remain running, untouched, available for instant rollback.

**Post-cutover monitoring (partial — not a full 60 minutes):** checked run logs and `/api/health` twice, a few minutes apart, immediately after cutover — clean both times (no errors in logs, DB connected, S3 upload/delete OK, `/`, `/projects`, `/contact` all 200). A genuine sustained 60-minute watch wasn't done via blocking sleep in this session; if the user wants continuous automated monitoring over the full window, that would need a scheduled/looped check rather than this session idling.
