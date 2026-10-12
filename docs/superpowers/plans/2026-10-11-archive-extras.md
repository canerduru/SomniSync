# Archive Extras Implementation Plan

**Goal:** Apply the three approved GitHub extras to the existing mobile application.
**Architecture:** Pure archive theme helpers, native SVG radar, local curated educational catalogue, shared share-card geometry and SVG rendering. Existing backend contracts remain intact.
**Tech Stack:** Expo, React Native, TypeScript, react-native-svg, i18next.
**Spec:** ../specs/2026-10-11-archive-extras-design.md
**Execution:** Implement in this session; prior user authorization covers the three described extras.

## Global constraints
- No new dependencies, providers, paid requests, personal physiological claims or schema changes.
- TR/EN text, accessible controls, native/web support, preserve private export payload.

## Review focus
- Empty/pending/deleted/duplicate entries must not inflate counts.
- Exact tags must avoid substring and interpretation-driven matches.
- Search/date/tag/theme filters must intersect and reset together.
- Native preview and web exports must use the selected ratio and identical field positions.
- Long or hostile strings must stay bounded and escaped; export cannot include transcript or identity.

### 1. Archive radar
Files: src/features/insights/themes.ts, DreamRadar.tsx; app/(tabs)/grimoire.tsx; tests/insights.test.ts; TR/EN resources.
Interfaces: ThemeMode; theme IDs; matchesTheme(entry,id); analyzeThemes(entries,mode) returning total, axes {id,count,percentage}, dominant IDs.
- [x] Test empty, ready/deleted, duplicate IDs, exact aliases, unrelated text, percentages/ties.
- [x] Implement pure helpers and SVG diagram plus accessible filter buttons.
- [x] Integrate intersecting archive filter and localized empty states.
- [x] Run tests/typecheck.

### 2. Educational panels
Files: src/features/insights/science.ts, SciencePanel.tsx; app/dreams/[id].tsx; tests/insights.test.ts; TR/EN resources.
Interfaces: immutable curated citation catalogue; four topics mapped to bibliography and localized question/explanation keys.
- [x] Verify source identifiers, topic associations and external URL allowlist in tests.
- [x] Implement collapsible panel with general research and symbolic distinction, translated link error.
- [x] Integrate ready dream detail and run tests/typecheck.

### 3. Post/Story cards
Files: src/features/sharing/card.ts, ShareCard.tsx, export-card.ts, export-card.web.ts; app/share/[id].tsx; tests/insights.test.ts; TR/EN resources.
Interfaces: CardFormat='post'|'story'; cardDimensions(format); shared cardLayout(payload); buildShareSvg(payload).
- [x] Test exact dimensions, bounded fields, XML escaping and excluded private fields.
- [x] Implement shared SVG geometry for preview, native capture and web serializer.
- [x] Add format selector, preserve private image embedding/cleanup and error states.
- [x] Run full tests, typecheck, formatting, all-platform export and browser inspection.

### 4. Delivery
- [x] Record verification and remaining device limits in docs/phase-5-extras-verification.md.
- [x] Update README with features, workspace setup and preview instructions.
