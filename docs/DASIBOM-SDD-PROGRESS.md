# Dasibom SDD Progress

- Frontend repo: C:/Users/SSAFY/Desktop/dasibom_handoff_v2 (branch feat/dasibom-impl)
- Backend repo: c:/Users/SSAFY/Desktop/pjt/pjt_09/skeleton (branch feat/dasibom-proxy)

## Tasks
Task 1: complete (backend services.py, commit cb13666, manage.py check clean)
  - Codex flagged: key-access outside try (KeyError vs None). ADJUDICATED REJECTED:
    matches brief + reference get_chat_response pattern; unreachable because views
    validate via serializer (400) before calling services. Intentional.
Task 2: complete (backend views.py, commit 3452692, check clean). Codex: APPROVED.
Task 3: complete (.env present, validation 400 path verified via Django test client). PART A done.
Task 4: complete (Vite scaffold, commit 8a8da61, build OK). Codex: APPROVED (verbatim re-review).
Task 5: complete (copy.js KR/EN 46 keys parity, commit 5fb5fbf, 3/3 tests). Codex: APPROVED.
Task 6: complete (heritage.js + commentary.js + 7 assets, commit 1a726ec, 3/3 tests).
  Data shapes verified programmatically (all fields/lng/nested/getCommentary OK).
  Codex CHANGES_NEEDED but substance = MINOR test-coverage gaps (test asserts lat not lng;
  nested commentary fields not asserted). Data itself verified correct. Plan-mandated test.
  MINOR -> deferred to final review per SDD skill. Not blocking.
Task 7: complete (Zustand store, commit 588afe6, 4/4 tests, 14 actions verified). Codex: APPROVED.
Task 8: complete (API layer client/chat/tts/identify + USE_MOCK, commit fb2a8e9, 1/1 test). PART B done.
  Codex CHANGES_NEEDED on endpoint paths -> ADJUDICATED REJECTED: frontend calls Django proxy at
  /api/v1/chat/completions/ & /api/v1/generate-speech/ which MATCH actual proxies/urls.py routes
  (verified). Spec's "/api/v1/openai/" = model-server(8081) namespace, not Django(8080). Correct as-is.
  identify real branch intentionally deferred (plan: AI identify mocked now). postJSON/mock sigs confirmed by Codex.
NOTE for final review + Task 16: keep frontend->Django paths as /api/v1/... (no 'openai' segment).
Task 9: complete (Icon/StatusBar/MobileShell/LangToggle, commit d2f3c53, 1/1 test, 18/18 icons).
  Codex APPROVED (Icon, StatusBar, MobileShell, LangToggle store wiring). '한국어' label matches brief/onboarding design.
Task 10: complete (BeforeAfterSlider, commits 5d0bd4e + fix 6a5828d, 2/2 tests).
  Codex APPROVED drag math + clip-path; flagged missing pointer capture (real UX bug) -> FIXED
  (setPointerCapture on down, removed onPointerLeave cancel). Re-verified 2/2 tests pass.
Task 11: complete (BottomSheet/Switch/HeritageCard, commit e09eeec + fix cc35199, 2/2 tests).
  Codex caught real bug: BottomSheet drag double-toggle (onPointerUp toggle + onClick toggle) -> FIXED
  with didDrag ref suppressing click after drag. Existing click test still passes. Switch/HeritageCard clean.
Task 12: complete (CommentaryPlayer, commit 0ad88ec, 2/2 tests). Codex: APPROVED. (modes=[] edge unreachable; always 5 modes.)
Task 13: complete (AskAIChat, commit 005b8c6, 2/2 tests). Codex: APPROVED.
Task 14: complete (Quiz, commit 89bb75d, 3/3 tests). Codex: APPROVED.
Task 15: complete (BottomNav/MainLayout, commit c607280, 1/1 + full suite 24/24). Codex: APPROVED. PART C done.
Task 16: STATIC ANALYSIS DONE + checklist documented (docs/TASK16-integration-verification.md).
  RUNTIME VERIFICATION DEFERRED TO USER: requires FastAPI model server on 8081 + API keys (external infra).
  Findings: frontend->Django paths match urls.py (verified); services.py follows skeleton contract;
  guardrail accepts {result}|{is_appropriate}; reference 007/008 use DIFFERENT routes (no /openai prefix,
  /audio/speech vs /generate-speech) -> user must run the matching answer server (server/openai) or adjust paths.
  Frontend USE_MOCK=true so screens work without this. PART D handled (runtime gate = user action).
Task 17: complete (App routing + Onboarding + 11 stubs, commit 4d4840b, 25/25 + build OK, MainLayout CaptureSheet re-enabled). Codex: APPROVED.
Task 18: complete (Home, commit 703596b, full suite 26/26). Codex: APPROVED.
Task 19: complete (Capture/CaptureSheet/Analyzing, commit a3c9f10, full suite 27/27, timer cleanup verified). Codex: APPROVED.
Task 20: complete (Identify, commit 99c4905 + fix 55f63c3, 2/2 + full 29/29).
  Codex CHANGES_NEEDED: setState-after-unmount + unguarded getHeritage (real, MINOR) -> FIXED
  (alive flag + if(!h) return null). identifyImage(null)/nav-target findings = match brief, kept.
Task 21: complete (Detail core screen, commit 35c2d57 + fix 680d4f4, 2/2 + full 31/31).
  Codex caught real TTS stale-closure bug (interval captured stale s.mTTS, progress stuck ~1.1, never 100)
  -> FIXED via useAppStore.getState() per tick, deps [s.mPlay]. Tests missed it (no timer-advance assertion). askAI ordering + 'm' surfaces confirmed.
Task 22: complete (Map, commit 60518a1 + fix 840a709, full 32/32).
  Codex APPROVED export/toggle/nav; flagged pinPos<heritages latent risk (MINOR, not current bug; 4==4)
  -> guarded (skip pins without pos). Dataset-growth safe.
Task 23: complete (Notifications/Unsupported, commit 3e44d81, full 33/33). Codex: APPROVED.
Task 24: complete (Saved/My, commit 4dc2ea4, full 34/34). Codex: APPROVED.
Task 25: implemented + committed (WebLanding, commit c1a00f0, 2/2 + full 36/36, build OK).
  Codex (inline review; sandbox blocks file reads so contents passed inline): CHANGES_NEEDED.
  - PASS: w-surface only, no gallery button, all required sections, brand color, named export. onPlayToggle NOT stale-closure (cleared).
  - [Important] WebLanding.jsx:44 dropzone has no onDragOver/onDrop -> drag-and-drop affordance not wired.
  - [Important] WebLanding.jsx:34 header "사진 업로드" button inert (no onClick).
  - [Minor] WebLanding.jsx:18 unused `const h = getHeritage('sungnyemun')`.
  ADJUDICATION: file is a VERBATIM transcription of plan Task 25 Step 3 code; all 3 findings are
  properties of the plan's own provided code (plan-conflict -> human decision per SDD skill).
  App is USE_MOCK; uploaded files are never processed anywhere (no onChange; identify mocked) so
  upload UI is decorative by design.
  USER DECISION: "wire to full flow" (upload/drop/button -> navigate into Analyzing flow). -> Task 25b.
Task 25b: complete (commit 738d493, full 37/37, build OK). Wired WebLanding upload to the existing flow:
  useNavigate+useRef; header button onClick opens file dialog; dropzone onDragOver/onDrop -> nav('/analyzing');
  input ref+onChange -> nav('/analyzing'); removed unused `h` + getHeritage import. Tests wrapped in MemoryRouter
  + new nav test (3/3). Only WebLanding.jsx/.test.jsx changed. Controller verified 37/37 first-hand.
  Codex (inline review): APPROVED — all 3 prior findings RESOLVED, no new issues, all 7 constraints PASS.

FINAL whole-branch review (opus subagent, 803a92d..738d493, 81 files / 37 tests): "Ready to merge: With fixes". No Critical.
  Verified solid: TTS stale-closure fix, async-unmount guard, pointer capture, sheet double-toggle, m/w surface independence, brand tokens verbatim, dbfade opacity-independent, no stray emojis.
  Important: (1) package.json missing "test" script; (2) handleSend (Detail+WebLanding) no try/catch/loading -> live-path fragile (mock-safe); (3) heritage.js redundant supported(bool) vs status -> latent dual source of truth.
  Minor: (4) dbfade only on Onboarding/CaptureSheet (design Q); (5) dead Vite-template App.css + unused sv\gs; (6) requestTTS unused stub; (7) React 19/RR7/Zustand5 vs brief's "React18/RRv6"; (8) captureMode stored but never read.
  PRE-MERGE FIX SET (Task 27): #1 test script, #2 chat error+loading, #5 delete dead App.css/SVGs.
  DEFERRED w/ rationale: #3 (data consistent now; safe follow-up refactor), #4/#6/#7/#8 (design/forward-stub/version-drift/demo-acceptable; non-blocking).
Task 27: complete (commit dbd4ad5, full 37/37, `npm test` works, build OK). Applied pre-merge fixes #1/#2/#5:
  added "test"/"test:watch" scripts; wrapped both handleSend (Detail 'm', WebLanding 'w') in try/catch ->
  bilingual chatError copy key (ko+en parity preserved); deleted dead App.css + react.svg + vite.svg
  (grep-confirmed unimported). No happy-path DOM change -> all existing tests unaffected. Controller verified first-hand.
  Codex (inline review): APPROVED — all 3 findings resolved, no new issues.

ALL TASKS COMPLETE (1-27). Branch feat/dasibom-impl: HEAD dbd4ad5, 37/37 tests, build clean.
Remaining user actions (external infra, cannot be automated): Task 26 Steps 3-4 = manual browser smoke
(localhost:5173 full flow + /web) and optional live FastAPI(8081)+Django(8080) integration with USE_MOCK=false.
Task 26: complete (final verification, commit a67bf26 --allow-empty, no source changes needed).
  First-hand verified by controller: vitest 36/36 pass (21 files), production build OK (built in 455ms).
  Steps 3-4 (manual browser smoke + live FastAPI/Django backend) DEFERRED TO USER (external infra).
  No code diff -> per-task Codex review collapses into final whole-branch review.
