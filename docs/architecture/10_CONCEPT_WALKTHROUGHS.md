# PHASE 16 — Concept Walkthroughs Across All 15 Levels

Demonstrates the spiral in operation. One concept is traced in full narrative detail; the eight
required concepts follow in the same nine-dimension structure, tabulated for usability.

The nine dimensions, per spec §16:
**SEES · HEARS · SAYS · READS · WRITES · THINKS · AI ASSESSMENT · DIFFICULTY · MASTERY**

---

# PART A — SYNONYMS (full trace)

`concept:lex.synonymy` · Pillar: WORD · Domain: `vocab-depth`
Realised at 13 of 15 levels (absent at 1.1 and 1.2, where the prerequisite vocabulary does not
yet exist). See the micro-skill chain in [Phase 3 §3.10](03_PILLAR_MATRIX.md#a-concept--micro-skill).

The through-line: synonymy starts as *"two words can mean the same thing"*, becomes *"no two words
mean exactly the same thing"*, and ends as *"which word I choose reveals what I think"*. Same
concept, three different intellectual events.

---

### Level 1.1 — Sound Scout · *not yet introduced*

Prerequisite unmet: a learner with 150 productive words has no synonym pairs available. Attempting
synonymy here would be teaching a relation between words the learner does not yet hold.
**What happens instead:** vocabulary breadth work builds the pairs that 1.3 will relate. The
concept's DAG entry lists `lex.category-membership` as its HARD prerequisite, which is what blocks
scheduling — automatically, not by editorial judgement.

---

### Level 1.2 — Word Spotter · *not yet introduced*

Still blocked. Antonyms arrive first at 1.3 (opposites are perceptually easier than near-identity
for 4-year-olds — *big/small* is visible; *big/large* is not), and synonymy follows.

---

### Level 1.3 — Story Sprout · `ms.syn.another-word-for`

| | |
|---|---|
| **SEES** | Two pictures of the same object side by side, each with a word label: `big` / `large`. A friendly guide character points to both. No text instruction. |
| **HEARS** | *"Look — big. Large. Both mean the same! Big… large."* Then: *"Which other word means happy?"* |
| **SAYS** | Repeats the pair aloud: *"big, large."* Then names a synonym when prompted: *"Happy… glad!"* Speaking is via ASR, unscored on pronunciation precision. |
| **READS** | Only the two 3–5 letter word labels, both decodable. No sentence reading. |
| **WRITES** | Nothing. Production is oral at this level. |
| **THINKS** | *"Two different words, same picture."* The cognitive move is recognising that meaning is separable from form — genuinely non-trivial at 5 years old. |
| **AI ASSESSMENT** | Format `synonym-select` (2 options, `P(G)=0.50`). 8 items across 3 sessions. Because guess rate is 0.50, BKT can reach `Proficient` but **not** `Mastered` on this format alone; the oral production item (`P(G)=0.02`) supplies the low-guess evidence. Latency normed at ~6 s. |
| **DIFFICULTY** | Band D1: both pictures identical, 2 options, guide says the answer if the learner hesitates 8 s. Band D3: pictures differ slightly, 4 options, no hint. Band D5: no picture — audio only. |
| **MASTERY** | `Proficient`: 7/8 correct across 2 sessions, 2 formats. `Mastered`: adds oral production of 5 pairs, a 14-day delayed check, and one transfer item (a pair from an untaught topic set). Typically ~4 weeks. |

---

### Level 2.1 — Phonics Pathfinder · `ms.syn.identify-pairs`

| | |
|---|---|
| **SEES** | A word grid of 8 high-frequency words; drag to pair the synonyms. `happy–glad`, `big–large`, `fast–quick`, `small–little`. |
| **HEARS** | Each word read aloud on tap. Instruction spoken and written. |
| **SAYS** | Reads each pair aloud (ASR-checked for decoding accuracy — this doubles as SOUND-pillar evidence). Answers *"tell me another word for fast."* |
| **READS** | Individual words, decodable at level. First appearance in a sentence: *"The dog is fast. The dog is quick."* |
| **WRITES** | Copies one pair. Fills a gap: *"The car is very ___ ."* choosing from two synonyms. |
| **THINKS** | Compare/contrast: sorting words into groups by meaning rather than by sound or first letter. Requires suppressing the phonics-driven habit of grouping by form. |
| **AI ASSESSMENT** | Formats: `matching` (5 pairs, `P(G)=0.15`), `synonym-select`, `read-aloud-ASR`, `context-cloze` with bank. One activity yields evidence for **three** micro skills simultaneously — synonym identification (WORD), decoding (SOUND), and sentence reading (UNDERSTANDING) — each routed to its own BKT node. |
| **DIFFICULTY** | D1: 3 pairs, pictures supporting every word. D3: 5 pairs, no pictures. D5: 6 pairs including one word with no partner (a distractor requiring the learner to notice absence). |
| **MASTERY** | `Mastered`: ≥85% across 3 formats, 5 attempts, 3 sessions, oral production evidence, 14-day retention, one transfer set. |

---

### Level 2.2 — Word Builder · `ms.syn.select-in-context`

| | |
|---|---|
| **SEES** | A sentence with a highlighted word and 4 replacement candidates, three of which are synonyms but only one of which fits: *"The **big** elephant"* → `large` ✓ / `tall` ✗ / `wide` ✗ / `loud` ✗ |
| **HEARS** | The sentence read with the target word stressed. Feedback explains *why*, not just whether: *"Tall means big going up. An elephant is big all over — so large fits."* |
| **SAYS** | Reads the corrected sentence aloud. Explains a choice in one sentence: *"Large, because…"* |
| **READS** | 60–120 word passages where a synonym substitution has been made; identifies it. |
| **WRITES** | Rewrites a given sentence replacing one word with a synonym, keeping meaning. First **productive** use: writes an original sentence using a target synonym. |
| **THINKS** | The pivotal shift: synonyms are **not** interchangeable. Cause-and-effect reasoning about word fit. This is the moment the naive model from 1.3 breaks, and it should be *taught* as a surprise. |
| **AI ASSESSMENT** | `context-cloze` (open, `P(G)=0.05`), `use-in-sentence` (rubric-scored, productive), `error-find`. The productive item is what satisfies the `productive_evidence` gate. Rubric returns span annotations addressed to this micro skill. |
| **DIFFICULTY** | D1: 2 options, one obviously wrong. D3: 4 options, all real synonyms, one contextually correct. D5: no options — learner supplies the word, and must justify. |
| **MASTERY** | `Mastered`: ≥85% on contextual selection, ≥3/4 rubric on original sentence, 3 formats, 21-day retention, transfer to an unfamiliar topic. Learners commonly stall here — the engine responds by adding contrast pairs and reducing option count rather than repeating the same items. |

---

### Level 2.3 — Sentence Smith · `ms.syn.shades-of-meaning`

| | |
|---|---|
| **SEES** | An intensity slider with 4 draggable words: `warm · hot · scorching · boiling`. Rank them. Then a thermometer visual confirming the ordering. |
| **HEARS** | Words spoken with matching prosody — `scorching` said with emphasis. Prosody carries the semantic gradient, which is a deliberate multi-modal reinforcement. |
| **SAYS** | Reads the gradient in order. Uses the strongest term in a spoken sentence with matching intonation. |
| **READS** | 120–200 word passage where an author's word choice creates intensity; identifies the strongest word and says what it does. |
| **WRITES** | Rewrites a flat sentence three times at three intensities. *"It was hot" → "It was warm" / "It was scorching" / "It was boiling".* Two-paragraph piece required to use ≥2 precise intensity words. |
| **THINKS** | Ordering on a continuous dimension; recognising that word choice is a *decision with an effect*. Multi-step inference: if the author chose `scorching`, what were they trying to make me feel? |
| **AI ASSESSMENT** | `gradient-rank` (`P(G)=0.04` for a 4-item ordering), `use-in-sentence`, `paragraph-write` scored on Language Range. Partial credit via Kendall's tau on the ranking rather than all-or-nothing — a learner who gets 3 of 4 positions right knows something. |
| **DIFFICULTY** | D1: 3 words, thermometer visible throughout. D3: 4 words, no visual. D5: 5 words across two dimensions (intensity *and* formality), plus justification of the ordering. |
| **MASTERY** | `Mastered`: ≥85% ranking accuracy across ≥4 gradient sets, precise intensity words appear unprompted in own writing (the strongest signal available at this level), 28-day retention, 3 formats. |

---

### Level 3.1 — Meaning Mapper · `ms.syn.connotation`

| | |
|---|---|
| **SEES** | Two sentences, differing in one word: *"He is **confident**"* / *"He is **arrogant**"*. Both mean "sure of himself." Learner sorts into positive / neutral / negative. |
| **HEARS** | 15-minute listening text; identifies where the speaker's word choice reveals an attitude. |
| **SAYS** | 3-minute talk describing the same person twice — once admiringly, once critically — changing only word choice. Sharpest possible demonstration of connotation. |
| **READS** | 200–350 word text; identifies loaded words and explains what they reveal about the writer's stance. First encounter with the idea that a neutral-looking text has a position. |
| **WRITES** | 3-paragraph opinion piece where word choice is required to support the stance. Then rewrites one paragraph reversing the connotation without changing any facts. |
| **THINKS** | Inference from lexical choice to authorial intent. Identifies an unstated assumption carried by a word. Genuinely new cognitive territory: language as evidence about the speaker. |
| **AI ASSESSMENT** | `connotation-sort`, `annotate` (identify loaded words in a passage — scored on precision and recall against a marked key), `timed-talk` with LLM rubric on stance consistency, `paragraph-write` rewrite scored on whether facts were preserved. |
| **DIFFICULTY** | D1: obvious pairs (`brave/reckless`), 3 categories given. D3: subtle pairs (`thrifty/stingy`), learner supplies the judgement. D5: a whole passage, learner identifies all loaded choices and constructs the author's stance from them. |
| **MASTERY** | `Mastered`: ≥80% on connotation classification, produces a connotation-reversed rewrite preserving facts (rubric ≥3.5/5), identifies loaded words at ≥0.7 precision/recall, 28-day retention, evidence in speaking **and** writing. |

---

### Level 3.2 — Story Weaver · `ms.syn.register-grading`

| | |
|---|---|
| **SEES** | A three-column table — informal / neutral / formal — with words to place: `kid · child · juvenile`, `get · obtain · procure`, `boss · manager · supervisor`. Then three audience cards: friend, teacher, principal. |
| **HEARS** | Same message delivered three ways in audio; identifies the audience for each from lexical choice alone. |
| **SAYS** | 4–5 minute presentation, then delivers a 60-second version of the same content to a different named audience with the register changed. |
| **READS** | 350–500 word texts in contrasting registers on one topic; analyses the author's craft, specifically lexical register, and infers intended readership. |
| **WRITES** | Three genres required; the persuasive piece must be written twice for two audiences. Register consistency scored across the whole text — a single informal word in a formal piece is flagged with a span annotation. |
| **THINKS** | Analysis across a whole text rather than at word level. Recognises register as a system with internal consistency, and that breaking it has a cost. Synthesises: what does this author's register tell me about who they think I am? |
| **AI ASSESSMENT** | `register-transform` (deterministic key, `P(G)=0.05`), `genre-write` with rubric weighting Voice & Register, `listen-and-pick` for audience inference, `timed-talk` scored on register consistency. Register inconsistency is a named error pattern (`REGISTER_MIX`) and enters the registry when it recurs. |
| **DIFFICULTY** | D1: 3 words, 3 columns, one word obviously formal. D3: 8 words, learner builds the columns. D5: an entire paragraph transformed across register, evaluated on whether meaning and information content survived intact. |
| **MASTERY** | `Mastered`: register-transformation ≥85%, register consistency ≥4/5 across two full written pieces in different registers, correct audience inference on 4/5 audio items, 35-day retention, 3+ formats including two productive. |

---

### Level 3.3 — Idea Architect · `ms.syn.precision-in-argument`

| | |
|---|---|
| **SEES** | A claim with a hedging slider: *"The data ___ that screen time affects sleep"* → `proves · shows · suggests · hints`. Each choice displays the strength of commitment it makes. |
| **HEARS** | Critical listening: a speaker's claims classified by strength; identifies overclaiming. |
| **SAYS** | 5-minute analytical presentation using appropriately hedged claims; in Q&A, must defend why a claim was hedged rather than asserted. |
| **READS** | 500–650 word argumentative texts; evaluates whether the author's verb choice matches the strength of their evidence. Detects overclaiming as an argumentative flaw. |
| **WRITES** | Argumentative essay where every claim's verb must match its evidence strength. Counter-argument section requires concessive hedging. Marked down for `proves` where evidence only `suggests` — and the annotation says so specifically. |
| **THINKS** | Constructs a counter-argument to their own position. Recognises overclaiming as a named fallacy. The intellectual leap: **word choice is an epistemic commitment.** A near-synonym is now an argumentative move, not a stylistic one. |
| **AI ASSESSMENT** | `evidence-strength-match` (rubric with a defensible key), `essay-write` with a dedicated hedging dimension in the rubric, `fallacy-spot` for overclaiming, `present-with-QA` scored on defence of hedging choices. |
| **DIFFICULTY** | D1: 2 options, strong evidence vs. weak evidence clearly signposted. D3: 4 verbs, learner judges evidence strength unaided. D5: learner writes both the claim and its hedge from raw data, then defends the calibration under challenge. |
| **MASTERY** | `Mastered`: ≥85% on evidence-strength matching, hedging dimension ≥4/5 in a full essay, identifies overclaiming in 4/5 unseen texts, defends calibration in live Q&A, 42-day retention. |

---

### Level 4.1 — Voice Crafter · `ms.syn.stylistic-selection`

| | |
|---|---|
| **SEES** | A paragraph rendered three ways — plain, ornate, terse — with the substituted words highlighted. Analytics panel: sentence length variance, Latinate/Germanic ratio, abstraction level. Learner sees their own metrics against the three targets. |
| **HEARS** | 25-minute extended speech; tracks how a speaker's lexical choices build an ethos. |
| **SAYS** | 6-minute talk with a *declared* stylistic intention, then a rationale for three specific word choices. |
| **READS** | 650–800 word literary and journalistic prose; analyses how word choice creates voice; recognises unreliable narration signalled lexically. |
| **WRITES** | Reflective essay with a consciously chosen voice, plus a short author's note explaining the lexical strategy. Literary-analytical paragraph quoting and commenting on a writer's word choice. |
| **THINKS** | Metacognitive: explains their own stylistic reasoning and revises it. Evaluates whether a chosen voice suited its purpose. Recognises framing effects created by lexical fields. |
| **AI ASSESSMENT** | `style-imitate` (LLM rubric on stylistic fidelity + measured lexical statistics), `essay-write` with Voice & Register at 4/5 threshold, `annotate` on another author's choices. The author's-note artefact is scored for whether stated intention matches measured output — **calibration of self-knowledge**, which is a MASTERY-pillar signal as much as a WORD-pillar one. |
| **DIFFICULTY** | D1: imitate a strongly marked style with the target words supplied. D3: imitate from a sample, unaided. D5: invent a voice for a stated purpose and audience, justify it, then critique its limitations. |
| **MASTERY** | `Mastered`: stylistic fidelity ≥4/5 on two imitations of contrasting styles, original piece with declared voice ≥4/5, stated intention matches measured lexical output, 42-day retention, ≥3 formats. |

---

### Level 4.2 — Argument Forger · `ms.syn.evaluative-loading`

| | |
|---|---|
| **SEES** | Two headlines on one event: *"Protesters clash with police"* / *"Police confront demonstrators"*. Learner maps agency, blame, and sympathy created by each. |
| **HEARS** | Two news reports on one event; reconstructs each outlet's position from lexical choice alone, without either stating it. |
| **SAYS** | Competitive debate. In cross-examination, must expose an opponent's loaded terms and force a neutral restatement — synonymy as a live argumentative weapon. |
| **READS** | 800–950 word opposing texts on one issue; adjudicates between them, explicitly accounting for how each frames via word choice. Detects sophistry achieved through near-synonym substitution. |
| **WRITES** | Argumentative essay (600–800 words) that must steelman the opposing view **in that view's own preferred vocabulary** before rebutting it. Deliberately hard: using an opponent's loaded terms sympathetically requires understanding the frame from inside. |
| **THINKS** | Steelmanning. Recognises loaded language as a fallacy vector (8+ named fallacies at this level). Weighs trade-offs between persuasive force and honesty. Recognises their own bias in word selection. |
| **AI ASSESSMENT** | `frame-analysis` (rubric), `essay-write` with a dedicated steelman dimension, `debate-turn` scored on exposing loaded terms in real time, `source-reliability`. LLM rubric checks whether the steelman section actually uses the opposing frame's vocabulary or merely paraphrases the writer's own — a distinction that requires lexical comparison against a reference frame, not just a quality judgement. |
| **DIFFICULTY** | D1: two clearly loaded headlines, neutral alternatives supplied. D3: subtle framing, learner supplies neutral restatements. D5: writes the same argument twice with opposite loading, then a neutral version, and evaluates the ethics of all three. |
| **MASTERY** | `Mastered`: frame analysis ≥85% on 5 unseen text pairs, steelman dimension ≥4/5 in a full essay, exposes loaded terms in live debate on 4/5 opportunities, 56-day retention. |

---

### Level 4.3 — Rhetoric Strategist · `ms.syn.rhetorical-substitution`

| | |
|---|---|
| **SEES** | A euphemism/dysphemism ladder: `died · passed away · was lost · was liquidated · was terminated`. Mapped on two axes: distance from the referent, and institutional register. |
| **HEARS** | A political speech; identifies every euphemism and names what each conceals. |
| **SAYS** | 8–10 minute largely unscripted persuasive speech with a declared strategy; in a panel, defends or repudiates a specific euphemistic choice. |
| **READS** | 950–1,100 word speeches and essays; full rhetorical analysis in which lexical substitution is treated as a strategic instrument. Evaluates the text against its own goals. |
| **WRITES** | Rhetorical analysis essay treating word choice as strategy. Persuasive piece for a named audience with a documented lexical strategy. Then the ethical counterpart: an analysis of when euphemism is legitimate care and when it is evasion. |
| **THINKS** | Persuasion analysed as a system. Ethics of rhetorical choice — the level's distinctive cognitive demand. Cross-disciplinary synthesis (political language, medical communication, corporate disclosure). |
| **AI ASSESSMENT** | `rhetorical-analysis-essay` (LLM rubric + human sample audit), `euphemism-identify` on unseen speeches (precision/recall against a marked key), `keynote`-format speech with rubric on strategic coherence. Ethical reasoning is scored on quality of argument, never on reaching a particular conclusion — the rubric explicitly rewards a well-defended minority position. |
| **DIFFICULTY** | D1: obvious euphemisms, purposes supplied. D3: subtle substitutions in authentic political text. D5: constructs a persuasive text using euphemism, then publishes a self-critique of its own ethics. |
| **MASTERY** | `Mastered`: euphemism identification ≥0.8 precision/recall on unseen authentic text, rhetorical analysis essay ≥4/5 on insight, strategic speech ≥4/5, ethical analysis ≥4/5 on argument quality, 56-day retention. |

---

### Level 5.1 — Discourse Analyst · `ms.syn.ideological-choice`

| | |
|---|---|
| **SEES** | A corpus view: frequency of `migrant` vs. `refugee` vs. `asylum seeker` across four outlets over five years, with a co-occurrence network. Lexical choice as measurable ideology. |
| **HEARS** | Institutional discourse (corporate, governmental, academic); identifies the ideological work performed by standardised lexical choices. |
| **SAYS** | 10-minute academic presentation with defence, arguing a thesis about lexical choice in a discourse community, defending methodology under challenge. |
| **READS** | 1,100–1,400 word multi-source dossiers. Discourse analysis: how lexical selection constructs authority, identity, and unstated assumption. Evaluates the methodology of studies making claims about language. |
| **WRITES** | 1,000–1,200 word academic essay with a research question about lexical/ideological choice, literature synthesis, evidence, argument, and a limitations section. Paraphrase without distortion is separately assessed — paraphrasing an ideologically loaded source neutrally is a distinct and difficult skill. |
| **THINKS** | Systems-level analysis. Critique of methodology and evidence. Reflexive awareness of their own lexical positioning. Epistemic humility with stated uncertainty. |
| **AI ASSESSMENT** | `synthesise-sources` (rubric on synthesis vs. summary), `academic-essay` with dimensions for research question quality, methodology awareness, and limitations, `paraphrase` scored on both fidelity and neutrality, `present-with-QA` on defence quality. 2% human audit is elevated to **10%** at Level 5.x, where LLM rubric reliability on genuinely scholarly work is weakest. |
| **DIFFICULTY** | D1: two-outlet comparison, pattern pre-identified. D3: four-outlet corpus, learner finds the pattern. D5: learner defines their own research question, selects sources, and defends the selection against a charge of cherry-picking. |
| **MASTERY** | `Mastered`: discourse analysis ≥85% on unseen dossiers, academic essay ≥4/5 across all dimensions including limitations, neutral paraphrase of loaded sources 5/5, presentation defence ≥4/5, 70-day retention. |

---

### Level 5.2 — Communication Strategist · `ms.syn.audience-calibration`

| | |
|---|---|
| **SEES** | One technical finding, five audience cards: specialist peer, regulator, journalist, patient, investor. A lexical decision matrix — which term for each, and what each choice risks. |
| **HEARS** | High-stakes multi-speaker discourse (a briefing, a negotiation); tracks how participants converge or diverge lexically, and what that reveals about alignment. |
| **SAYS** | 12-minute professional presentation, then the same content in a 90-second version for a non-expert, then expert Q&A. Lexical calibration under time and status pressure. |
| **READS** | 1,400–1,800 word professional and technical documents read for decision-relevant content; rapid critical evaluation of whether terminology is being used precisely or evasively. |
| **WRITES** | Professional portfolio: the same finding as a technical report, a regulatory submission, a press note, and a plain-language explanation. Assessed on whether meaning survived every translation — the hardest requirement, because simplification usually distorts. |
| **THINKS** | Strategic: selects lexis by goal, audience, constraint, and risk. Evaluates their own communication's effect and adapts. Ethical reasoning about disclosure — when is a simpler word a kindness and when is it a concealment? |
| **AI ASSESSMENT** | `register-transform` at professional stakes, `report-write` / `proposal-write` / `email-write` rubrics, `pitch` and `interview-simulate` with rubric on lexical calibration. Cross-document consistency is checked programmatically: the same claim across five documents must not have changed truth value. |
| **DIFFICULTY** | D1: two audiences, terminology supplied. D3: five audiences, learner selects unaided. D5: a hostile audience with a real conflict of interest; learner must be simultaneously accurate, comprehensible, and non-evasive, then justify every trade-off. |
| **MASTERY** | `Mastered`: 4 audience-calibrated documents ≥4.5/5 each with verified meaning-preservation across all five, professional presentation + plain-language version + Q&A ≥4.5/5, demonstrates measurable adaptation after feedback 3/3, 90-day retention. |

---

### Level 5.3 — Language Wizard · `ms.syn.teaches-synonymy`

| | |
|---|---|
| **SEES** | Their own full trace through this concept — every level, every micro skill, every error pattern, from Level 1.3 to now. Then a blank lesson planner and a real younger learner's Language DNA. |
| **HEARS** | A Group 2 learner's actual recorded confusion between two near-synonyms. Diagnose it from the audio. |
| **SAYS** | Records a taught explanation of synonymy pitched at a specific younger level — with an accurate account of *why* the naive "same meaning" model must break at Level 2.2, and how to make that break feel like discovery rather than correction. |
| **READS** | Anything, for any purpose. In this concept's terminal assessment: reads two competing linguistic accounts of synonymy (structuralist and cognitive) and takes a defensible position. |
| **WRITES** | Capstone: a piece of writing whose lexical precision is itself the evidence — publication standard, distinctive style, deployed by choice. Plus a pedagogical artefact: the teaching sequence for synonymy, with its prerequisite reasoning made explicit. |
| **THINKS** | Metalinguistic mastery — reasons about synonymy as a linguistic phenomenon, not merely uses it. Creates a framework rather than applying one. Teaches, which is the terminal evidence. |
| **AI ASSESSMENT** | **AI cannot award this level alone.** AI scores the components (lexical precision metrics on the capstone, rubric on the pedagogical artefact, ASR/delivery on the recorded explanation) and verifies the quantitative gates (13 strands ≥4.5, none below 4.0, 90-day stability, 2 verified transfer domains). ≥2 human reviewers must then judge the capstone at publication standard and the teaching artefact as accurate and pedagogically sound. |
| **DIFFICULTY** | Band is no longer meaningful — tasks are authentic and open-ended. D5 only. |
| **MASTERY** | The full Level 5.3 criteria ([Phase 2](02_LEVEL_MAP.md#level-53--language-wizard)). For this concept specifically: the taught explanation must be accurate about the 2.2 conceptual break — a learner who teaches "synonyms mean the same thing" has not mastered synonymy, however fluent their own usage. **Teaching accuracy is the discriminating evidence**, and it is the reason this micro skill exists at all. |

### What the trace demonstrates

| Property | Evidence in the trace |
|---|---|
| **Nothing is taught once** | 13 distinct realisations across 13 levels |
| **Complexity rises on every axis** | vocabulary, independence, cognitive tier, context, communicative demand |
| **The naive model is deliberately broken** | Level 2.2 contradicts Level 1.3 *by design*, and the curriculum says so |
| **Difficulty is orthogonal to level** | each level has its own D1–D5 ladder |
| **Mastery requires time** | retention intervals grow 14 → 90 days |
| **Productive evidence is mandatory** | recognition items alone never seal a quest |
| **The concept changes category** | vocabulary skill → stylistic skill → epistemic skill → ethical skill |
| **Human review at the top** | AI is insufficient for Language Wizard |

---

# PART B — THE EIGHT REQUIRED CONCEPTS

Same nine dimensions, tabulated. Columns: **Sees · Hears · Says · Reads · Writes · Thinks ·
AI Assessment · Mastery Gate**. Difficulty in every cell follows the same D1→D5 pattern as Part A
(scaffold removal, option reduction, context novelty, production demand) and is therefore not
repeated per row.

---

## B1 — PHONICS

`concept:phon.*` · Pillar SOUND · Domain `phonics`
The instructive case: phonics does **not** vanish after Grade 3. It transforms into orthographic
morphology, then etymological spelling, then articulation. That transformation is the spiral.

| Lvl | Sees | Hears | Says | Reads | Writes | Thinks | AI Assessment | Mastery Gate |
|---|---|---|---|---|---|---|---|---|
| 1.1 | Letter shapes + object images | Sound isolated: */m/… mmm* | Imitates the sound | Nothing | Traces the letter | Sound ≠ letter name | `sound-match` 2-opt; ASR on isolated phoneme | 40/50 sounds matched, 14-day check |
| 1.2 | All 26 letters, sound-cued | Each letter's primary sound | Produces all 26 | 15–25 sight words | 26 letters with model | Letters map to sounds | `grapheme-sound` timed; ASR production | 24/26 produced <3 s, 10-day check |
| 1.3 | CVC words with sound buttons | 3-phoneme segmentation | Blends c-a-t → cat | Decodes CVC, 2–3 sentence texts | Dictated CVC words | Blending is a process | `nonsense-word-decode` (`P(G)`≈0); `segment-tap` | 18/20 unseen CVC, 14-day check |
| 2.1 | Digraphs/blends highlighted | 4-phoneme segmentation | Decodes blends aloud | 30–60 words, 45+ WCPM | Digraph words spelled correctly | Two letters, one sound | `timed-decode`; `sort-by-pattern` | 27/30 unseen, 45 WCPM, 14-day |
| 2.2 | Vowel teams, r-controlled, syllable splits | Syllable stress | Multi-syllable words | 60–120 words, 75+ WCPM | Affixed words spelled | Syllables carry structure | `split-word`; `stress-place`; `timed-decode` | 18/20 two-syllable, 75 WCPM, 21-day |
| 2.3 | Words split by morpheme, not syllable | Schwa in unstressed positions | Reads with prosody | 120–200 words, 100+ WCPM | Root+affix spelling accurate | Meaning-units beat sound-units | `morpheme-build`; prosodic `read-aloud-ASR` | 100 WCPM @97%, morpheme attack 8/10, 28-day |
| 3.1 | Stress-shift pairs (`PHOtograph/phoTOGraphy`) | Stress moves with derivation | Self-corrects stress | 200–350 words, 110–130 WCPM | Derived spellings correct | Morphology predicts both spelling and stress | `stress-place` on derived forms; minimal pairs | Stress ≥85% on unseen derived words, 28-day |
| 3.2 | Etymology cards (Greek/Latin/Anglo-Saxon) | Connected speech, linking | Linking and weak forms in fluent speech | 350–500 words, 130–150 WCPM | Etymology-informed spelling of hard words | Word origin predicts orthography | `spell-by-origin`; fluency ASR | Spelling ≥90% on origin-predictable words, 35-day |
| 3.3 | Intonation contours mapped to stance | Intonation carrying doubt/concession | Intonation for meaning | 500–650 words, 150–170 WCPM | Punctuation matched to intended prosody | Prosody is grammar you can hear | Pitch-contour comparison vs. reference; `read-aloud-ASR` | Contour match ≥80% on 5 stance items, 42-day |
| 4.1 | Waveform + pace/pause analytics | Extended speech, delivery choices tracked | Deliberate pace, pause, emphasis | 650–800 words, 170–190 WCPM | — | Delivery is a choice with an effect | ASR timing + energy; delivery rubric | Delivery ≥4/5 on a 6-min talk, 42-day |
| 4.2 | Fluency metrics under argumentative load | Debate audio, disfluency tracked | Articulation maintained while reasoning | 800–950 words, 190–210 WCPM | — | Fluency degrades under cognitive load | Disfluency rate during `debate-turn` | Disfluency <8% under rebuttal, 56-day |
| 4.3 | Rhythm and cadence notation | Speech rhythm as rhetoric | Parallelism realised prosodically | 950–1,100 words, 210–230 WCPM | — | Sound patterning persuades | Rhythm analysis; `keynote` rubric | Prosodic strategy ≥4/5 in an 8-min speech, 56-day |
| 5.1 | Phonological register comparison | Academic vs. conversational phonology | Register-shifts phonologically | 1,100–1,400 words, 230–250 WCPM | — | Accent and register are separable | Register-appropriate delivery rubric | Register shift ≥4/5 across 3 contexts, 70-day |
| 5.2 | Professional delivery analytics | High-stakes multi-speaker audio | Authority and precision under stakes | 1,400–1,800 words, 250+ WCPM | — | Clarity is strategic | Professional delivery rubric + expert Q&A | ≥4.5/5 on a 12-min professional presentation, 90-day |
| 5.3 | Their own phoneme trace, age 4 → now | A younger learner's mispronunciation | Keynote delivery; **coaches another's pronunciation** | Anything | — | Metaphonological mastery | Human review of the coaching artefact | Diagnoses and remediates another learner's error accurately — **human-reviewed** |

---

## B2 — VOCABULARY

`concept:lex.*` · Pillar WORD · Domains `vocab-breadth` + `vocab-depth`

| Lvl | Sees | Hears | Says | Reads | Writes | Thinks | AI Assessment | Mastery Gate |
|---|---|---|---|---|---|---|---|---|
| 1.1 | Picture + spoken label | Word repeated in context | Names 40+ pictures | — | — | Things have names | `picture-word` 2-opt + ASR naming | 40/50 named, 7-day check |
| 1.2 | Category groupings | Words in category sets | 2–3 word phrases using new words | Word labels | Copies words | Words group by meaning | `picture-word` 4-opt; `word-sort` | 600 receptive verified by sampling, 10-day |
| 1.3 | Opposite pairs | Antonyms contrasted | Uses opposites in speech | Simple sentences | Labels a drawing | Meaning has structure | `antonym-select`; oral production | 25 antonym pairs, 14-day |
| 2.1 | Word families, compounds | Words in short passages | Uses target words in sentences | 30–60 word passages | 2–3 sentences using target words | Words are built from parts | `context-cloze` w/ bank; `use-in-sentence` | 1,500 receptive / 800 productive, 14-day |
| 2.2 | Affix builder (prefix+root+suffix) | Affixed words in context | Explains an affixed word's meaning | 60–120 words | Paragraph using 3 target words | Affixes change meaning predictably | `morpheme-build`; open `context-cloze` | 4 affixes productive, 21-day |
| 2.3 | Root families (`port`→`transport/portable`) | Shades of meaning in prosody | Uses precise words with intent | 120–200 words | 2 paragraphs, ≥2 precise words | Roots carry meaning across words | `gradient-rank`; `paragraph-write` Language Range | Root attack 8/10 unseen, 28-day |
| 3.1 | Word webs, connotation maps | 15-min text; infers word meanings | 3-min talk with precise lexis | 200–350 words; infers from context | 3 paragraphs, target vocabulary required | I can work out words I've never met | `context-inference` (no bank); `word-web` | Context inference ≥80% on unseen words, 28-day |
| 3.2 | POS families (`analyse/analysis/analytical`) | Register-graded vocabulary in audio | 4–5 min presentation, register-appropriate | 350–500 words | 3 genres, register-appropriate lexis | One idea, many grammatical forms | `pos-transform`; `genre-write` | POS transformation ≥85%; 7,000/4,200, 35-day |
| 3.3 | Nominalisation and abstraction ladders | Academic register audio | 5-min analytical talk with abstract lexis | 500–650 words | Argumentative essay with academic lexis | Abstraction is a tool, not decoration | `nominalise`; essay Language Range ≥4/5 | Abstract lexis produced correctly 8/10, 42-day |
| 4.1 | Register triads across 3 formality levels | 25-min extended speech | 6-min talk, register-controlled | 650–800 words | Reflective essay, deliberate lexical voice | Word choice creates identity | `register-transform`; voice rubric | Register control ≥4/5 across 3 pieces, 42-day |
| 4.2 | Evaluative-lexis pairs | Debate audio; loaded terms tracked | Debate exposing loaded lexis | 800–950 words | Argumentative essay, precise qualification | Near-synonyms are argumentative moves | `frame-analysis`; essay reasoning dimension | Loaded-term detection ≥85%, 56-day |
| 4.3 | Full rhetorical metalanguage inventory | Speeches; euphemism identified live | 8–10 min speech, idiomatic and precise | 950–1,100 words | Rhetorical analysis using critical vocabulary | Metalanguage enables analysis | `rhetorical-analysis-essay` | Critical vocabulary used accurately ≥4/5, 56-day |
| 5.1 | Corpus frequency views across outlets | Institutional discourse | 10-min academic presentation | 1,100–1,400 words + dossiers | Academic essay, discipline-precise | Lexis signals ideology | `synthesise-sources`; academic rubric | Discipline lexis accurate ≥4/5, 70-day |
| 5.2 | Audience × terminology decision matrix | High-stakes technical audio | 12-min presentation + 90-s plain version | 1,400–1,800 words | 4 audience-calibrated documents | Precision and accessibility can conflict | Cross-document consistency check + rubrics | Meaning preserved across 5 audiences, 90-day |
| 5.3 | Their whole lexical growth trace | Specialist audio, any variety | Teaches word-learning strategy | Anything | Capstone with distinctive precision | Acquires and coins vocabulary independently | Human review of capstone + taught artefact | 24,000+/16,000+; **human-reviewed** |

---

## B3 — GRAMMAR

`concept:msyn.*` + `concept:syn.*` · Pillar SENTENCE · Domain `grammar-accuracy`
Traced through one representative structure per level to keep the progression concrete.

| Lvl | Structure | Sees | Hears | Says | Reads | Writes | Thinks | AI Assessment | Mastery Gate |
|---|---|---|---|---|---|---|---|---|---|
| 1.1 | — | — | Grammatical speech modelled | Holophrases | — | — | Implicit only | No explicit assessment | n/a |
| 1.2 | Plural `-s`, S+V | One vs. many, spoken | "dog runs", "two dogs" | Word labels | — | More than one changes the word | `listen-and-pick` singular/plural | 8/10 plural selection, 10-day |
| 1.3 | Simple past (10 irregulars) | Past-tense sentences | "I went", "I ate" | 2–3 sentence texts | 1 sentence, capital + full stop | Time changes the verb | Oral production + `cloze` | 8/10 irregular pasts, 14-day |
| 2.1 | S-V agreement (present) | Correct vs. incorrect contrasted | Self-corrects agreement | 30–60 words | 2–3 sentences, agreement correct | Subject controls the verb | `error-find`; `cloze`; free-writing rate | Agreement ≥85% in free writing, 14-day |
| 2.2 | Three tenses; `and/but/because/so` | Tense contrasts in audio | Uses `because` in speech | 60–120 words | Paragraph, tense consistent | Sentences can be joined | `tense-select`; `sentence-combine` | Tense consistency ≥85% in a paragraph, 21-day |
| 2.3 | Complex sentences; run-on repair | Subordination in speech | 9–12 word sentences w/ clauses | 120–200 words | 2 paragraphs, complex sentences | Clauses have ranks | `error-repair`; `judge-acceptability` | Repairs 8/10 run-ons; complex sentences 8/10, 28-day |
| 3.1 | Relative clauses `who/which/that` | Relative clauses in listening | Uses relative clauses in a 3-min talk | 200–350 words | 3 paragraphs with relative clauses | Clauses can be embedded | `sentence-combine`; free-production rate | Relative clauses 8/10 + in free writing, 28-day |
| 3.2 | Passive ↔ active; conditionals 1&2 | Reported speech in audio | Reports what others said | 350–500 words | 3 genres, voice chosen deliberately | Voice shifts focus, not facts | `transform` (deterministic key) | Transformation ≥85%; used by choice in writing, 35-day |
| 3.3 | Hedging & modality for stance | Hedged claims in critical listening | Hedges appropriately in a 5-min talk | 500–650 words | Argumentative essay, hedged claims | Grammar encodes commitment | `evidence-strength-match`; essay hedging dimension | Hedging ≥4/5 in an essay, 42-day |
| 4.1 | Cleft, inversion, fronting | Stylistic syntax in extended speech | Uses emphatic structures deliberately | 650–800 words | Essay with deliberate syntactic variety | Syntax creates emphasis | `transform`; sentence-variance metrics | Stylistic syntax 8/10 + measured variance, 42-day |
| 4.2 | Concessive/contrastive at discourse level | Argument structure in speech | Concedes then rebuts in debate | 800–950 words | 600–800 word essay, cohesive | Concession strengthens argument | Essay cohesion + counter-argument dimensions | Cohesion ≥4/5 across 900 words, 56-day |
| 4.3 | Periodic/cumulative sentences; parallelism | Rhythm in speeches | Parallelism in a live speech | 950–1,100 words | Rhetorical analysis + persuasive piece | Sentence shape persuades | Rhetorical-syntax rubric | Rhetorical syntax ≥4/5, 56-day |
| 5.1 | Transitivity and agency analysis | Institutional discourse grammar | Academic presentation, controlled syntax | 1,100–1,400 words | Academic essay, style modulated | Grammar carries ideology | Discourse-grammar analysis rubric | Transitivity analysis ≥85%, 70-day |
| 5.2 | Clarity metrics vs. complexity metrics | High-stakes discourse | Professional speech, error-free | 1,400–1,800 words | Professional documents | Clarity beats complexity | Error rate + clarity rubric | Error rate <1%; clarity ≥4.5/5, 90-day |
| 5.3 | Dialectal and historical variation | Any variety, without prejudice | **Explains grammar to others** | Anything | Breaks rules knowingly, justifies it | Grammar is a describable system | Human review of the taught explanation | Explains grammar accurately; **human-reviewed** |

---

## B4 — READING COMPREHENSION

`concept:comp.*` · Pillar UNDERSTANDING · Domains `reading` + `inference` + `critical-evaluation`

| Lvl | Sees | Hears | Says | Reads | Writes | Thinks | AI Assessment | Mastery Gate |
|---|---|---|---|---|---|---|---|---|
| 1.1 | Picture books, print concepts | 60–90 s read-aloud | Points and names | Own name; front/top of book | — | Print carries meaning | `listen-and-pick` after read-aloud | Print concepts 9/10, 7-day |
| 1.2 | Picture + single sentence | Story read aloud, 3–5 min | Recalls 2 events | 15–25 sight words | — | Stories have order | Picture-sequence after story | 2 events recalled, 10-day |
| 1.3 | 2–3 sentence texts + image | 5-min story | Answers who/what/where | Decodes and comprehends 2–3 sentences | — | Text answers questions | `literal-Q` after decoding | 3/4 literal, 90% decoding, 14-day |
| 2.1 | 30–60 word passage | Passage read aloud alongside | Retells beginning/middle/end | 45+ WCPM @95% | 2–3 sentences about the text | Text has a shape | `literal-Q` + `sequence` + 1 `inference-Q` | 4/5 comprehension incl. 1 inference, 14-day |
| 2.2 | 60–120 words, main-idea highlighter | Fact vs. opinion in speech | States the main idea aloud | 75+ WCPM | Paragraph: main idea + 2 details | Some ideas are bigger than others | `main-idea`; `inference-justify` | Main idea + 2 details in 4/5 texts, 21-day |
| 2.3 | 120–200 words, 2 texts side by side | 12-min text summarised | Summarises orally | 100+ WCPM @97% | Summary preserving proportions | Summary ≠ retelling | `summarise` rubric; `two-text-compare` | Summarises 4/5 without copying, 28-day |
| 3.1 | 200–350 words, structure diagram | Speaker attitude inferred | Explains an inference with evidence | 110–130 WCPM; skims and scans | 3 paragraphs analysing a text | Text structure aids meaning | `inference-justify`; `text-structure-ID` | Inferential ≥80% with cited evidence, 28-day |
| 3.2 | 350–500 words + a graph | Claim vs. evidence in audio | Traces an argument aloud | 130–150 WCPM, rate varied | Analysis of author's craft | Authors make choices | `evidence-cite`; `annotate` | Craft analysis ≥80%, 35-day |
| 3.3 | 500–650 words, argument map | Notes argument structure live | 5-min analytical presentation | 150–170 WCPM | Argumentative essay engaging the source | Arguments can be weak or strong | `premise-map`; `evaluate-sufficiency` | Argument evaluation ≥80%, 42-day |
| 4.1 | 650–800 words; 3 sources | 25-min academic speech | Explains stance construction | 170–190 WCPM | Synthesis of 3 sources | Form creates meaning | `source-reliability`; synthesis rubric | Critical comprehension ≥80%, 42-day |
| 4.2 | 800–950 words, opposing pair | Reconstructs spoken argument | Adjudicates in debate | 190–210 WCPM | Essay adjudicating two texts | Reasoning quality is assessable | `adjudicate-two-texts`; `fallacy-spot` | Argument reconstruction ≥85%, 56-day |
| 4.3 | 950–1,100 words + visual rhetoric | Analyses speech rhetoric live | 8-min rhetorical analysis talk | 210–230 WCPM | Rhetorical analysis essay | Texts are designed to work on me | `rhetorical-analysis-essay` | Rhetorical analysis ≥85%, 56-day |
| 5.1 | 1,100–1,400 word dossiers | Critiques specialised lectures | Presents a discourse analysis with defence | 230–250 WCPM | Academic essay with limitations | Texts construct authority | Discourse-analysis rubric; 10% human audit | Discourse analysis ≥85%, 70-day |
| 5.2 | 1,400–1,800 words, decision-focused | Extracts decisions from audio | Briefs others on what a document means | 250+ WCPM strategic | Professional brief from source documents | Reading serves decisions | Decision-extraction accuracy + brief rubric | Rapid critical evaluation ≥4.5/5, 90-day |
| 5.3 | Any text, any genre | Any spoken form | **Teaches reading strategy** | Anything, any purpose | Original defensible interpretation | Independent critical judgement | Human review | Original interpretation survives expert challenge; **human-reviewed** |

---

## B5 — SENTENCE FORMATION

`concept:syn.*` · Pillar SENTENCE · Domains `syntax` + `sentence-style`

| Lvl | Sees | Hears | Says | Reads | Writes | Thinks | AI Assessment | Mastery Gate |
|---|---|---|---|---|---|---|---|---|
| 1.1 | Single word + image | Single words in speech | One word | — | — | A word can be a message | Oral naming | 40/50 named |
| 1.2 | Two word-cards to combine | 2-word phrases | "big dog", "dog runs" | — | — | Words combine | Drag-to-combine; ASR | 8/10 valid 2-word combinations, 10-day |
| 1.3 | Sentence frame with slots | Simple sentences | 3–5 word sentences | 2–3 sentence texts | 1 sentence, capital + stop | A sentence is complete | `sentence-build` from word bank | 2 conventional sentences unaided, 14-day |
| 2.1 | Sentence with expandable slot | Sentences with adjectives | 5–7 word sentences | 30–60 words | 2–3 connected sentences | Sentences can grow | `sentence-build`; expansion task | 3 connected sentences, 2/3 conventions, 14-day |
| 2.2 | Two sentences + a conjunction card | Joined sentences in audio | Uses `because/so` in speech | 60–120 words | 5-sentence paragraph, varied openings | Sentences can join | `sentence-combine`; opening-variety metric | Compound sentences 8/10; varied openings, 21-day |
| 2.3 | Simple/compound/complex sorter | Subordination in speech | 9–12 word sentences w/ clauses | 120–200 words | 2 paragraphs, mixed sentence types | Sentences have types | `judge-acceptability`; type-sort; `error-repair` | Produces all 3 types correctly 8/10, 28-day |
| 3.1 | Clause-bracketing tool | Relative clauses in listening | Embeds clauses in a 3-min talk | 200–350 words | 3 paragraphs, embedded clauses | Clauses nest | `sentence-combine` w/ relatives | Relative clauses 8/10 + free production, 28-day |
| 3.2 | Reduction ladder (relative→participial) | Reduced clauses in audio | Uses reduced clauses naturally | 350–500 words | 3 genres, deliberate variety | Structures can be compressed | `transform` (deterministic); variance metrics | Reduction ≥85%; measured variety, 35-day |
| 3.3 | Nominalisation converter | Academic register audio | Nominalised abstraction in a 5-min talk | 500–650 words | Essay with complex noun phrases | Nouns can carry processes | `nominalise`; noun-phrase complexity metrics | Nominalisation 8/10 correct, 42-day |
| 4.1 | Cleft/inversion/fronting builder | Emphatic structures in speech | Emphatic structures by choice | 650–800 words | Essay with deliberate stylistic syntax | Syntax positions emphasis | `transform`; stylistic rubric | Stylistic syntax 8/10 + measured, 42-day |
| 4.2 | Cohesion map across 900 words | Argument cohesion in speech | Sustains structure under rebuttal | 800–950 words | 600–800 word cohesive essay | Cohesion operates above the sentence | Cohesion rubric + reference-chain analysis | Cohesion ≥4/5 across 900 words, 56-day |
| 4.3 | Periodic vs. cumulative comparison | Rhythm and parallelism | Parallelism in a live speech | 950–1,100 words | Rhetorically patterned prose | Sentence shape has an effect | Rhetorical-syntax rubric | Rhetorical syntax ≥4/5, 56-day |
| 5.1 | Theme/rheme information-flow view | Information packaging in discourse | Controlled academic syntax | 1,100–1,400 words | Academic essay, style modulated | Information order shapes reading | Information-structure rubric | Information packaging ≥4/5, 70-day |
| 5.2 | Readability vs. precision dashboard | High-stakes discourse | Precise professional syntax | 1,400–1,800 words | Professional documents | Simple syntax is often harder to write | Clarity + accuracy metrics | Clarity ≥4.5/5, error rate <1%, 90-day |
| 5.3 | Their own syntactic development trace | Any variety | **Teaches sentence construction** | Anything | Distinctive syntax by choice | Syntax is an expressive instrument | Human review | Distinctive style + accurate teaching; **human-reviewed** |

---

## B6 — SPEAKING

`concept:prag.*` + `concept:disc.*` · Pillars EXPRESSION + COMMUNICATION

| Lvl | Sees | Hears | Says | Reads | Writes | Thinks | AI Assessment | Mastery Gate |
|---|---|---|---|---|---|---|---|---|
| 1.1 | Object images, mascot model | Word modelled by an adult voice | Imitates single words | — | — | My voice makes words | ASR on isolated words; **no visible score** | 40/50 named, 7-day |
| 1.2 | Picture prompts | 2–3 word phrases modelled | 2–3 word phrases; all 26 sounds | — | — | I can be understood | ASR phoneme + word accuracy | 24/26 sounds; 8/10 phrases, 10-day |
| 1.3 | 5-picture story strip | Story modelled | Narrates 4–5 events; one `because` | Reads own writing aloud | — | I can tell a whole thing | ASR + `oral-retell` rubric (content) | 4 sequenced events, 14-day |
| 2.1 | Process diagram (3 steps) | Model recount | 3-step process; 4-sentence recount | Reads aloud to punctuation | — | Order matters to a listener | ASR fluency + rubric; `read-aloud-ASR` | 30-s talk ≥3/4; 45 WCPM read-aloud, 14-day |
| 2.2 | Talk planner (3 points) | Sequencing markers modelled | 1-min talk with `first/next/finally` | Read-aloud with expression | Notes for the talk | Talks need structure | Rubric: content, sequence, fluency, delivery | 1-min talk ≥3/4, 21-day |
| 2.3 | Character POV cards | Prosody matched to punctuation | 2-min talk, 3 points; POV retell | Prosodic read-aloud | Talk notes | I can speak as someone else | Rubric + ASR prosody; POV consistency | 2-min talk ≥3/4; POV maintained, 28-day |
| 3.1 | Debate frame (claim + 2 reasons) | Structured debate audio | 3-min organised talk; debate turn | 200–350 words aloud | Talk outline | An audience needs signposts | Rubric ≥3.5/5 organisation + fluency | 3-min talk ≥3.5/5, 28-day |
| 3.2 | Slide/visual builder | Rebuttal modelled | 4–5 min presentation w/ visuals; rebuttal | 350–500 words | Presentation script then notes-only | Visuals support, don't replace | Rubric: structure, delivery, language | 4-min presentation ≥3.5/5, 35-day |
| 3.3 | Q&A prep grid | Formal debate audio | 5-min analytical talk; manages Q&A | 500–650 words | Analytical outline | Questions are opportunities | Rubric + Q&A handling dimension | 5-min talk ≥4/5 reasoning, 42-day |
| 4.1 | Delivery analytics (pace/pause/volume) | Extended speech, delivery tracked | 6-min talk, deliberate delivery; extempore | 650–800 words | Speech with a stated delivery plan | How I say it is part of what I say | ASR timing + delivery rubric | 6-min talk ≥4/5 delivery, 42-day |
| 4.2 | Debate flow sheet | Cross-examination audio | Competitive debate; 7-min persuasion; hostile Q&A | 800–950 words | Constructive + rebuttal briefs | Fluency must survive pressure | Rubric across constructive/CX/rebuttal; disfluency under load | Debate ≥4/5; disfluency <8%, 56-day |
| 4.3 | Rhetorical strategy planner | Speeches analysed live | 8–10 min largely unscripted; panel; 60-s impromptu | 950–1,100 words | Speech with documented strategy | Delivery serves strategy | `keynote` rubric: strategy, delivery, impact | 8-min speech ≥4/5, 56-day |
| 5.1 | Academic presentation + defence format | Specialised lectures | 10-min academic presentation with defence; seminar | 1,100–1,400 words | Presentation with limitations stated | Defending is part of presenting | Rubric + defence quality; 10% human audit | Presentation + defence ≥4/5, 70-day |
| 5.2 | Negotiation and pitch frameworks | High-stakes multi-speaker | 12-min professional presentation; negotiation; interview | 1,400–1,800 words | Professional speaking documents | Speech achieves outcomes | Professional rubric ≥4.5/5 + expert Q&A | 12-min presentation + Q&A ≥4.5/5, 90-day |
| 5.3 | Their own speaking trace | Any variety, any speed | Keynote 15-min; **teaches through speech** | Anything | — | Speech is an instrument I command | Human review of keynote + teaching | Keynote standard + teaching accuracy; **human-reviewed** |

Note the affect handling at 1.1–1.2: ASR scores are computed for the engine but **never shown**.
A 4-year-old told their pronunciation scored 0.62 learns to stop speaking. The signal-rule for
avoidance behaviour (Phase 6 §6.3 rule 9) applies at every level, but the *default* of hidden
scoring applies through Group 1 and much of Group 2.

---

## B7 — WRITING

`concept:disc.*` + `concept:mech.*` · Pillar EXPRESSION · Domain `writing-production`

| Lvl | Sees | Hears | Says | Reads | Writes | Thinks | AI Assessment | Mastery Gate |
|---|---|---|---|---|---|---|---|---|
| 1.1 | Stroke paths, letter guides | Instruction spoken | Names the letter | — | Scribble, strokes, traces 6–8 letters | Marks can mean something | Stroke-path accuracy (touch trace) | 6/8 letters traced, 7-day |
| 1.2 | Letter models | Letter sounds | Says as they write | — | 26 letters w/ model; own name | Letters are drawn the same way each time | Formation scoring; name accuracy | 26 letters legible; name unaided, 10-day |
| 1.3 | Sentence frame + word bank | Dictated words | Reads own writing aloud | Own sentence | 1 sentence, capital + stop; dictated CVC | Writing is speech I can keep | Dictation accuracy; `sentence-build` | 2 conventional sentences, 14-day |
| 2.1 | Prompt + picture | Prompt read aloud | Says the sentence before writing | Own writing | 2–3 connected sentences | Sentences can connect | Conventions + coherence rubric | 3 sentences, 2/3 conventions, 14-day |
| 2.2 | Paragraph frame (topic + 3 details) | Model paragraph read | Plans aloud | 60–120 words | 5-sentence paragraph, edits to a checklist | Paragraphs have a shape | Rubric (5 dims, accuracy-weighted 35%) | Paragraph ≥3/4 coherence + conventions, 21-day |
| 2.3 | Two-paragraph planner | Dialogue read aloud | Reads draft aloud to find errors | 120–200 words | 2 paragraphs + transition; dialogue punctuation; revises | Revision improves writing | Rubric + revision-delta measurement | 2-paragraph piece ≥3/4, 28-day |
| 3.1 | Intro/body/conclusion planner | Model essays | Explains own structure | 200–350 words | 3 paragraphs; opinion w/ 2 reasons; 2nd draft | Structure serves the reader | Rubric ≥3.5/5 structure + language | 3-paragraph piece ≥3.5/5, 28-day |
| 3.2 | Genre templates ×3 | Genre exemplars read aloud | Presents own writing | 350–500 words | 3 genres; cohesion across paragraphs; basic citation | Genres have conventions | Rubric per genre + cohesion analysis | 3 genres each ≥3.5/5, 35-day |
| 3.3 | Argument outline w/ counter slot | Argument exemplars | Defends own thesis | 500–650 words | Argumentative essay + counter-argument; outline first | Anticipating objections strengthens me | Rubric w/ argument-quality dimension ≥4/5 | Essay ≥4/5 argument, ≥3.5/5 language, 42-day |
| 4.1 | Voice/style analytics on own text | Voiced prose read aloud | Explains lexical strategy | 650–800 words | Reflective essay w/ voice; literary analysis w/ quotation | I have a voice and can choose it | Rubric Voice & Register ≥4/5 + measured statistics | 3 genres ≥4/5 voice control, 42-day |
| 4.2 | Evidence-integration map | Argument audio | Defends the essay in debate | 800–950 words | 600–800 word essay; steelman; citation; edits for logic | Logic is editable | Rubric: reasoning, evidence integration, counter-argument | Essay ≥4/5 reasoning, 56-day |
| 4.3 | Rhetorical strategy planner | Speeches as written texts | Presents the analysis | 950–1,100 words | Rhetorical analysis; strategic persuasion; 4+ source report | Writing is designed on purpose | Rubric: insight + language ≥4/5; citation check | Analysis essay ≥4/5 both, 56-day |
| 5.1 | Academic template w/ limitations section | Academic discourse | Defends the research question | 1,100–1,400 words + dossiers | 1,000–1,200 word academic essay; paraphrase; full citation | Acknowledging limits is strength | Academic rubric; plagiarism + paraphrase-fidelity checks; 10% human audit | Essay ≥4/5 all dimensions, 70-day |
| 5.2 | Professional document templates | Professional discourse | Briefs stakeholders | 1,400–1,800 words | Proposal, report, brief, plain-language version; edits others | Documents do work in the world | Rubrics + cross-document consistency check | 5-document portfolio at publication standard, 90-day |
| 5.3 | Their own writing development trace | — | **Teaches writing** | Anything | Capstone at publication standard; mentors others | Writing is mine to command | ≥2 human reviewers | Publication standard + accurate mentoring; **human-reviewed** |

---

## B8 — CRITICAL THINKING

`concept:cog.*` · Pillar THINKING · Domains `reasoning` + `analysis-synthesis` + `metacognition`

| Lvl | Sees | Hears | Says | Reads | Writes | Thinks | AI Assessment | Mastery Gate |
|---|---|---|---|---|---|---|---|---|
| 1.1 | Sorting trays, one attribute | "Which one is different?" | Names the odd one | — | — | Things can be grouped | `odd-one-out`; sort accuracy | 8/10 single-attribute sorts, 7-day |
| 1.2 | Two-attribute grids; 3-picture sequences | "What happens next?" | Predicts aloud | — | — | Things happen in order | Sequence accuracy; prediction | 3-picture sequence 8/10, 10-day |
| 1.3 | Cause→effect picture pairs | "Why did that happen?" | Answers "why" with `because` | 2–3 sentence texts | — | Things happen for reasons | Causal-pair matching; oral `because` | 8/10 cause–effect, 14-day |
| 2.1 | Venn diagram, 2 items | "How are they the same/different?" | Compares aloud with justification | 30–60 words | 2–3 sentences comparing | Same and different can both be true | Compare/contrast rubric; justified prediction | Compare/contrast 8/10 with reason, 14-day |
| 2.2 | Problem→solution frames; analogy grids | Fact vs. opinion in speech | Explains cause with evidence | 60–120 words | Paragraph: problem and solution | Some statements can be checked | `fact-opinion-sort`; simple `analogy` | Fact/opinion ≥85%; analogy 7/10, 21-day |
| 2.3 | Relevance filter (keep/discard) | Comparison signals in audio | Opinion + 2 reasons | 120–200 words | Opinion piece, 2 reasons | Not everything matters equally | Relevance judgement; multi-step `inference-justify` | Multi-step inference ≥80%, 28-day |
| 3.1 | Argument parts labelled | Bias markers in speech | Explains an unstated assumption | 200–350 words | 3 paragraphs evaluating reasons | Arguments have hidden parts | `assumption-ID`; `evaluate-reasons` | Assumption identification ≥80%, 28-day |
| 3.2 | Criteria table for evaluation | Persuasive technique in audio | Evaluates against stated criteria | 350–500 words | Evaluation using explicit criteria | Judgement needs criteria | `evaluate-sufficiency`; criteria-application rubric | Criteria-based evaluation ≥80%, 35-day |
| 3.3 | Fallacy cards (4 named); correlation vs. cause | Assertion/evidence/appeal separated | Counter-argues own position | 500–650 words | Essay w/ counter-argument + rebuttal | My own view can be attacked | `fallacy-spot` (4); counter-argument rubric | 4/5 fallacies; counter-argument ≥4/5, 42-day |
| 4.1 | Framing-effect comparisons; analogy limits | Speaker credibility judged | Explains and revises own reasoning | 650–800 words | Reflective analysis of own reasoning | My reasoning is inspectable | `source-reliability`; calibrated-confidence check | Source evaluation ≥80%; calibration ±15%, 42-day |
| 4.2 | Premise/conclusion maps; 8 fallacy cards | Unstated premises identified | Steelmans then rebuts in debate | 800–950 words | Essay steelmanning the opposition | The strongest opposing case is worth building | `premise-map`; `steelman` rubric; `fallacy-spot` (8) | 8/10 fallacies; steelman ≥4/5, 56-day |
| 4.3 | Persuasion-as-system diagram; ethics frames | Manipulation detected in media | Defends an ethical judgement | 950–1,100 words | Rhetorical + ethical analysis | Persuasion has ethics | Ethical-reasoning rubric (argument quality, not conclusion) | Ethical analysis ≥4/5, 56-day |
| 5.1 | Methodology critique frames; corpus data | Specialised lectures critiqued | Presents a critique with stated uncertainty | 1,100–1,400 words + dossiers | Academic essay with limitations | Knowing what I don't know is knowledge | Methodology-critique rubric; `hypothesis-test`; 10% human audit | Methodology critique ≥4/5, 70-day |
| 5.2 | Trade-off matrices; risk frames | Decisions extracted from discourse | Recommends under uncertainty | 1,400–1,800 words | Decision brief with trade-offs and risks | Good reasoning ends in a decision | Strategic-reasoning rubric ≥4.5/5 | Decision brief ≥4.5/5, 90-day |
| 5.3 | Their own reasoning-development trace | Any discourse | **Teaches reasoning** | Anything | Original framework, not applied but built | I can make the tools others use | ≥2 human reviewers | Original framework + accurate teaching; **human-reviewed** |

---

## Cross-concept observations

Five patterns recur across all nine traces, and they are the substance of the architecture rather
than coincidences of presentation:

1. **Concepts change category as they climb.** Synonyms: vocabulary → style → epistemics → ethics.
   Phonics: perception → decoding → morphology → delivery. Grammar: correctness → meaning →
   ideology. A curriculum that treats a concept as one fixed kind of thing cannot spiral it.

2. **The naive model is broken on purpose, at a known level.** Synonyms break at 2.2 ("synonyms
   are interchangeable" → false). Grammar breaks at 5.1 ("grammar is about correctness" → it is
   about meaning). These breaks are authored events with their own micro skills, not accidents. A
   spiral that only *adds* never produces conceptual change.

3. **Productive evidence gates everything.** In every trace, `Mastered` requires the learner to
   *use* the skill in their own speech or writing. This is enforced mathematically by format
   guess rates (Phase 5 §5.2), not merely by policy.

4. **Retention intervals grow 7 → 90 days.** Mastery at Level 5.2 means something durably
   different from mastery at Level 1.2, and the difference is measured, not asserted.

5. **Level 5.3 is always "teaches it."** Across all nine concepts, the terminal evidence is a
   taught explanation judged by humans. Teaching is the only task that cannot be faked by
   pattern-matching, and it is the only place in the architecture where AI is declared
   insufficient.

---

## Phase 10 readiness

> **⚠️ SUPERSEDED.** The readiness table that stood here has been replaced by
> [**Phase 16 §16.8**](16_PHASE_10_ROADMAP.md#168-revised-phase-10-readiness), under the Curriculum
> Operating Model (Phases 11–16).
>
> **What changed and why.** This document previously concluded that the critical path was authoring
> the 120 (level × pillar) cells — roughly 1,400 competencies — because everything downstream
> addresses those nodes. That reasoning was correct about *dependency* and wrong about *sequence*.
>
> Authoring 1,400 competency contracts before proving that contracts actually produce good content
> risks ~230 expert-days against an unvalidated contract design. Two corrections follow:
>
> 1. **The 21 `LevelDefaults` / `GroupPolicy` / `GlobalPolicy` rows come first.** Roughly a third of
>    every contract's fields are properties of the *level*, not the competency. Authoring them once
>    (21 rows) instead of 1,400 times removes ~19,000 duplicated values and the entire class of
>    contradiction where a competency's stated ceiling disagrees with its level's.
>    See [Phase 12 §12.3](12_COMPETENCY_CONTRACTS.md#123-the-34-fields-tiered).
> 2. **Only 40 contracts are authored before the pilot.** The pilot proves the generation machine
>    on a representative sample — including the two hardest cases (cross-level remediation for older
>    learners, and a deliberate conceptual change) — before the remaining ~1,360 are written.
>    See [Phase 16 §16.4](16_PHASE_10_ROADMAP.md#164-pilot-selection).
>
> The nine concept traces above remain valid and unchanged. They are the pedagogical specification
> that the contracts in Phase 12 formalise — Part A's Level 2.2 entry is exactly the conceptual
> change worked into a full Competency Contract at
> [Phase 12 §12.7](12_COMPETENCY_CONTRACTS.md#127-worked-contract--a-high-risk-conceptual-change).
