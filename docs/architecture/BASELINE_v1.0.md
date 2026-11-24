# WizLingo Architecture Baseline v1.0 — FROZEN

**Frozen:** 2026-08-11
**Scope:** Phases 1–18 (`00`–`18` in `docs/architecture/`)
**Authority:** Level A Strategic Governance
**Unfreeze condition:** the Phase 10I GO/NO-GO gate ([Phase 16 §16.6](16_PHASE_10_ROADMAP.md#166-pilot-gate-criteria--go--no-go))

---

## Why freeze

The architecture is complete enough to be tested and not yet tested. Those two facts together mean
the highest-value next action is **evidence, not more design**.

Freezing does three things:

1. **Makes the pilot a real test.** An architecture that keeps changing during its own validation
   cannot be validated — you never learn which version produced the result.
2. **Stops the design from absorbing effort that belongs to authoring.** There is always another
   refinement available. The 40-contract pilot is now the bottleneck, and design work does not move
   it.
3. **Creates a named thing to be wrong about.** Baseline v1.0 makes specific, falsifiable claims.
   The pilot can contradict them. That is the point.

The next job is not to add more educational theory. The eight pillars, fifteen levels, mastery
engine, adaptation rules, and operating model are specified. The next job is to prove the
architecture works on a small representative set of competencies before scaling to ~1,400.

---

## The definition this baseline establishes

> **WizLingo is a human-designed, AI-generated, expert-governed, empirically calibrated adaptive
> language mastery system.**

Each adjective is a claim with a mechanism behind it, and each is falsifiable by the pilot:

| Claim | Mechanism | Falsified if |
|---|---|---|
| **Human-designed** | Competency Contracts + Learning Outcome Contracts; AI has no write path to the curriculum graph | Contract schema proves insufficient to generate from (Phase 16 §16.7, "spread failures") |
| **AI-generated** | 4 tiers, spec-compiled generation, ≥93% of served activities machine-produced | Cost or expert-hours exceed 2× budget, or blind distinguishability >75% |
| **Expert-governed** | 6 roles, 3 governance levels, computed risk, sampling with floors, "expert validated" defined per content class | Reviewer agreement κ <0.60, or review cost >60 expert-hours per 1,000 items |
| **Empirically calibrated** | Trust lifecycle, 4 calibration routes, 8 assumptions under monthly test | <65% of items reach `TRUSTED`, or mastery fails to predict later performance |
| **Adaptive** | 13-strand Language DNA, 75 difficulty states, 14 signal→action rules | Mastery engine does not beat the legacy 5-session rule on false positives (Q9) |

The fourth and fifth rows are the ones that matter. The first three describe how the system is
built; those two describe whether it works.

---

## Frozen scope

| Doc | Content | Status |
|---|---|---|
| `00_INDEX.md` | Index, 8 structural decisions, 6 concerns | **FROZEN** |
| `01_LEARNING_ARCHITECTURE.md` | 7 layers, 3 loops, 14-entity hierarchy | **FROZEN** |
| `02_LEVEL_MAP.md` | 15 levels × 15 dimensions, placement & movement | **FROZEN** |
| `03_PILLAR_MATRIX.md` | 8 pillars × 15 levels, spiral mechanism | **FROZEN** |
| `04_TAXONOMY.md` | Addressing, 32 domains, 18-branch content taxonomy, 9 invariants | **FROZEN** |
| `05_MASTERY_ASSESSMENT.md` | BKT + Elo + decay, 5 states, 7 assessment types, anti-gaming | **FROZEN** — thresholds now policy-driven per Phase 18 |
| `06_AI_ADAPTATION.md` | Language DNA, 14 signal rules, 75 states, 5 session blueprints | **FROZEN** |
| `07_GAME_ARCHITECTURE.md` | World→Quest mapping, XP/star/badge economy, age evolution | **FROZEN** |
| `08_DATA_MODEL.md` | Prisma schema, legacy migration | **FROZEN** — extended by 12/13/14/17/18, not revised |
| `09_AUTHORING_GOVERNANCE.md` | CAS, **the 7 validation gates**, versioning | **FROZEN** — gates reused unchanged |
| `10_CONCEPT_WALKTHROUGHS.md` | 9 concepts × 15 levels | **FROZEN** — readiness table superseded |
| `11_CURRICULUM_OPERATING_MODEL.md` | Provability analysis, 6 concerns, trust lifecycle, RACI | **FROZEN** |
| `12_COMPETENCY_CONTRACTS.md` | 34 fields tiered, schema, completeness gate | **FROZEN** |
| `13_CONTENT_SPECIFICATIONS.md` | Spec compiler, Golden Content, prompt templates | **FROZEN** |
| `14_AI_GENERATION_GOVERNANCE.md` | 4 tiers, 10-stage pipeline, trust mechanics, provenance | **FROZEN** |
| `15_HUMAN_REVIEW_GOVERNANCE.md` | Roles, governance levels, risk, sampling, health score | **FROZEN** |
| `16_PHASE_10_ROADMAP.md` | 10A–10J, pilot design, gate criteria | **FROZEN** — it *is* the test plan |
| `17_LEARNING_OUTCOME_CONTRACTS.md` | Observable behaviour, evidence signature, non-evidence | **FROZEN** |
| `18_CALIBRATION_POLICY.md` | 4 routes, configurable thresholds, hard floors, 8 assumptions | **FROZEN** — *values* are configuration; *structure* is frozen |

---

## Decision register

Every load-bearing decision, with what would overturn it.

| # | Decision | Doc | Overturned by |
|---|---|---|---|
| **D1** | Grade ⊥ Mastery Level. Age/grade controls **context**; mastery controls **language complexity**. | 01 §1.4 | Q5 abandon-rate gap >10 pp, or any expert condescension finding |
| **D2** | Mastery is an inference, not a counter. | 05 §5.1 | Q9: engine no better than the 5-session rule |
| **D3** | 13 Language DNA strands, never one composite. | 06 §6.1 | — (structural; no pilot test) |
| **D4** | AI generates content, never curriculum. | 14 §14.1 | Not falsifiable — this is a policy commitment, not a hypothesis |
| **D5** | 15 visible levels × 5 internal bands = 75 states. | 06 §6.4 | Measured band separation fails; p-value bands overlap |
| **D6** | Human authorship lives in the Competency Contract; boundaries authored once in `LevelDefaults`. | 12 §12.3 | 10H spread failures → schema insufficient |
| **D7** | Untrusted content cannot make a mastery decision. `QUARANTINED → CALIBRATING → TRUSTED`. | 11 §11.4 | Q8: trust state does not predict downstream performance |
| **D8** | Two feedback loops, asymmetric authority: item calibration **binding**, curriculum change **advisory**. | 15 §15.10 | Not falsifiable — a governance commitment |
| **D9** | T2P vs T3 split. Templates earn trust; instances inherit. Free-form conversation gives Elo/engagement/diagnostics, never mastery. | 14 §14.2 | T2P slot fills breach ceilings (Q4 <97%) |
| **D10** | Risk is computed from content × novelty × observed behaviour, with a floor at `baseRisk`. | 15 §15.5 | Review cost >60 expert-hours/1,000 items |
| **D11** | Sampling has absolute floors; rates never decay to zero. | 15 §15.6 | — (structural) |
| **D12** | Competency ≠ Learning Outcome. Outcomes declare observable behaviour, evidence signature, and **non-evidence**. | 17 | Compound-outcome detection proves unworkable in authoring |
| **D13** | Calibration thresholds are **policy**; the trust rule is **not**. Hard floors are code. | 18 §18.7 | — (structural) |
| **D14** | Four calibration routes; low-volume content is trusted via expert-anchoring, not a lowered N. | 18 §18.3 | Route D audit disagreement exceeds tolerance |
| **D15** | Calibration is a first-class concern testing 8 assumptions, not just content behaviour. | 18 §18.9 | — (structural) |
| **D16** | Language Wizard requires ≥2 human reviewers + taught explanation. No AI-only path. | 07 §7.5, 15 §15.7 | Not falsifiable — a standards commitment |

**D4, D8, and D16 are commitments, not hypotheses.** They are not subject to pilot evidence and may
only be changed by an explicit Level A decision with recorded rationale. If a future pressure
suggests relaxing any of them, that is a governance event, not an optimisation.

---

## Explicitly NOT frozen — the open questions

Honest list of what Baseline v1.0 does not know. Each is resolved by a named stage.

| # | Open question | Resolved by | Current position |
|---|---|---|---|
| **O1** | Does declared cognitive demand correlate with measured item behaviour? | 10I / Phase 18 §18.9 row 2 | Declared as a claim; if agreement <70%, demote to a prior and stop asserting it |
| **O2** | Is grade ⊥ level separation real in *generated* content, not just in principle? | 10H + 10I (Q5, Q6) | Asserted; zero-tolerance gate criterion |
| **O3** | Can AI generate conceptual-change instruction that surfaces then breaks a prior model? | 10H | Assumed possible; ≥95% required |
| **O4** | Are the Phase 18 threshold values right per family? | 10I | Best statistical estimate; **this is exactly why they are policy** |
| **O5** | Can MASTERY-pillar activities (retention, transfer, teach-back) be generated at all? | 10G | Unknown — the only pillar with zero legacy content |
| **O6** | Is LLM rubric agreement sufficient to gate `productive_evidence`? | 10I (κ ≥0.70/0.75) | Assumed; Route C exists because it is uncertain |
| **O7** | Is the 34-field contract schema sufficient to generate from? | 10H failure-spread analysis | Assumed; a spread failure means the schema, not the prompts |
| **O8** | Does T2P slot-filling preserve linguistic bounds under real interest personalisation? | 10G / 10I (Q4) | Enforced at fill time; unverified at scale |
| **O9** | Does mastery predict later performance? | 10I (Q8) | **The top-level validity question. Unanswered.** |
| **O10** | Does this engine beat the legacy 5-session rule? | 10I (Q9, shadow mode) | **Unanswered. The justification for the whole engine.** |
| **O11** | Does AI content create emergent misconceptions? | 10I (Q7) | Unknown; zero-tolerance for content-attributable ones |
| **O12** | Is error-pattern classification accurate enough to route remediation? | 10I (Q3) | Assumed; ≥0.80 precision required |
| **O13** | Is 25 min/item the real Golden Content cost? | 10C actuals | Estimate only; drives the P0–P2 scope decision |
| **O14** | Does the sampling model hold at 5–6 FTE? | 10J first 6 months | Costed, not observed |

**O9 and O10 are the two that decide whether this is a serious learning system.** Everything else is
instrumental. They are unanswered, and no amount of architectural rigour answers them — only learners
do.

---

## Change control during freeze

| Change class | Permitted during freeze? | Approval |
|---|---|---|
| Typo, formatting, broken link | Yes | Author, no version bump |
| Clarification that changes no decision | Yes | Author, logged in this file's change log |
| Adding a worked example | Yes | Author |
| **Any change to a numbered decision (D1–D16)** | **No** | Level A only, with recorded rationale; bumps to v1.1 |
| Adding a `CalibrationPolicy` row | Yes — this is configuration | Level A per Phase 18 §18.7 |
| Loosening a calibration threshold | **No during freeze** | Level A + Psychometrician; requires pilot evidence, which does not exist yet |
| Adding a new document | **No** | Level A; must justify why it cannot wait for the pilot |
| New educational theory, new pillar, new level | **No** | Level A; presumption against — the framework is complete |

The rule for the freeze period, stated plainly:

> **If a proposed change does not unblock the pilot, it waits for the pilot.**

---

## The path out of freeze

```
BASELINE v1.0 (frozen)
      ↓
10A  21 defaults/policy rows  →  40 competency contracts  →  ~110 outcome contracts
10B  spec compiler            →  ~240 compiled specs
10C  ~320 golden items incl. ≥120 non-exemplars
10D  prompt templates + T2P slot lexicons
10E  10-stage pipeline  →  VALIDATOR GOLDEN CALIBRATION PASSES   ← hard gate
10F  6 roles staffed + reviewer calibration κ ≥0.6               ← 8-week lead, start now
      ↓
10G  ~4,800 pilot items
10H  blind expert review + agreement study
10I  ~2,000 learners, ~60,000 attempts, 9 validation questions
      ↓
   GO / NO-GO  ← Level A decision on the evidence
      ↓                          ↓
   GO: unfreeze to v1.1     NO-GO: diagnose per Phase 16 §16.7,
   → 10J scale generation          revise, re-pilot (2–6 weeks)
```

### Immediate next actions (this week, in parallel)

| # | Action | Owner | Blocks |
|---|---|---|---|
| 1 | Author `LevelDefaults` × 15, `GroupPolicy` × 5, `GlobalPolicy` × 1 | Curriculum Architect + Language Expert | Everything |
| 2 | Seed `CalibrationPolicy` rows from Phase 18 §18.5–18.6 | Psychometrician | 10I |
| 3 | Contract schema migration + completeness checkers (Phase 12 §12.8, Phase 17 §17.10) | Engineering | 10A authoring |
| 4 | **Begin reviewer recruitment** — 6 roles, band-specialised | Product | 10F, 8-week lead |
| 5 | Select the 40 pilot competencies against the Phase 16 §16.4 matrix and record the rationale | Curriculum Architect | 10A |

Action 4 is the one most easily deferred and least recoverable: the reviewer panel gates 10F, 10F
gates 10H, and hiring cannot be compressed. Starting it in week 1 rather than week 8 removes eight
weeks from the critical path at no cost.

---

## What this baseline is *not*

Stated so the freeze is not mistaken for confidence:

- It is **not a validated architecture.** It is a complete, internally consistent, falsifiable one.
- It is **not a content library.** Zero lessons exist. That is deliberate and correct.
- It does **not prove pedagogical appropriateness.** Phase 11 §11.2 is explicit about what is
  provable and what is only controlled. Do not let this be marketed as "every lesson is
  expert-validated" — that claim fails audit, and the honest version is stronger.
- It does **not know** whether mastery predicts performance (O9) or whether the engine beats a
  five-session counting rule (O10). Those are the two questions the pilot exists to answer, and a
  NO-GO on either is a real possibility that the roadmap plans for rather than assumes away.

---

## Change log

| Version | Date | Change | Authority |
|---|---|---|---|
| 1.0 | 2026-08-11 | Initial freeze. Phases 1–18. 16 decisions, 14 open questions. | Level A |
