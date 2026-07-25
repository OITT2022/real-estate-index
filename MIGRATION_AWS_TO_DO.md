# תוכנית מעבר מ-AWS ל-DigitalOcean — Playbook לקלאוד קוד

מסמך זה נועד לשבת בשורש של כל ריפו/מערכת שנטענת ל-VS Code.
ההוראה לקלאוד קוד: **"קרא את MIGRATION_AWS_TO_DO.md ובצע את השלבים לפי הסדר"**.

---

## עקרונות-על (חובה, לא ניתנים לעקיפה)

1. **AWS נשאר חי עד סוף התהליך.** אסור לקלאוד למחוק, לכבות או לשנות משאב כלשהו ב-AWS. כיבוי AWS נעשה ידנית, לפחות 14 יום אחרי Cutover מוצלח.
2. **הרצה במקביל (Parallel Run).** המערכת קמה במלואה ב-DigitalOcean, נבדקת, ורק אז מעבירים DNS.
3. **שערי אישור.** קלאוד עוצר ומחכה לאישור מפורש שלי בסוף שלבים 1, 3 ו-6. אסור להמשיך בלי "מאושר".
4. **אפס סודות בקוד.** מפתחות וסיסמאות רק ב-`.env` (שנמצא ב-`.gitignore`) או ב-environment של קלאוד קוד. אסור להדפיס סודות לצ'אט או ללוגים.
5. **כל שלב מתועד** בקובץ `MIGRATION_LOG.md` בריפו: מה בוצע, פקודות, תוצאות, בעיות.
6. **מגבלת Windows:** ל-DigitalOcean אין Droplets של Windows. אם ה-Discovery מגלה תלות ב-IIS / Classic ASP / ASP.NET Framework / SQL Server on Windows — קלאוד עוצר, מסמן את המערכת כ"לא ניתנת להעברה כמות שהיא", ומציע חלופות (containerization, שכתוב ל-.NET Core על Linux, או השארה ב-AWS). SQL Server כן אפשרי ב-DO רק כקונטיינר Linux על Droplet — לא כ-Managed Database.

## מיפוי שירותים

| AWS | DigitalOcean | הערות |
|---|---|---|
| EC2 (Linux) | Droplet | לבחור גודל לפי שימוש בפועל, לא לפי הגודל הקיים |
| ECS / Docker on EC2 | App Platform או Droplet+Docker | App Platform פשוט יותר; Droplet גמיש יותר |
| RDS MySQL/PostgreSQL | Managed Database | תמיכה ב-MySQL, PostgreSQL, Redis (Valkey), MongoDB |
| RDS SQL Server | ❌ אין Managed | רק SQL Server 2019+ Linux בקונטיינר, או להשאיר ב-AWS |
| S3 | Spaces | תואם S3 API — בדרך כלל רק שינוי endpoint + credentials |
| CloudFront | Spaces CDN / Cloudflare | אם כבר יש Cloudflare — עדיף להשתמש בו |
| Route 53 | DO DNS או Cloudflare | אם הדומיינים ב-Cloudflare — לא נוגעים, רק משנים רשומות |
| ELB/ALB | DO Load Balancer | רק אם באמת יש יותר משרת אחד |
| Lambda | DO Functions | לרוב עדיף להטמיע כ-endpoint באפליקציה |
| SES | להישאר ב-SES או SMTP חיצוני | DO חוסמים port 25 כברירת מחדל — לא לתכנן שליחת מייל ישירה מ-Droplet |
| IAM / Secrets Manager | .env + DO project | אין מקבילה מלאה — לתעד כל secret שהועבר |

## דרישות מקדימות (פעם אחת, לא פר מערכת)

```bash
# CLI לשתי הפלטפורמות
aws --version          # aws cli v2
doctl version          # doctl מאומת: doctl auth init
doctl account get      # אימות שהחיבור עובד

# כלי העברת קבצים S3→Spaces
rclone version         # ולהגדיר שני remotes: aws-s3 ו-do-spaces
```

ב-DigitalOcean: ליצור Project ייעודי (למשל `migration-2026`), מפתח SSH, ו-VPC לכל droplet/DB.

---

# MASTER PROMPT — מה שקלאוד קוד מבצע פר מערכת

> The following phases are executed in order. Stop at every ✋ APPROVAL GATE and wait for the word "מאושר" from the user before continuing. Log every action to MIGRATION_LOG.md.

## Phase 0 — Discovery (read-only)

1. Scan the repo: languages, frameworks, runtime versions, package manifests, Dockerfiles, build/deploy scripts, cron jobs.
2. Find every AWS touchpoint: SDK imports, connection strings, `s3://` URLs, RDS endpoints, env vars (`AWS_*`), IAM roles, SES usage, hardcoded regions/ARNs.
3. Query live AWS (read-only) for this system: `aws ec2 describe-instances`, `aws rds describe-db-instances`, `aws s3 ls` + bucket sizes, security groups, attached domains in Route 53.
4. Measure: DB size and engine version, S3 data volume and object count, instance size vs. actual CPU/RAM usage (CloudWatch, last 30 days), inbound ports.
5. **Windows check:** if the system requires IIS / Classic ASP / .NET Framework / Windows-only SQL Server → STOP, report, propose alternatives. Do not proceed.

**Output:** `MIGRATION_INVENTORY.md` — full inventory table.

## Phase 1 — Migration Plan

Based on the inventory, produce `MIGRATION_PLAN.md` containing:
- Target architecture on DO (droplet size/region — prefer `fra1` or `ams3` for Israel latency, managed DB tier, Spaces bucket, firewall rules, VPC).
- Exact code changes required (endpoints, env vars, SDK config).
- Data migration method: DB (dump/restore vs. logical replication for near-zero downtime) and storage (rclone sync strategy).
- Estimated monthly cost on DO vs. current AWS cost.
- Downtime estimate for cutover, rollback plan, risks.

✋ **APPROVAL GATE 1** — wait for approval of the plan.

## Phase 2 — Provision DigitalOcean

Using `doctl` (idempotent — check existence before creating):
1. Droplet(s) / App Platform app, inside a VPC, with the SSH key.
2. Managed Database — create, then restrict trusted sources to the droplet/VPC only.
3. Spaces bucket + access keys.
4. Cloud Firewall: allow 22 (my IP only), 80, 443. Nothing else.
5. On the droplet: OS updates, runtime installation, nginx (or Docker), certbot ready but not yet issuing (DNS not pointed yet).
6. Record all resource IDs, IPs, connection strings (secrets → `.env` only) in MIGRATION_LOG.md.

## Phase 3 — Data Migration (initial)

**Database:**
1. Full dump from RDS (`pg_dump` / `mysqldump --single-transaction`), sizes and duration logged.
2. Restore to DO Managed DB.
3. Verify: row counts per table on both sides must match; compare schema (tables, indexes, FKs); run 3–5 sanity queries and diff results.

**Storage:**
1. `rclone sync aws-s3:bucket do-spaces:bucket --checksum --progress` (initial pass may be long).
2. Verify with `rclone check` — zero differences required.

✋ **APPROVAL GATE 2** — present verification results.

## Phase 4 — Application Changes

1. Create branch `migrate/digitalocean`.
2. Replace endpoints/config: DB connection string, S3 endpoint → `https://<region>.digitaloceanspaces.com`, region, credentials via env vars.
3. Anything AWS-specific (SES, SQS, Lambda calls) — implement the replacement agreed in the plan.
4. Deploy to the DO droplet/App Platform. App must run fully against DO resources only — zero calls to AWS (verify via logs/netstat).

## Phase 5 — Testing on DO

1. Smoke tests via droplet IP / temporary subdomain (e.g. `do.<domain>`): login, main flows, file upload+download (Spaces), DB writes, Hebrew/UTF-8 content renders correctly.
2. Compare a sample of pages/API responses between AWS prod and DO — must be equivalent.
3. Load-sanity: response times comparable to AWS.
4. Fix until green. Log everything.

## Phase 6 — Cutover

1. **48h before:** lower DNS TTL of relevant records to 300s.
2. Freeze window: schedule with user (low-traffic hours).
3. Final delta sync: re-run `rclone sync`; re-sync DB delta (or brief read-only window + final dump/restore of changed data). Verify again.
4. Issue TLS certs (certbot) once DNS is ready to switch, or pre-issue via DNS-01.

✋ **APPROVAL GATE 3** — final go/no-go.

5. Switch DNS A/CNAME records to DO.
6. Monitor 60 minutes: error logs, response codes, DB connections.
7. **Rollback if needed:** switch DNS back to AWS (everything there is untouched).

## Phase 7 — Post-Cutover

1. 48h monitoring checklist; confirm cron jobs, emails, backups (enable DO DB backups + droplet snapshots).
2. Update CI/CD (GitHub Actions) to deploy to DO instead of AWS.
3. Merge `migrate/digitalocean` to main.
4. Write final summary in MIGRATION_LOG.md, including AWS resources that are now safe to decommission — **but do not touch them**. Decommission is manual, by the user, after ≥14 days.

---

## צ'קליסט פר מערכת (למעקב שלך)

- [ ] Phase 0 — Inventory הופק
- [ ] Phase 1 — תוכנית אושרה
- [ ] Phase 2 — משאבי DO הוקמו
- [ ] Phase 3 — נתונים הועברו ואומתו
- [ ] Phase 4 — קוד הותאם ונפרס
- [ ] Phase 5 — בדיקות עברו
- [ ] Phase 6 — Cutover בוצע
- [ ] Phase 7 — ניטור 48ש׳ + CI/CD עודכן
- [ ] +14 יום: כיבוי AWS (ידני)
