# Grounded Science Implementation Plan

> **For agentic workers:** Execute task-by-task in this session. User explicitly delegated design and execution; no additional method selection is needed. A fresh reviewer checks the final changes.

**Goal:** Deliver grounded observations, corrections, optional journal and bounded source explanations.

**Architecture:** Pure shared domain functions serve Edge and Expo. Owner-scoped RPCs persist journal/review/revision. Live extraction uses structured candidates with server validation; demo uses explicitly labelled conservative rules.

**Tech Stack:** Existing Expo/React Native, TypeScript, Zod, Supabase/Postgres.

**Spec:** `docs/superpowers/specs/2026-10-12-grounded-science-design.md`

## Global Constraints

- No new dependencies, no hidden training/research collection, no personal physiology inference.
- schemaVersion=1; tags 0–6; TR/EN; revision conflict rejection; source ids selected by code.
- Preserve existing storage/auth/deletion paths; no remote deployment or paid API call needed for local verification.

## Review Focus

- Negation and metaphor must never become affirmative tags in deterministic fixtures.
- A transcript revision invalidates old observations and all derived fields.
- Missing journal answers differ from zero; conflicting dates are excluded.
- Same-id duplication differs from a genuinely recurring dream on another day.
- Legacy/demo outputs must not be claimed as measured live scientific accuracy.

### Task 1: Pure domain and adversarial contracts
Files: `supabase/functions/_shared/grounding.ts`, `knowledge.ts`, `journal.ts`; `tests/grounding.test.ts`.
Interfaces: `groundCandidates(transcript,candidates,revision,extractor)`, `acceptedTags(report)`, `demoReport(transcript,revision)`, `selectKnowledge(report)`, `parseJournal(value)`, `summarizeJournal(dreams)`.
- [x] Write adversarial tests covering the grounding contract and regression cases.
- [x] Implement bounded candidate validation, source catalogue, journal parsing/counts.
- [x] Run tests; retain case-by-case report rather than model accuracy.

### Task 2: Persistence and pipeline
Files: new migration `20261012001100_grounded_science.sql`; repository contracts/implementations, mock pipeline/data, client/backend schemas, providers, Edge API.
Interfaces: `updateTranscript(id,text,{expectedRevision})` saves draft only; `analyze(id,{processingConsent})`; `saveJournal(id,journal)`; `rejectObservation(id,index,rejected,revision)`.
- [x] Add owner-scoped journal/review/revise operations and source revision invalidation.
- [x] Extend structured live response; server derives tags and safe educational neuroscience text.
- [x] Add integration checks for stale/rejected reports, empty tags and same-id correction.

### Task 3: User flows
Files: `EvidencePanel.tsx`, `JournalPanel.tsx`, `JournalSummary.tsx`, detail/archive, DreamProvider, locales.
- [x] Render evidence, provenance, rejection and editable transcript + reanalysis.
- [x] Render optional journal with blank answers; show matched/missing counts in archive.
- [x] Render allowlisted educational explanations; clearly separate symbolic lenses.

### Task 4: Verification and independent review
- [x] Run `npm test`, `npm run typecheck`, formatting, available SQL/backend checks.
- [x] Export web/iOS/Android and inspect web flows with browser.
- [x] Fresh independent review; fix material findings and rerun affected tests.
- [x] Record exact checks, limitations and deployment instructions in `docs/grounded-science-verification.md`.
