# PHASE 4 — Competency & Micro-Skill Taxonomy

Covers the addressing scheme, the full Domain→Competency→Micro-Skill→Concept taxonomy, and the
18-branch content taxonomy.

---

## 4.1 The curriculum address

Every learnable thing in WizLingo has a stable, human-readable address. This address is the
join key between curriculum, content, evidence, mastery, and AI generation requests. Nothing in
the system may exist without one.

```
wl:<pillar>/<domain>/<competency>@<level>/<microskill>
```

Examples:

```
wl:SOUND/phonics/decode-cvc@1.3/blend-3-phonemes
wl:WORD/vocab-depth/shades-of-meaning@2.3/rank-intensity-gradient
wl:SENTENCE/syntax/clause-combining@3.2/reduce-relative-to-participial
wl:UNDERSTANDING/reading/evaluate-argument@4.2/assess-evidence-sufficiency
wl:THINKING/reasoning/counter-argument@3.3/steelman-opposing-view
```

Concepts are addressed separately, because they are cross-level:

```
concept:<branch>.<slug>        e.g.  concept:lex.synonymy
                                     concept:syn.relative-clause
                                     concept:phon.vowel-team
```

### Why this matters operationally

1. **AI generation requests are fully qualified.** A generation call carries the address, so the
   model can never produce content that is unaddressed or mis-sequenced.
2. **Evidence is routable.** An attempt on any item updates exactly the right mastery record.
3. **Curriculum can be reorganised without data loss.** Addresses are stable identifiers;
   reordering the *presentation* of curriculum never rewrites learner history.
4. **Analytics are free.** School and parent reports are aggregations over address prefixes.

### Naming rules

| Element | Rule |
|---|---|
| Pillar | Fixed enum, 8 values, uppercase |
| Domain | kebab-case, stable across all 15 levels, 3–5 per pillar |
| Competency | kebab-case verb phrase, level-scoped, observable |
| Level | `G.L` from the 15-level ladder |
| Micro skill | kebab-case, practisable in <90 s, independently assessable |
| Concept | `<branch>.<slug>`, level-independent, one per linguistic claim |

---

## 4.2 The 32 domains

| Pillar | Domains |
|---|---|
| **SOUND** | `phonemic-awareness` · `phonics` · `pronunciation` · `prosody` |
| **WORD** | `vocab-breadth` · `vocab-depth` · `morphology` · `spelling` |
| **SENTENCE** | `syntax` · `grammar-accuracy` · `sentence-style` · `mechanics` |
| **UNDERSTANDING** | `listening` · `reading` · `inference` · `critical-evaluation` |
| **EXPRESSION** | `speaking-production` · `writing-production` · `fluency` · `voice-register` |
| **COMMUNICATION** | `conversation` · `presentation` · `pragmatics` · `collaboration` |
| **THINKING** | `reasoning` · `analysis-synthesis` · `creativity` · `metacognition` |
| **MASTERY** | `retention` · `transfer` · `self-direction` · `integration` |

Domains are **fixed**. Curriculum growth happens below this line, in competencies and micro
skills. This is the boundary that keeps the schema stable while the content scales — adding
10,000 micro skills requires no migration.

---

## 4.3 Competency design rules

A competency is well-formed only if it satisfies all five:

1. **Observable** — states what the learner *does*, not what they *know*. "Decodes two-syllable
   words with vowel teams", not "understands vowel teams."
2. **Assessable in one sitting** — a single activity set can produce a judgement.
3. **Level-scoped** — carries exactly one level. The same slug at a different level is a
   different competency with different criteria.
4. **Criterion-bearing** — ships with a numeric mastery threshold, not a vibe.
5. **Non-overlapping within its domain and level** — two competencies in the same
   `(domain, level)` must not be satisfiable by identical evidence.

Target cardinality: **2–4 competencies per (domain, level)**.
32 domains × 15 levels × ~3 = **~1,400 competencies** system-wide.

### Worked example — one competency in full

```yaml
address: wl:WORD/vocab-depth/shades-of-meaning@2.3
pillar: WORD
domain: vocab-depth
level: "2.3"
slug: shades-of-meaning
statement: >
  Ranks and selects among 3–4 related words differing in intensity or
  precision, and justifies the choice with reference to context.
concepts: [lex.synonymy, lex.intensity-gradient, lex.connotation-basic]
prerequisites:
  - { address: "wl:WORD/vocab-depth/synonym-antonym@2.2", type: HARD }
  - { address: "wl:UNDERSTANDING/reading/context-clues@2.2", type: SOFT }
cefr: A2.1
bloom: [understand, apply]
masteryCriterion:
  accuracy: 0.85
  minAttempts: 6
  minSessions: 3
  minFormats: 3
  requiresProductiveEvidence: true    # must appear in own writing or speech
  retentionIntervalDays: 28
microSkills:
  - rank-intensity-gradient          # warm < hot < scorching
  - select-precise-verb-in-context   # said/whispered/shouted
  - reject-imprecise-synonym         # why "nice" fails here
  - use-shade-in-own-writing         # productive
learningOutcomes:
  - id: LO-1
    given: "a 4-word intensity set and a sentence with a gap"
    when: "asked to choose the best fit and say why"
    then: "selects correctly in ≥5/6 items and gives a context-referenced reason in ≥4/6"
```

---

## 4.4 Micro-skill design rules

The micro skill is **the resolution at which the AI reasons**. Get the grain wrong and the whole
adaptation layer degrades: too coarse and the AI cannot localise a weakness; too fine and there
is never enough evidence per node to estimate mastery.

| Rule | Constraint |
|---|---|
| Practisable | ≤90 seconds for one attempt |
| Independently assessable | can be scored without reference to another micro skill |
| Multi-format | expressible in ≥3 activity formats (else evidence is format-confounded) |
| Single failure mode | if a learner fails, there is one main reason — this is what makes remediation targetable |
| Evidence-viable | expected to accumulate ≥5 attempts within a level's dwell time |

Target: **3–8 per competency**, ~**7,000** system-wide.

### The single-failure-mode test

This is the rule most often violated. "Writes a paragraph" fails it — a learner can fail on
topic sentence, cohesion, spelling, or handwriting, and the system learns nothing diagnostic.
Decompose into: `write-topic-sentence`, `add-supporting-detail`, `use-transition-word`,
`maintain-tense-consistency`. Each has one failure mode, so each failure is actionable.

The corollary: **paragraph writing still happens as an activity** — it is just scored against
four micro skills simultaneously, each receiving its own evidence. Rich activities, atomic
inference.

---

## 4.5 Concept taxonomy — the 12 branches

Concepts are the DAG nodes and the unit of versioning. They are organised in 12 branches that
cut across pillars (deliberately: a concept like `pragmatic.register` serves COMMUNICATION,
EXPRESSION, and WORD).

| Branch | Prefix | Approx. count | Scope |
|---|---|---|---|
| Phonology | `phon.` | 90 | phonemes, graphemes, syllables, stress, intonation |
| Lexis | `lex.` | 220 | word meaning, relations, morphology, collocation, connotation |
| Orthography | `orth.` | 70 | spelling patterns, rules, exceptions, homophones |
| Syntax | `syn.` | 160 | phrase and clause structure, sentence types, transformations |
| Morphosyntax | `msyn.` | 80 | tense, aspect, agreement, modality, voice |
| Mechanics | `mech.` | 45 | punctuation, capitalisation, formatting conventions |
| Discourse | `disc.` | 110 | cohesion, text structure, genre, register, information structure |
| Comprehension | `comp.` | 130 | literal, inferential, evaluative, critical reading and listening |
| Pragmatics | `prag.` | 85 | audience, politeness, speech acts, implicature, cultural norms |
| Rhetoric | `rhet.` | 75 | appeals, figures, argument structure, persuasion strategy |
| Cognition | `cog.` | 95 | reasoning patterns, fallacies, analysis frames, creative moves |
| Metalinguistic | `meta.` | 40 | learning strategy, self-assessment, language-about-language |

**~1,200 concepts total.** Each carries: definition, prerequisite edges, the levels at which it
is realised, its micro skills per level, CEFR mapping, and a version history.

---

## 4.6 Content taxonomy (spec §15)

The 18 required branches, each mapped to its owning pillar and domain, its level span, and its
canonical activity formats. This is the table content authors and AI generators work from.

| # | Branch | Pillar · Domain | Level span | Canonical formats |
|---|---|---|---|---|
| 1 | **Phonemic Awareness** | SOUND · phonemic-awareness | 1.1 – 2.1 | sound-match, rhyme-pick, syllable-clap, segment-tap, phoneme-delete, odd-one-out |
| 2 | **Phonics** | SOUND · phonics | 1.2 – 2.3 | grapheme-sound, blend-build, word-chain, nonsense-word-decode, sort-by-pattern, timed-decode |
| 3 | **Syllables** | SOUND · phonics + WORD · morphology | 1.2 – 3.1 | clap-count, split-word, stress-place, multi-syllable-decode |
| 4 | **Pronunciation** | SOUND · pronunciation | 1.2 – 5.3 | repeat-after, minimal-pair-discriminate, ASR-score-word, ASR-score-phrase, stress-place, self-record-compare |
| 5 | **Vocabulary** | WORD · vocab-breadth + vocab-depth | 1.1 – 5.3 | picture-word, definition-match, context-cloze, synonym-select, gradient-rank, use-in-sentence, word-web, morpheme-build |
| 6 | **Grammar** | SENTENCE · grammar-accuracy + msyn | 1.3 – 5.3 | error-find, error-repair, transform, cloze, sentence-combine, tense-select, judge-acceptability |
| 7 | **Reading** | UNDERSTANDING · reading | 1.3 – 5.3 | read-aloud-ASR, timed-passage, literal-Q, inference-Q, main-idea, sequence, text-structure-ID, two-text-compare, annotate |
| 8 | **Listening** | UNDERSTANDING · listening | 1.1 – 5.3 | follow-instruction, listen-and-pick, listen-Q, note-take, dictation, tone-ID, argument-reconstruct |
| 9 | **Speaking** | EXPRESSION · speaking-production | 1.1 – 5.3 | repeat, describe-picture, answer-open, retell, timed-talk, role-play, impromptu, present-with-QA |
| 10 | **Writing** | EXPRESSION · writing-production | 1.2 – 5.3 | trace, copy, dictation, sentence-build, paragraph-write, genre-write, essay-write, revise-draft, edit-others |
| 11 | **Comprehension** | UNDERSTANDING · inference + critical-evaluation | 1.3 – 5.3 | inference-justify, evidence-cite, assumption-ID, claim-evidence-sort, evaluate-sufficiency, adjudicate-two-texts |
| 12 | **Storytelling** | COMMUNICATION · presentation + THINKING · creativity | 1.3 – 4.3 | sequence-pictures, oral-retell, story-continue, POV-shift, narrative-write, perform-story |
| 13 | **Conversation** | COMMUNICATION · conversation | 1.1 – 5.3 | scripted-exchange, branching-dialogue, AI-roleplay, clarify-and-confirm, disagree-politely, negotiate |
| 14 | **Public Speaking** | COMMUNICATION · presentation | 2.2 – 5.3 | prepared-talk, visual-supported-talk, debate-turn, panel, impromptu-60s, keynote |
| 15 | **Critical Thinking** | THINKING · reasoning + analysis-synthesis | 2.2 – 5.3 | fallacy-spot, premise-map, steelman, trade-off-weigh, source-reliability, hypothesis-test |
| 16 | **Creative Writing** | EXPRESSION · writing-production + THINKING · creativity | 1.3 – 5.3 | prompt-continue, sensory-describe, character-build, style-imitate, constrained-write, original-piece |
| 17 | **Academic Writing** | EXPRESSION · writing-production + UNDERSTANDING · critical-evaluation | 3.2 – 5.3 | paraphrase, summarise-proportionally, cite, synthesise-sources, thesis-build, essay-with-limitations |
| 18 | **Professional Communication** | COMMUNICATION · pragmatics + EXPRESSION · voice-register | 4.1 – 5.3 | email-write, register-transform, report-write, proposal-write, feedback-deliver, interview-simulate, pitch |

### Reading the level spans

Three patterns, all deliberate:

- **Closing branches** (1, 2, 3) end by Level 2.3–3.1. They are *foundational*: once mastered
  they are not re-taught, but they remain reachable for diagnostic drop-down at any level. A
  Level 4.2 learner who fails a decoding-adjacent diagnostic gets remediated at their true
  point of failure, invisibly.
- **Opening branches** (14, 15, 17, 18) begin mid-ladder because they have genuine cognitive
  prerequisites — academic writing at Level 2.1 would be developmentally incoherent.
- **Full-span branches** (4, 5, 7, 8, 9, 10, 11, 13) run 1.x → 5.3. These carry the spiral and
  hold most of the content volume.

### Format inventory

~60 activity formats total. Each format is declared once as an `ActivityTemplate` with:
its input modality, its output modality, its scoring method (`exact` / `rubric` / `ASR` /
`LLM-rubric`), its scaffold slots, and which difficulty bands it supports. Formats are reused
across pillars and levels with different content bound in — which is how 60 formats and ~1,200
concepts generate effectively unlimited activities without unlimited engineering.

---

## 4.7 Coverage invariants

The authoring system enforces these on every curriculum publish. A violation blocks the publish.

| Invariant | Check |
|---|---|
| Pillar completeness | Every (level, pillar) pair has ≥1 competency. **120/120 cells non-empty.** |
| Domain continuity | Every domain has ≥1 competency at ≥12 of the 15 levels (allows the 3 closing branches). |
| Format diversity | Every micro skill has ≥3 activity formats available. |
| Spiral integrity | Every concept realised at ≥1 level appears at ≥2 levels, unless flagged `terminal: true`. |
| DAG acyclicity | Prerequisite graph has no cycles. |
| Prerequisite locality | A HARD prerequisite may not span more than 4 levels (a Level 4.2 skill cannot hard-block on a Level 1.2 skill; use SOFT + diagnostic drop-down instead). |
| Criterion presence | Every competency has a numeric mastery criterion and ≥1 learning outcome. |
| CEFR monotonicity | A concept's CEFR mapping never decreases as level increases. |
| Assessment reachability | Every learning outcome is satisfiable by ≥1 existing activity format. |
