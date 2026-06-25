# Handoff: 다시봄 (Dasibom) — AI 문화유산 복원·해설 서비스

## Overview
**다시봄 (Dasibom)** is an AI cultural-heritage **restoration & commentary** service. A user
photographs a heritage site (or its information sign), the app/website identifies it, shows an
**AI-estimated before/after restoration** comparison, then provides **level- and language-tailored
commentary**, an **ask-the-AI Q&A**, summary cards, and a short **quiz**.

This bundle contains two surfaces in one design file:
- **Mobile app** (iOS/Android) — full flow from onboarding to detail.
- **Desktop web** (`dasibom.kr`) — a single marketing+product page with the same core features.

Both share one language toggle (**Korean / English**, fully wired) and one purple brand color.

---

## About the Design Files
The file in this bundle — `dasibom-design.dc.html` — is a **design reference created in HTML**.
It is a working prototype that demonstrates the intended **look, copy, and interaction behavior**.
It is **not production code to copy directly**.

The HTML is authored as a "Design Component" (a custom `<x-dc>` template + a `class Component`
logic block) and depends on the **Wanted Design System** bundle for styling/components. **Do not
try to ship this format.** Instead, **recreate these designs in the target codebase's environment**
using its established patterns and libraries:
- Mobile → React Native / SwiftUI / Flutter / Jetpack Compose, etc.
- Web → React / Vue / Svelte with the team's component library.

If no codebase exists yet, choose the most appropriate framework for the product (the flow is
mobile-first; a React Native app + a Next.js marketing/web app is a reasonable default) and
implement the designs there.

> The HTML loads the design system from `_ds/wanted-design-system-.../`. To preview the prototype
> as-is you'd need that bundle; for implementation you only need this README + the asset images.

---

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, copy (KR + EN), and interactions are
all specified. Recreate the UI faithfully using the codebase's libraries. The one caveat: the
heritage images are **stylized illustrations generated as placeholders** (see *Assets*) — swap in
real licensed photography of each site, keeping the same before/after pairing and crops.

---

## Design Tokens

### Brand / Color
The product is built on the **Wanted Design System** semantic token layer, with the **primary hue
overridden to purple**.

| Token | Value | Use |
|---|---|---|
| `--primary-normal` (primary) | **`#9A5ABF`** | primary actions, brand, active nav, slider handle, badges |
| `--primary-strong` (hover) | **`#681993`** | primary button hover |
| `--primary-heavy` (press) | **`#4E1370`** | primary button press |
| Label / Background / Line / Fill | Wanted DS semantic neutrals (cool-tinted greys, opacity-based) | text hierarchy, surfaces, borders |
| `--accent-foreground-green` | DS green | "available/correct" status |
| `--accent-foreground-orange` | DS orange | "AI-estimated" callouts, trophy |
| `--accent-foreground-red` | DS red | quiz wrong answer |
| `--accent-foreground-blue` | DS blue | change-card "structure" |

Neutrals/labels/lines/fills come from Wanted DS — map them to your own design system's nearest
equivalents (opacity-based label tokens: normal → neutral 88% → alternative 61% → assistive 28%).
On white cards over photos, use translucent neutral fills/lines.

### Typography
**Wanted Sans** (display/headings/UI) + **Pretendard** (Korean/Latin body). Korean-first, polite
informal `-요/-하세요` register. Role scale used here (px):
- Display 2/3 — 40/36 · 700 · tight negative tracking (hero, onboarding title)
- Heading 2 — 22 · 700 (screen titles)
- Headline 1/2 — 18/17 · 700/600 (card titles, section heads)
- Body 1/2 — 16/15 · 400 reading / 500 normal (commentary, descriptions)
- Label 1/2 — 14/13 · 500–600 (buttons, meta)
- Caption 1/2 — 12/11 (timestamps, source lines)

### Spacing & Radius
- 4px base scale (4,6,8,10,12,16,20,22,24,32,40,48).
- Mobile content margin **22px**.
- Radius: inputs/buttons **8–12px**, cards **15–18px**, sheets/prominent **18–22px**, chips/avatars
  fully round, FAB/handle pills 99px.
- Shadows: DS `--shadow-emphasize` (hairline + soft 2–8px) on cards; `--shadow-strong` on the web
  hero slider; bottom sheet uses `0 -10px 34px -10px rgba(20,20,40,.22)`.

### Motion
- Entrance: subtle **8px upward slide** over **0.3s** with standard easing `cubic-bezier(.4,0,.2,1)`.
  **Important:** do NOT gate element visibility on the entrance animation (opacity must default to 1).
- Bottom sheet height transition **0.28s** emphasized easing `cubic-bezier(.2,0,0,1)`.
- Spinner (analyzing) 1s linear infinite; status dots 1s ease-in-out pulse.
- Before/after slider & sheet drag follow the pointer 1:1 (no easing during drag).

---

## Screens / Views

### MOBILE APP (device frame ~448×946 content)

Persistent **bottom navigation** (5 items, height ~90px, large 25px icons + 11px labels):
**홈 Home · 지도 Map · [● 카메라 FAB] · 즐겨찾기 Saved · 마이 My**. Center item is a raised
circular **purple camera FAB**. Active tab = purple icon (filled variant) + purple label; inactive
= assistive grey. Bottom nav is shown on home/map/saved/my (hidden on onboarding, capture,
analyzing, identify, detail, notifications, unsupported).

1. **Onboarding** (`screen: onboarding`)
   - Full-bleed restored-gate photo (`sungnyemun_after.png`, `object-fit:cover`) with a top→bottom
     dark gradient scrim (`rgba(15,18,30,.15)→.35→rgba(13,16,26,.92)`). Content bottom-aligned, white text.
   - Pill badge "✦ AI 문화유산 복원·해설" (translucent white, blur).
   - Display title "사라진 풍경을, 다시 봄" / EN "See what time erased, once again."
   - Body subtitle (2 lines).
   - Language picker: "언어를 선택하세요" + two pills (**한국어 / EN**); active pill = white fill / dark text.
   - Primary CTA full-width 56px purple "시작하기 →".

2. **Home** (`screen: main, tab: home`) — scrolls, padding `58px 0 110px`
   - Top row: location "서울 · 중구" (location pin), KR/EN pills (small), **bell** icon button → Notifications.
   - **Hero banner carousel** (horizontal scroll-snap, each slide `flex:0 0 92%`, **height 480px** —
     intentionally ~half the screen). Slides over full-bleed images with bottom gradient + white text:
     - "야간개장 · 경복궁 별빛 야행 · 오늘 19:00–21:30 · 예약 오픈" (`gyeongbok_night.png`)
     - "오늘의 문화유산 · 숭례문, 다시 보다 · 복원 전·후를…" (`sungnyemun_after.png`)
   - **추천 문화유산 (Recommended)** list of cards (108×96 thumb + name + tag badge + chevron). Tag
     "복원 사례"/"인기" purple-filled or neutral. Tapping a supported one → Detail.
   - (Note: the old "내 주변 문화유산" nearby section was intentionally **removed from Home** and lives in Map.)

3. **Map** (`screen: main, tab: map`)
   - **Full-bleed map** (`map_bg.png`) filling the whole screen behind the nav.
   - **Pin markers** (teardrop, rotated 45°, white glyph inside): purple = available, grey = coming soon.
   - Top-left legend chips: "● 체험 가능 / ● 준비 중".
   - **Draggable bottom sheet** (Naver-Maps style) pinned above the nav (`bottom:90px`), rounded top
     `22px`, drag handle. Two states: **collapsed 150px** ↔ **expanded 402px** (~40% of screen).
     Drag up/down past 24px threshold, or tap the handle, to toggle (height transitions 0.28s).
     Header "내 주변 문화유산" + count; body = scrollable nearby list (54px thumb, name, distance,
     "체험 가능"/"준비 중" status, chevron). Supported → Detail; unsupported → Unsupported screen.

4. **Capture** (`screen: capture`) — full dark camera view
   - Live preview (placeholder = `sungnyemun_after.png` at .92 opacity) with radial vignette,
     white corner viewfinder brackets, title "문화유산 비추기" + hint, an "OCR 자동 인식" pill.
   - Bottom controls on `#0c0d12`: gallery button, large white shutter (80px), close (→ home).
   - Triggered from the camera FAB, which first opens a **bottom sheet** "무엇을 촬영할까요?" with 4
     options: 카메라 촬영 / 안내판 OCR / QR 인식 / 갤러리 선택.

5. **Analyzing** (`screen: analyzing`) — dark gradient, 96px purple ring **spinner** + sparkle,
   "AI가 분석하고 있어요", 3 status rows (이미지 인식 ✓ / 안내판 OCR ⟳ pulsing / 데이터 매칭). Auto-advances ~2.1s → Identify.

6. **Identify** (`screen: identify`)
   - "이 문화유산이 맞나요?" + sub. Candidate card: image, **96% 일치율** badge (purple), name
     "숭례문" + "국보 제1호 · 서울 · 조선 1398년 창건".
   - **OCR result** card: recognized sign text in a fill box.
   - Primary CTA "복원 시작하기" → Detail.

7. **Detail** (`screen: detail`) — the core, scrolls, padding `0 0 110px`. Contains, top to bottom:
   - **Hero** (230px) with name/era + back/bookmark.
   - **복원 전·후 비교 (Before/After slider)** — see Interactions. Left = "2008년 화재 직후"
     (`sungnyemun_before.png`), right = "2013년 복원 완료" (`sungnyemun_after.png`). Drag handle with
     ‹› icon; "AI 추정 복원" callout + source "문화재청 국가유산포털".
   - **무엇이 달라졌나요 (What changed)** — 3 cards (구조/단청/기와·지붕) icon tile + title + body.
   - **맞춤 해설 (Tailored commentary)** — mode chips (30초 요약 / 어린이 / 청소년 학습 / 심화 / 외국인);
     selected chip = purple. Body text swaps per mode. **TTS player**: purple play/pause circle,
     progress bar, speed toggle (1x→1.5x→2x).
   - **AI 질문 (Ask AI)** — chat: AI greeting bubble, suggested-question chips, text input + send.
     Tapping a suggestion appends a user bubble + AI answer with a "출처" source line.
   - **핵심 요약 카드 (Summary cards)** — 5 labeled cards (시대/인물/사건/변화/의미), each accent-tinted.
   - **퀴즈 (Quiz)** — 3 questions, 4 options each; on pick, correct=green, chosen-wrong=red, others
     dim, and an explanation reveals. When all 3 answered, score row + "다시 풀기".

8. **Notifications** (`screen: noti`) — back button + "알림 설정" + sub. 4 toggle rows
   (야간개장·행사 / 오늘의 문화유산 / 신규 복원 공개 / 주변 문화유산 추천), each icon tile + label + desc +
   **switch** (46×28 track, 22px knob, purple when on).

9. **Saved** (`screen: main, tab: saved`) — "즐겨찾기" + count; saved heritage cards or empty state.

10. **My** (`screen: main, tab: my`) — "마이페이지", profile row, stat row (방문/저장/퀴즈), settings
    list (언어 설정 / 알림 설정 / 저장 기록 / 방문한 문화유산 / 계정 관리).

11. **Unsupported** (`screen: unsupported`) — back button, centered empty-state: "준비 중인 문화유산이에요"
    + body about dataset expansion + "다른 문화유산 둘러보기".

### DESKTOP WEB (1440-wide page, browser chrome mock)
Single scrolling page on `dasibom.kr`:
- **Sticky header**: "✦ 다시봄" wordmark, nav (복원 비교 / 맞춤 해설 / AI 학습 / 문화유산), KR/EN segmented
  toggle, primary "사진 업로드" button.
- **Hero** (2-col): left = kicker pill + Display hero "사라진 풍경을, 다시 봄" + subtitle + **file-upload
  dropzone** ("사진을 끌어다 놓으세요 · JPG·PNG·HEIC 지원 · 클릭해서 선택"); right = **before/after slider**.
  - NOTE: there is **no "갤러리 선택" button on web** (web has no gallery) — upload is **drag-and-drop +
    click-to-choose-file** only.
- **무엇이 달라졌나요** — 3 change cards.
- **맞춤 해설** — mode chips + commentary card + TTS player.
- **핵심 요약 카드** — 5 cards.
- **AI 질문** + **퀴즈** (same logic as mobile, web layout).
- **다른 문화유산 둘러보기** — catalog grid.
- Footer with source attribution.

---

## Interactions & Behavior

- **Language toggle (KR/EN)** — global; flips ALL copy (titles, body, buttons, quiz, commentary,
  sources). Default `ko`. Active pill/segment highlighted.
- **Before/After slider** — pointer-driven. Base layer = "after" image; the "before" image is
  overlaid and clipped with `clip-path: inset(0 <100-pos>% 0 0)` so the **left side shows BEFORE
  (fire damage), right side shows AFTER (restored)**. Handle line + circular ‹› grip at `pos%`.
  Pointer down/move sets `pos = clamp(0,100, (clientX-left)/width*100)`. (Both mobile & web have
  independent slider state.)
- **Camera FAB** → opens capture-options bottom sheet → Camera/OCR/QR/Gallery → Capture → Analyzing
  (~2.1s timeout) → Identify → Detail.
- **Commentary modes** — chip selection swaps the commentary body text (5 variants per heritage).
- **TTS player** — play/pause toggles a simulated progress timer (~55ms tick, advances by speed×1.1;
  stops at 100%). Speed cycles 1x→1.5x→2x. (Replace with real TTS/audio in implementation.)
- **Ask-AI chat** — suggested-question chip appends `{user question}` + `{AI answer + source}`; free
  text input + send appends the typed question + a generic grounded answer. Auto-scrolls chat.
  (Wire to a real RAG/LLM endpoint grounded on heritage data; show a "출처/source" line per answer.)
- **Quiz** — first tap per question locks the answer; reveals correct(green)/wrong(red)/dim styling
  + explanation. Score = count correct; "다시 풀기" resets picks.
- **Map bottom sheet** — drag up→expanded (402px), down→collapsed (150px); tap handle toggles.
- **Notifications** — switches toggle independent booleans.
- **Saved/bookmark** — toggles a heritage's saved state.
- **Supported vs unsupported heritage** — supported → Detail; unsupported → Unsupported screen
  ("coming soon", per the "prepared-data only, expanding later" product reality).

---

## State Management
Single screen/flow state model (from the prototype's `Component` class):
- `lang`: `'ko' | 'en'` — global language.
- `screen`: `'onboarding' | 'main' | 'capture' | 'analyzing' | 'identify' | 'detail' | 'noti' | 'unsupported'`.
- `tab`: `'home' | 'map' | 'saved' | 'my'` (only when `screen === 'main'`).
- `captureMode`: `'camera' | 'ocr' | 'qr' | 'gallery'`.
- `sheetOpen`: capture-options bottom sheet visibility.
- `mapSheet`: `'collapsed' | 'expanded'`.
- `saved`: `{ [heritageId]: true }`.
- `noti`: `{ ads, today, newRestore, nearby }` booleans.
- Per-surface (`m` mobile / `w` web): `*Slider` (0–100), `*Mode` (commentary mode key),
  `*Play`/`*TTS`(0–100)/`*Speed`, `*Chat` (array), `*Pick` (quiz answers), `*Input`.

Data fetching to wire for production: heritage identification (image→id + match %), OCR text,
before/after restoration image pair, commentary variants per level, RAG Q&A endpoint, TTS audio,
nearby heritage by geolocation, map markers, notification preferences persistence.

---

## Assets
All heritage images in this bundle are **stylized illustrations generated as placeholders** — replace
with real licensed photography (same crops & before/after pairing).

| File | Used for |
|---|---|
| `img/sungnyemun_after.png` | Sungnyemun **restored** (after) — onboarding, capture, slider right, home |
| `img/sungnyemun_before.png` | Sungnyemun **fire-damaged** (before) — slider left |
| `img/gyeongbok_night.png` | Gyeongbokgung night-opening home banner |
| `img/geunjeongjeon.png` | Geunjeongjeon catalog/thumb |
| `img/stone_pagoda.png` | Mireuksa stone pagoda catalog/thumb |
| `img/cheomseongdae.png` | Cheomseongdae catalog/thumb |
| `img/map_bg.png` | Map tab background |

**Icons:** the prototype uses the **Wanted Design System** 273-glyph icon set (kebab names like
`camera-fill`, `bell`, `chevron-right`, `location-fill`, `sparkle-fill`, `home-fill`, `graduation`,
`trophy-fill`). Map these to your codebase's icon library by name/meaning. No emoji in product UI.

**Fonts:** Wanted Sans + Pretendard (both open-source). Substitute your product's brand/Korean font
pairing if different; keep the role scale & weights.

---

## Files
- `dasibom-design.dc.html` — the full design reference (mobile app + desktop web, KR/EN). Open the
  template section (`<x-dc>…`) for exact markup/styles and the `class Component` section for copy,
  data, and interaction logic.
- `img/` — heritage & map placeholder images listed above.
