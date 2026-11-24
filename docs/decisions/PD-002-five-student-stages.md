# PD-002 — Five student-facing stages, 15 levels run behind them

| | |
|---|---|
| **Status** | Accepted (product owner, 2026-11-19) |
| **Type** | Product decision (PD), presentation layer |
| **Source of truth** | The November 2026 records: `Wizlingo_Tier_II_III_Fit_Gap_Plan.docx`, `Wizlingo_Indian_Competitive_Analysis_and_BKT_Elo_Discussion_17_Nov_2026.docx`, `Wizlingo_Revised_Architecture_and_Competitor_Report/`. The August 2026 files in `docs/architecture/` are older and superseded where they conflict. |
| **Applies to** | Clever Minds validation pilot and after |

## Context

Students, teachers and parents in Tier II/III schools cannot follow 15 levels (Tier II/III plan §4.2:
"8 pillars × 15 levels × 3 stages is unusable for teachers"; §10: "15 levels → about 5 stages").
The Extension Pack keeps 15 mastery levels as the internal model.

## Decision

- Students and parents see **5 stages**. The **15 levels run behind them**, 3 per stage, and are
  not shown to students.
- Teachers see the stage and the level inside it; admin views can see everything.
- Working mapping (uses the level grouping from the August level map; names can change):

  | Stage | Working name | Internal levels |
  |---|---|---|
  | 1 | Sound Isles | 1.1 · 1.2 · 1.3 |
  | 2 | Word Forge | 2.1 · 2.2 · 2.3 |
  | 3 | Meaning Realms | 3.1 · 3.2 · 3.3 |
  | 4 | Expression Summit | 4.1 · 4.2 · 4.3 |
  | 5 | Mastery Citadel | 5.1 · 5.2 · 5.3 |

- The mapping lives in a configuration table (`StageDefinition`), not in code. Today's app still
  uses legacy levels (`Student.currentLevel`, `ReadingPassage.level`); those are mapped into the
  table for the pilot.
- Students see progress *inside* a stage (a path or progress bar through its 3 levels), so they
  never sit in one stage for months with nothing visibly changing.

## Moving up

Rule-based for the pilot (Tier II/III plan §10, "rules before BKT/Elo"): a level is complete when its
skills are answered correctly **independently in at least 2 different formats** (e.g. choose + type,
or type + speak) **plus one delayed check at least 3 days later**. Time spent alone never moves a
student up. BKT/Elo stay candidate methods, to be compared against this rule once real data exists
(17 Nov discussion §5.4).

## Appreciation

Each level-up gets a celebration; each stage-up gets a stage badge (reusing the existing badge
system), a certificate and a message to parents. Effort (days practised, speaking attempts) is also
recognised, but is never presented as mastery.
