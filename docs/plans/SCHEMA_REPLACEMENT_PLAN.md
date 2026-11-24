# Schema replacement plan — July rewrite becomes the production schema

**Date:** 2026-11-19 · **Decision:** product owner — replace the old production schema with the July
rewrite · **Status:** Plan; nothing has been changed in the database or code yet

> **Update 2026-11-24 — CLEAN START (supersedes steps S1, S4, S6 and baselining below).**
> The owner confirmed the current production deployment is trial-and-error only and its data can be
> lost. So instead of migrating data, production is **wiped once** and rebuilt from a single fresh
> migration, `prisma/migrations/20261124000000_init`. The data-preserving migration and the old history
> are archived in `prisma/migration-drafts/archive-pre-clean-start/` for reference only. The sections
> below are kept as a record of the analysis.
>
> **Clean-start deploy, step by step**
> 1. (Optional, recommended) take a Railway backup of the current database to look at later.
> 2. **Wipe** the production database (owner confirms at the time; irreversible).
> 3. Merge PR #1 and deploy. `npm start` → `scripts/init.js` applies `20261124000000_init`,
>    applies the idempotent `apply-migration.js`, seeds 27 starter passages as **DRAFT**, then starts.
> 4. SMEs approve a first set of passages and speaking topics. Until then students see
>    "no approved passages yet".
> 5. Smoke test: school PIN login, B2C login, teacher/admin, certificates, referral links.
>
> Tested locally on an empty database (2026-11-24): migration applies, start-up succeeds and is
> re-runnable, 27 passages seeded as DRAFT, database matches the schema exactly. Also removed the
> enum pre-step (`scripts/create-enums.sql`), which made a fresh `migrate deploy` fail.

## Why this needs a plan, not a swap

| Fact (checked 2026-11-19) | Consequence |
|---|---|
| Production runs the committed schema (`git show HEAD:prisma/schema.prisma`) and holds real data: B2C and school students, badges, certificates, sessions, emails, referrals | Data must be moved, not dropped |
| The working copy deletes all committed migration files and adds one new `20260629153127_init` | `prisma migrate deploy` on Railway (run by `postbuild`) cannot apply a fresh `init` to a database that already has tables. The deploy fails, or a reset would delete production data |
| The July rewrite drops 18 production tables still used by the code: `Admin` (4 files), `Certificate` (12), `VerificationCode` (3, OTP login), `Referral` (5), `ReferralReward`, `NotificationPreference` (3), `SentEmail` (5), `EmailLog` (3), `EmailClick`, `EmailSchedule`, `EmailVariantTest`, `ParentEmailPreference` (3), `SchoolSubscription` (2), `SchoolAdmin` (2), `SchoolInvite`, `SchoolLeaderboardSnapshot`, `ConversationTopic` (10), `SpeakingProgress` (5), `SpeakingPreference` (3), `Manager` (4), `BetaFeedback` (4), `LeaderboardSnapshot` (3), `BadgeVariantLog` (4), `BadgeColorVariant`, `ConversionFunnel` (4) | Those features would break. Each must be ported into the new schema or deliberately retired |
| `npx tsc --noEmit` against the working-copy schema: **422 errors in 84 files** (largest: `app/api/teacher` 38, `app/api/admin` 35, `app/api/auth` 26, `app/api/manager` 21, badge tests 97) | The app must be updated alongside the schema |

## Target

**Target schema = July rewrite + production models still in use + Phase 1 additions**
(practice budget, activity log, vocabulary, questions, stages, SME review and monitoring).

## Owner sign-off (2026-11-19)

All rows of the field map below are **approved**. Notes:
- Row 1: school students log in with admission number + PIN. B2C keeps today's login for now; WhatsApp / SMS OTP login for B2C is a later piece of work.
- Row 8: all 12 tables are copied over unchanged (including the A/B-test tables).

## Steps

| # | Step | Est. | Done when |
|---|---|---|---|
| S1 | **Back up production** (`pg_dump` from Railway) and test-restore it into a staging database | 0.5d | Restored copy row counts match production |
| S2 | **Decide each overlapping model** (table below) and each production-only model: port or retire | 1d (with owner) | Signed-off field map |
| S3 | **Write the target schema** in `prisma/schema.prisma` | 2d | `prisma validate` passes |
| S4 | **Restore the committed migration history** (`git checkout -- prisma/migrations`), remove the stray new `init`, and generate **one forward migration** from the production schema to the target, with SQL that copies and transforms data (e.g. `Student.classId` → `Enrollment` rows, `ConversationTopic` → `SpeakingTopic`, `BadgeType` enum → stage badges) | 3d | Migration applies cleanly to the staging copy |
| S5 | **Update the app code** to the new models; get `tsc` to 0 errors and tests green | 4–5d | `npx tsc --noEmit` clean; `npm test` green |
| S6 | **Rehearse on staging** using the production copy. Check: B2C login (`userId` + password), school login (admission number + PIN), OTP, existing badges/certificates visible and verifiable, teacher dashboard, manager/wizadmin login, row counts per table before and after | 1d | Rehearsal checklist all green |
| S7 | **Cut over** in a low-traffic window: fresh backup, deploy, smoke test. **Rollback** = restore the S7 backup and redeploy the previous commit | 0.5d | Production on new schema; smoke test green |

**Total ≈ 12–13 dev-days.** This becomes task **1.0** of Phase 1 and must finish before task 1.1.

## Overlapping models to reconcile in S2

| Concept | Production (old) | July rewrite | Suggested |
|---|---|---|---|
| Student login | `admissionNumber` + `pin` (school), `userId`/`phone` + `passwordHash` (B2C), `accountType`, `loginType` | `email`/`phone`/`userId` + `passwordHash` | Keep **both** login paths; add `admissionNumber`, `pin`, `accountType` to the new `Student` |
| Student ↔ class | `Student.classId` | `Enrollment` table | Use `Enrollment`; migrate each `classId` to one row |
| Admin / managers | `Admin` (principal, academic in-charge, per school), `Manager` (Edvanta) | `GlobalManager` | Keep school `Admin`; merge `Manager` into `GlobalManager` (or keep `Manager`) and add the `SME` role |
| Speaking content | `ConversationTopic` + `SpeakingProgress` + `SpeakingPreference` | `SpeakingTopic` | Migrate topics into `SpeakingTopic`; keep `SpeakingPreference` (voice settings) |
| Passages | `ReadingPassage.gradeBand` + `level` 1–3 | `level` only | Add `stage`, `internalLevel` (e.g. "2.2"), `gradeBand` kept for age context; set from [PD-003](../decisions/PD-003-stage-names-and-level-mapping.md) |
| Badges | `BadgeType` enum (5 wizard badges) + `Certificate` | `Badge.type` string | Keep `Certificate`; keep earned badges; stage badges per PD-003 |
| Leaderboards | `Leaderboard`, `LeaderboardSnapshot`, `SchoolLeaderboardSnapshot` | `Leaderboard` | Keep for B2C; school mode off by default |
| Email, referrals, funnel, beta, subscriptions | 12 tables | — | Port as-is unless the owner retires a feature |
| Telugu/Hindi add-on (new) | — | — | `Student.supportLanguage` (`NONE`/`TE`/`HI`), `Class.medium`, B2C add-on purchase record; glosses carry their own review status |

## Risks

- **Data loss** if anyone runs `prisma migrate reset` or `db push --accept-data-loss` against
  production. Only S4's forward migration may touch production.
- **Login breakage** for school students if the admission number + PIN path is lost. S6 tests it explicitly.
- **Certificate verification links** (`/certificate/[verifyCode]`) already shared publicly must keep
  working. Keep codes unchanged.

## S3 result (2026-11-19)

- Target schema written to `prisma/schema.prisma`; `prisma validate` passes. The July rewrite is
  kept at `prisma/schema.july-rewrite.prisma.bak`.
- **Teacher** was not in the signed field map. It follows the same "keep both" rule as row 1:
  production `empCode` + `pin` login kept, July email/password added as optional.
- Model names: production `Manager` kept (merged with July `GlobalManager`), reading sessions stay
  `Student.sessions`, to minimise code changes.
- Offline diff (production → target, no database touched):
  `prisma/migration-drafts/prod_to_target.AUTO_DIFF_DO_NOT_RUN.sql`. It is **not safe to run as-is**.
  S4 must hand-edit these points:

| # | Auto-diff does | Would cause | S4 must instead |
|---|---|---|---|
| 1 | `DROP COLUMN "classId"` on Student | Every school student loses their class | Insert one `Enrollment` row per student with a `classId` **before** dropping the column |
| 2 | `DROP TABLE "ConversationTopic"` | All speaking topics lost; speaking sessions orphaned | Copy rows into `SpeakingTopic` **keeping the same ids**, re-point the `SpeakingSession` foreign key, then drop |
| 3 | Badge `DROP COLUMN "type"` + `ADD COLUMN "type" TEXT NOT NULL` | Every earned badge loses its type (and the add fails on a non-empty table) | `ALTER COLUMN "type" TYPE TEXT USING "type"::text` |
| 4 | `ADD COLUMN "updatedAt" … NOT NULL` with no default (Teacher, Class, Student, ReadingPassage, …) | Fails on any table with rows | Add with `DEFAULT CURRENT_TIMESTAMP`, then drop the default |
| 5 | New `status` on ReadingPassage / SpeakingTopic defaults to `DRAFT` | All live passages and topics vanish for students (only `APPROVED` is served) | **Owner decision 2026-11-19: keep as DRAFT.** Old content comes back only after SME approval. Accounts, badges and certificates are kept |

## S4 result (2026-11-19)

- July `init` migration moved out of the way to `prisma/migration-drafts/july_rewrite_init/`.
  Committed migrations restored from git.
- New migration: `prisma/migrations/20261120000000_target_schema/migration.sql`
  (auto-diff + the 5 hand fixes).
- **Tested on a throwaway local Postgres** built from the committed production schema and seeded
  with sample data (school and B2C students, classes, badges, certificates, passages, speaking topics
  and sessions):
  - migration applied in one transaction without errors
  - 3/3 class memberships moved to `Enrollment`
  - speaking topics copied with the same ids; speaking sessions still linked
  - badges and certificates intact; certificate `verifyCode`s unchanged
  - school (admission number + PIN) and B2C (`userId`, shared phone) login fields intact
  - old passages/topics now `DRAFT`, per decision
  - `prisma migrate diff` from the migrated DB to `prisma/schema.prisma`: **empty**, so it matches the
    target exactly
- **Finding:** the committed migration history does **not** apply cleanly to an empty database
  (`20260619_update_student_for_b2c` and `20260623_add_b2c_userid_fields` fail). Production was
  probably partly built with `db push`. So the real production structure, and its
  `_prisma_migrations` table, must be checked on the **S1 backup** before S7. The rehearsal (S6)
  must run on that backup, not on the sample database.

## S5 result (2026-11-20)

**App code updated for the target schema.** Type errors 422 → 224; none of the remaining 224 are
schema-related (see "Older bugs still open" below). The build already ignores type errors
(`next.config.ts`), so the real test was running the app.

**Live test:** the app was run against the migrated local test database (sample school + B2C data).
Passing: school student login (admission no. + PIN) and wrong-PIN rejection; teacher and admin PIN
login; `/api/auth/me` for school (cookie) and B2C (token); passages and speaking topics serve only
`APPROVED` content (unapproved → clean 404); teacher class view; admin stats; school landing badge
counts; leaderboards; student progress; certificate download; certificate pages for school **and** B2C
students; referral links; manager self-signup blocked; deactivated SME cannot log in.

**What changed**
- New helpers: `lib/student-class.ts` (class via `Enrollment`), `lib/content-status.ts`
  (approved-only filters for student-facing content).
- Class links moved to `Enrollment` in ~25 routes/libs; `conversationTopic` → `speakingTopic`;
  `globalManager` → `manager`; phone lookups → `findFirst` (phones are shared by siblings).
- `STORY_WIZARD` added to every badge table, marked unreleased: hidden from badge lists and never
  awarded until the stage system (task 1.8). Grand Wizard still needs the original four badges.
- Schema: `Teacher.schoolName` and `Student.currentLevel` (July fields the code uses) added; the
  migration was regenerated (`scripts/make-target-migration.py`) and re-verified (diff to schema empty).

**Regressions in the July rewrite, found and fixed**
- School / teacher / admin **PIN login had been removed** from `/api/auth/login` → restored.
- `getSession()` had been **stubbed to always return null**, logging out every cookie-based school
  session (21 call sites) → restored the production implementation.
- `/api/auth/me` had **lost cookie auth and teacher/admin support** → restored; secrets no longer returned.
- B2C tokens carry no `role`, so student routes rejected them → `getAuth` now treats them as student tokens.
- Public manager signup would have written into the production `Manager` table → disabled unless
  `ALLOW_MANAGER_SIGNUP=true`; July manager login now checks `isActive`.

**Older production bugs found and fixed along the way**
- Public **certificate pages returned HTTP 500 for everyone** (server component with `onClick`) →
  print button moved to a client component. B2C certificates (no class) also crashed → handled.
- **Referral links never worked** (Next 16 `params` not awaited; `redirect()` swallowed by try/catch)
  → fixed; B2C referrals go to `/login?ref=…`, school referrals to the school landing page.
- `/api/content/*` routes always returned 401 (passed the request as a token) → fixed.
- `create-profile` / `signup-password` wrote fields that never existed → mapped to real fields.
- `/api/progress/:id` returned `pin` and `passwordHash` to the browser → removed.

**Older bugs still open (not schema-related, not fixed)**
- Zod v4: routes read `error.errors` (now `error.issues`) and a validation helper's `.error` without
  narrowing — validation-error responses may break.
- `request.ip` (removed in recent Next) used for rate limiting in OTP/feedback routes.
- `lib/email-analytics.ts` uses a `clicks` relation that doesn't exist (`emailClicks`).
- `lib/speaking-preference.ts` uses Gender values `OTHER`/`NEUTRAL` that the enum doesn't have.
- `app/student/leaderboards` calls `/api/student/profile`, which doesn't exist.
- `/api/teacher/class/:id` lets any logged-in teacher view any class (no ownership check) and returns PINs.
- Two password-hash schemes share the `Manager` table (bcrypt in the production login, PBKDF2 with a
  fixed salt in the July login) — an account made by one can't log in through the other.
- **Tests:** 10/10 suites fail for setup reasons (Prisma mocks undefined, no jsdom, `setup.ts` run as a
  suite, one integration test needs a real DB) — same failure modes, unrelated to the schema.

## Deploy startup path (2026-11-24)

- Railway runs `npm start` (`railway.json` overrides the Dockerfile) → `scripts/init.js`, which runs
  `scripts/sync-db.js` (enums + `prisma migrate deploy`), `scripts/apply-migration.js` and
  `scripts/seed-direct.js`, then starts Next.
- **All `prisma db push --accept-data-loss` fallbacks removed** (`init.js`, `sync-db.js`,
  `docker-entrypoint.sh`, `nixpacks.toml`). `npm start` is now `init.js && next start`: if migration
  fails, the app does not start and the previous deployment keeps serving.
- `apply-migration.js` was not re-runnable (`ADD CONSTRAINT "Student_userId_key"` fails once the
  index exists), so in production it has probably failed on **every** start and triggered the
  `db push` fallback each time. Made idempotent.
- `seed-direct.js` aligned with the new schema (`updatedAt`; topics now in `SpeakingTopic`).
- Tested on a local copy migrated to the target schema: without migration history,
  `migrate deploy` stops with **P3005** and the app doesn't start, data unchanged; after baselining,
  startup succeeds twice in a row and the database still matches the schema.

### S6 must include baselining

If production has no (or an incomplete) `_prisma_migrations` table, which is likely given the
`db push` history, the deploy will stop at P3005. On the restored backup, S6 must:
1. inspect `_prisma_migrations` and compare the real structure with the committed `main` schema;
2. mark the old migrations as applied: `prisma migrate resolve --applied <name>` for each
   migration before `20261120000000_target_schema`;
3. fix any differences between the real structure and `main`'s schema by hand;
4. then run `prisma migrate deploy` (applies only the target migration) and the full S6 checks.

## Still a deployment risk today

S5 is done, but S6 (rehearsal on a **real production backup**) is not. The real production structure
may differ from git (see S4 finding). **Do not deploy this working copy to Railway until S6 passes.**
