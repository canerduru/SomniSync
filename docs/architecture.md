# Architecture and phase boundaries

## Application

`app/` contains route entries. `src/features/` owns feature logic. `src/components/ui/` owns reusable presentation. Services are injected through contracts; screens must not import a concrete AI provider. Phases 1–4 are implemented. The composition root selects in-memory demo or Supabase adapters. AI providers run exclusively inside the Edge Function.

The application starts in Turkish. Translation keys are typed against the Turkish resource, with an English resource containing the same keys. Add a locale by extending the resource registry, locale type and database locale constraint. User-visible errors must map stable error codes to translations; raw provider errors must not appear in the UI.

Theme tokens centralize colors, spacing and typography. Motion configuration uses Reanimated's system reduced-motion setting. No recording permissions are requested before a recording feature exists.

## Database ownership

`auth.users` owns identity and credentials. A fixed-search-path signup trigger creates `public.users`. Profile updates are limited to locale, timezone and consent fields. Users cannot delete the profile independently of auth/media cleanup.

Dreams are private with no public visibility toggle. RLS protects each row; column grants additionally prevent ownership transfer, forged processing status and derived analysis changes. Text editing must use a Phase 3 server transaction that invalidates old analysis, tags and generated media. A text draft requires a nonempty transcript. Audio drafts can initially omit the transcript.

Normalized theme slugs are language independent. The dictionary contains no counts or user-supplied text. Only the server creates tags and assigns them to dreams. The strict service schema requires all three interpretation lenses and 3–6 unique normalized tags. Output language is explicitly prompted and reviewed in live verification; TypeScript alone cannot validate semantic language quality.

Connections use a canonical unordered pair and an expiry. No client grants or RLS policies expose raw rows or counterpart user UUIDs. The authenticated `get_synastry` RPC derives identity from auth.uid() and returns anonymous labels and shared themes only.

Service-role bypasses RLS. Every future privileged endpoint must check the authenticated caller's ownership explicitly. User IDs from request bodies are never authorization.

## Consent and social queries — implemented in Phase 3

Account aggregate/matching consent and per-dream opt-in are separate and off by default. Both are required. Analytics consent is independent and initially off. The UI must explain each purpose before writing consent and identify the dreams included. Timestamps record the latest affirmative consent; null means withdrawn or never granted.

Read current consent on every social request. Do not cache identifiable matching responses across consent changes. Hiding or deleting stale connection rows is required when consent is withdrawn.

Stats count distinct consenting users with eligible ready dreams, not dream rows. Count a user at most once per theme and cohort. Define the previous-night interval using the requesting user's timezone and show its date, timezone, denominator and limited coverage. Do not describe the opt-in sample as all global users.

Initial disclosure threshold: at least 20 contributing users and at least 5 users both with and without a displayed theme. Suppress complementary counts and combinations that reveal small groups. Keep filters fixed and coarse; arbitrary custom cohorts must not be exposed. Sparse cohorts return insufficient-data states without invented percentages. Mock figures must be visibly marked as examples.

## Media

Both buckets are private with MIME and size limits. Paths are `{user_id}/{dream_id}/{filename}`. All media writes and deletes are server-only. The Phase 3 mock uses deterministic `mock.png` and `capture.ext` names for idempotent capture retries; Live AI uses job-versioned media names. A renewable per-user mutation lease serializes uploads and cleanup. Lease tokens and functions are inaccessible to ordinary clients.

Use authenticated access or short-lived signed URLs. Never persist signed URLs as permanent paths. Revocation does not invalidate an already issued signed URL immediately; use short TTLs and delete objects when deletion is requested.

A database cascade does not remove Storage objects. Account/dream deletion must use authenticated, idempotent server cleanup through the Storage API, remove media before deleting DB/auth records, and retry partial failures. Do not report completed deletion until cleanup succeeds. Account deletion must terminate sessions; public-table foreign keys ensure deleted accounts cannot create new dream rows with an unexpired old JWT.

Shared cinematic cards are exported locally after a deliberate share action, with a SomniSync watermark. There is no public bucket for share cards.

## AI — Phase 4 requirements

No external AI calls exist through Phase 3. Validate JSON with `dreamAnalysisSchema`, map normalized tags to the dictionary and save analysis transactionally. Pass the requested locale explicitly, with Turkish as default. Astrology requires verified transit context; unavailable context must be disclosed rather than invented. Do not present interpretations as diagnoses.

Provider secrets remain in Edge Function secrets. Add timeouts, bounded retries, idempotency, per-user rate limits and cost guards in Phase 4. Dream/audio content must not enter request logs, crash metadata or analytics payloads. Analytics starts in Phase 5 and never includes dream text, tags, prompts or media.

## Verification limits

RLS tests run against a real local Supabase Postgres instance with two users, authenticated/anon roles, private Storage paths and transactional rollback. Native bundles are exported for both platforms, but simulator and physical-device execution remain untested. Dependency audit findings are documented in README and must be assessed before release.

## Phase 3 implementation notes

The `dreams-api` Edge Function verifies its bearer token with Auth.getUser() before any privileged access; ownership comes exclusively from that verified identity. The service-role credential uses the built-in server environment. No provider API keys are requested or required. Text reanalysis and tag replacement occur in a single service-only Postgres transaction. The HTTP handler validates strict request and mock-analysis schemas.

Account deletion first freezes the profile, then recursively removes all private media (including upload leftovers), then deletes Auth identity and cascading rows. A failure preserves the identity for an authenticated retry. Single-dream cleanup marks its row pending; it remains visible only to its owner for a retry and is excluded from social queries. Storage cannot be mutated directly by clients. Existing signed URLs can remain valid until their five-minute expiry, or until the underlying object is deleted.

Aggregate periods use the previous dream_date in the caller's IANA timezone, rather than a sleep-tracking window. They represent the consenting sample only. Eligibility is read live. Matching uses normalized theme sets from the last 30 days; Jaccard similarity is stored on canonical connections and only sanitized labels/shared themes are returned. Consent changes invalidate stored connections. No arbitrary cohort filters are exposed. Formal inference resistance and privacy review remain Phase 5 work.

Native microphone capture uses Expo Audio, stops after 60 seconds and discards interrupted background recordings. Only the confirmed capture is uploaded. In mock mode the user types the transcript; live mode sends consented audio to Whisper. Temporary audio is removed after confirmation/cancellation where the platform permits it. Native permission and audio lifecycle behavior still require physical-device testing.

Image paths, not signed URLs, are persisted. Clients resolve five-minute signed URLs on archive loading. Long-open screens may require an archive refresh before a fresh image download. The web share exporter embeds private image bytes before rasterizing the local card. Web sessions persist only in the current tab; native sessions use chunked SecureStore values. Dream state is scoped by user ID and remounted on session changes.

## Phase 4 implementation

The user selected a single OpenAI account for all AI stages: whisper-1, gpt-4o-mini, and gpt-image-2 (one low-quality 1024x1536 PNG). No Fal credential is required. Provider keys are server-only. The capabilities action reports the authoritative server mode; the client never switches an unsuccessful live request to mock output.

Each capture requires affirmative processing consent, independently of all social consents. Successful live dreams retain an AI processing timestamp and analysis_source. The JSON schema is strict and revalidated with Zod before persistence. Output locale is explicitly prompted; semantic language quality still needs ongoing review. Image prompts instruct removal of identifying details; regular expressions additionally redact contacts. This is not a formal anonymization guarantee.

A per-user lease serializes mutations. Private jobs cache successful stages; a SHA-256 content digest protects receipt reuse. A transactional global daily budget row and per-user daily counter reserve a conservative 100,000 USD micros per new job. Defaults: 3 jobs/user/day, 60-second cooldown and 2 USD global daily reservations. UTC determines quota days. Reservations are never refunded on ambiguous failures. They are application estimates, not an invoice guarantee or provider billing limit.

Whisper and interpretation requests time out after 20 seconds, with at most two persisted attempts each and jittered retry only for transient failures. Image generation runs on a subsequent request, times out after 70 seconds, and permits one persisted attempt. A lost image response or upload result is never regenerated automatically. Persisted image paths allow a failed DB commit to resume without a paid image call. Each media transfer has a 20-second timeout; the client request timeout is 120 seconds. A five-minute lease bounds abandoned workers.

Audio is limited to 5 MiB and 0.3–65 seconds of parsed metadata before reservation and Whisper. Unknown duration is rejected. Web recordings are converted to 16 kHz mono PCM WAV; native M4A uses Expo Audio. Duration metadata is an operational guard, not a proof against adversarial media. Provider responses have bounded byte limits; only inline PNG is accepted, preventing provider-supplied URLs from triggering arbitrary server fetches.

Astronomy Engine 2.1.19 calculates seven geocentric tropical positions at interpretation time. The stored UTC timestamp and source identify current sky context. Prompts prohibit invented aspects, retrogrades, houses or natal positions. UI labels astrology as symbolic.

Success commits ready analysis, normalized tags, media paths, consent receipt and job completion in one transaction. Duplicate job payloads are removed atomically. Uploaded audio is removed from the job payload once its private Storage path is durable. Failed job payloads can be resumed for 24 hours and are pruned on later authenticated capability/create requests; there is no idle scheduled sweep. Account/dream deletion cascades through private jobs and user quota records. Versioned media leftovers are covered by recursive account/dream cleanup.

The Phase 3 backend integration fixture targets mock mode. Do not run it against a live-key server. Use the AI unit suite and database suite for deterministic Phase 4 checks; live verification uses isolated disposable accounts with synthetic/public test content. Physical device behavior and release hardening remain Phase 5 work.
