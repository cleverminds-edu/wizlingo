# PD-001 — Daily practice limit is a usage policy, not a learning rule

| | |
|---|---|
| **Status** | Accepted (product owner, 2026-11-19) |
| **Type** | Product decision (PD). Not an architecture decision; does not amend `docs/architecture/BASELINE_v1.0.md` |
| **Applies to** | Clever Minds pilot build (Phase 1–2) and all school tenants after it |
| **Related** | Draft extension doc 20 (`Wizlingo_Revised_Architecture_and_Competitor_Report/architecture_markdown/20_ADAPTIVE_LEARNING_AND_NEXT_BEST_ACTION.md`), `Wizlingo_Tier_II_III_Fit_Gap_Plan.docx` §4.5, §12 |

## Context

Draft doc 20 says *"Fifteen minutes is a suggested engagement target only — not a fixed timetable"*
and asks the engine to support sessions of any length.

For Tier II/III schools we want a **fixed daily limit of 15–20 minutes per student**, at school and
at home, because:

- Parents share one phone and worry about screen time. A clear limit makes the product easier to
  accept at home.
- AI and speech cost scale with minutes. A limit keeps delivery cost within the ₹120–280 per student
  per year estimate.
- Teachers can plan around a predictable amount of practice.

The two positions only conflict if the limit is treated as part of the learning engine. This
decision keeps them separate.

## Decision

1. **The daily limit is a usage policy.** It decides *how long* a student may practise alone each
   day. It never decides *what* they learn, and it never affects mastery, stage or scores.
2. **What happens inside the time is flexible.** The session planner chooses the mix of vocabulary,
   reading + comprehension, speaking and spelling each day based on the learner's needs. Nothing about
   the mix is hard-coded: shares come from a configurable policy table (see the Phase 1 plan), and a
   teacher can set a weekly class focus.
3. **Who sets the limit**

   | Who | Can do |
   |---|---|
   | WizLingo admin | Sets the allowed range (default 10–30 min) |
   | School | Sets the school default within the range (pilot default: 20 min) |
   | Parent | Can *lower* the limit for their child. Cannot raise it above the school's setting |
   | Teacher | Can grant extra minutes to a student for a given day (e.g. before a competition) |
   | B2C (no school) | Parent sets it within the admin range; default 20 min |

4. **One budget per day, split as the student likes.** School and home minutes come out of the same
   daily total (e.g. 8 min in school, 12 min at home). The day resets at midnight IST.
5. **What does not count toward the limit:** teacher-led classroom activity (Talk Time, classroom
   group discussion), scheduled competitions (spell bee rounds) and teacher-assigned assessments.
6. **Rules where the limit meets assessment** (keeps doc 20's "never lower standards to fit a time
   window"):
   - The planner does not start an assessment or stage-up check that cannot finish in the time left;
     it gives practice instead.
   - When time runs out mid-activity, the current item may be finished, then progress is saved and
     resumed next day. Running out of time is never recorded as a wrong answer.
   - Reaching the limit is recorded as a session end, never as learner evidence.
7. **Only active time counts.** Time is counted from server heartbeats while the app is open and in
   the foreground; idle or background time is not charged.

## Consequences

- Doc 20's "variable-duration sessions" is honoured *within* the daily budget. If doc 20 is later
  merged into the baseline, this decision should be cited there as the school usage policy.
- Learner-initiated revision (draft doc 23) is also inside the budget. If pilot data shows students
  want more revision than the limit allows, revisit by making short revision exempt.
- Needs: a time-budget service, heartbeat endpoint, per-school settings and parent override (Phase 1
  tasks 1.2–1.3).

## How we will know if this is wrong

Review after 4 weeks of the Clever Minds pilot:

- More than 30% of active students hit the limit on most days **and** teachers or parents ask for more
  time → raise the default or exempt revision.
- Fewer than 30% of students reach even half the limit → the limit is not the constraint; look at
  engagement instead.
- Parents report screen-time concerns despite the limit → lower the default.
