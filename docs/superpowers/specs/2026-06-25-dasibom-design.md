# 다시봄 (Dasibom) — 풀스택 구현 스펙

**작성일**: 2026-06-25  
**스택**: Vite + React (SPA) / Django 프록시 / FastAPI 모델 서버  
**대상**: SSAFY 교육 프로젝트 — 심사위원이 브라우저에서 바로 사용 가능한 웹 앱

---

## 1. 프로젝트 개요

**다시봄(Dasibom)**은 AI 문화유산 복원·해설 서비스다. 사용자가 문화유산 사진을 업로드하면 AI가 식별 → 복원 전·후 비교 → 수준별/언어별 해설 → AI Q&A → 퀴즈를 제공한다.

### 목표
- 심사위원이 앱 설치 없이 브라우저에서 즉시 체험 가능
- Django 프록시 서버의 7개 API 엔드포인트를 완성하고 React 프론트엔드와 연결
- 디자인 프로토타입(`dasibom-design.dc.html`)의 인터랙션을 충실히 재현

---

## 2. 전체 아키텍처

```
Browser (React SPA)          localhost:5173
  │  /api/* → proxy
  ▼
Django 프록시                localhost:8080
  skeleton/proxy/
  views.py + services.py 구현 대상
  │  POST MODEL_SERVER_URL/...
  ▼
FastAPI 모델 서버             localhost:8081
  실제 OpenAI API 호출 (정답 구현 제공됨)
```

**CORS 처리**: Vite `server.proxy` 설정으로 `/api` → `localhost:8080` 포워딩. 브라우저 레벨 CORS 없음. Django에는 `django-cors-headers`로 `localhost:5173` 허용.

---

## 3. 프론트엔드

### 3-1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| 번들러 | Vite | 빠른 세팅, proxy 설정 단순 |
| UI | React 18 | 팀 친숙도, 생태계 |
| 라우팅 | React Router v6 | SPA 화면 전환 |
| 상태관리 | Zustand | 단순한 전역 스토어, Redux 없이 |
| 스타일 | Tailwind CSS | 디자인 토큰 직접 매핑, 인라인 스타일 탈피 |
| 언어 | JavaScript (JSX) | 세팅 오버헤드 최소화 |

### 3-2. 디자인 토큰 (`tailwind.config.js`)

```js
theme: {
  extend: {
    colors: {
      primary: '#9A5ABF',
      'primary-strong': '#681993',
      'primary-heavy': '#4E1370',
    },
    fontFamily: {
      sans: ['Wanted Sans', 'Pretendard', 'sans-serif'],
    },
    borderRadius: {
      card: '15px',
      'card-lg': '18px',
      sheet: '22px',
      pill: '999px',
      btn: '12px',
    },
    spacing: {
      // 4px base scale
      'content': '22px', // 모바일 콘텐츠 좌우 여백
    },
  },
}
```

중성 색상(label/fill/line)은 Tailwind `gray` 스케일 + opacity로 매핑:
- label-normal → `gray-900 opacity-88`
- label-neutral → `gray-900 opacity-61`
- label-assistive → `gray-900 opacity-28`

### 3-3. 라우팅

모든 모바일 화면은 `MobileShell`(448×946 프레임) 안에서 렌더링된다.

```
/                 Onboarding
/home             Main > Home 탭
/map              Main > Map 탭
/saved            Main > Saved 탭
/my               Main > My 탭
/capture          Capture (카메라 뷰)
/analyzing        Analyzing (2.1s 후 자동 이동)
/identify         Identify (식별 결과)
/detail/:id       Detail (슬라이더/해설/퀴즈)
/notifications    Notifications (알림 설정)
/unsupported      Unsupported (준비 중)
/web              Desktop 랜딩 페이지 (풀스크린, 1440px)
```

Bottom Nav는 `/home`, `/map`, `/saved`, `/my`에서만 표시.

### 3-4. 전역 상태 (`src/store/useAppStore.js`)

README의 state model을 Zustand로 이식:

```js
{
  // 전역
  lang: 'ko',           // 'ko' | 'en'

  // 화면/탭
  captureMode: 'camera', // 'camera'|'ocr'|'qr'|'gallery'
  sheetOpen: false,      // capture options bottom sheet
  mapSheet: 'collapsed', // 'collapsed'|'expanded'

  // 사용자 데이터
  saved: {},             // { [heritageId]: true }
  noti: { ads: true, today: true, newRestore: true, nearby: true },

  // 모바일 Detail 상태
  mSliderPos: 50,        // 0–100
  mMode: '30s',          // commentary mode key
  mPlay: false,
  mTTS: 0,               // 0–100
  mSpeed: 1,             // 1 | 1.5 | 2
  mChat: [],
  mPick: {},             // { [qIdx]: answerIdx }
  mInput: '',

  // 웹 Detail 상태 (동일 구조, 'w' prefix)
  wSliderPos: 50,
  // ...
}
```

### 3-5. 공통 컴포넌트

`src/components/` 하위:

| 파일 | 역할 | 핵심 props |
|---|---|---|
| `MobileShell.jsx` | 448×946 디바이스 프레임 + status bar | `children` |
| `BottomNav.jsx` | 5탭 + 카메라 FAB (카메라 → sheetOpen) | `activeTab` |
| `BeforeAfterSlider.jsx` | clip-path 포인터 드래그 | `beforeSrc`, `afterSrc`, `pos`, `onPosChange` |
| `BottomSheet.jsx` | 드래그 collapsed↔expanded (0.28s) | `open`, `height`, `onToggle`, `children` |
| `CommentaryPlayer.jsx` | 모드 칩 5개 + TTS play/pause/progress/speed | `modes`, `texts`, `onTTSRequest` |
| `AskAIChat.jsx` | 제안 질문 칩 + 채팅 버블 + 입력 | `chat[]`, `onSend` |
| `Quiz.jsx` | 3문항, 정답/오답 스타일링, 점수, 다시풀기 | `questions[]`, `picks{}`, `onPick` |
| `LangToggle.jsx` | KR/EN 전환 pill | — (store 직접 접근) |
| `HeritageCard.jsx` | 썸네일 + 이름 + 태그 + chevron | `heritage`, `onClick` |
| `Switch.jsx` | 46×28 토글 스위치 (알림 설정용) | `on`, `onChange` |

### 3-6. 인터랙션 재현 명세

**BeforeAfterSlider**
- base layer: "after" 이미지 (full width)
- overlay layer: "before" 이미지, `clip-path: inset(0 ${100-pos}% 0 0)` 적용
- 왼쪽 = before(화재), 오른쪽 = after(복원)
- `pointerdown` → `pointermove`에서 `pos = clamp(0, 100, (clientX - left) / width * 100)`
- 드래그 중 easing 없음, 1:1 추적

**BottomSheet (Map)**
- 기본: collapsed 150px
- 핸들 탭 또는 24px 이상 드래그 → expanded 402px
- 높이 전환: `transition: height 0.28s cubic-bezier(.2,0,0,1)`
- 위치: `bottom: 90px` (Bottom Nav 위에 고정)

**Analyzing 화면**
- 96px 보라색 링 스피너 (1s linear infinite)
- 상태 도트 pulse (1s ease-in-out)
- 2.1s 후 `/identify`로 자동 이동 (`setTimeout`)

**TTS Player**
- `USE_MOCK=true`: 55ms 인터벌 타이머로 progress 증가 (speed × 1.1씩)
- `USE_MOCK=false`: Django `/api/v1/openai/generate-speech` 호출 → base64 audio_data → Web Audio API 재생
- speed: 1x → 1.5x → 2x 순환

**Quiz**
- 문항당 첫 탭에서 답 고정 (이후 탭 무시)
- 정답: green, 선택한 오답: red, 나머지: dim
- 설명 텍스트 reveal
- 3문항 모두 답 시 점수 행 + "다시 풀기" 표시

**언어 토글**
- Zustand `lang` 변경 → 모든 컴포넌트 `t = copy[lang]` 객체로 텍스트 참조
- KR/EN 카피는 `src/data/copy.js`에 중앙 관리

### 3-7. 화면별 구현 메모

**Detail (`/detail/:id`)**
- 스크롤 컨테이너, 상단 Hero(230px) 뒤 섹션 순서:
  1. BeforeAfterSlider
  2. 무엇이 달라졌나요 카드 3개
  3. CommentaryPlayer (TTS 연동)
  4. AskAIChat (AI Q&A 연동)
  5. 핵심 요약 카드 5개
  6. Quiz

**Capture (`/capture`)**
- 카메라 FAB 탭 → BottomSheet "무엇을 촬영할까요?" (4 옵션)
- 갤러리 선택: `<input type="file" accept="image/*">` 트리거
- "촬영" 버튼 → `/analyzing`으로 이동

**Map (`/map`)**
- `map_bg.png` 풀블리드 배경
- 핀 마커: CSS teardrop (보라=가능, 회색=준비중)
- BottomSheet "내 주변 문화유산" 목록

---

## 4. 백엔드 (Django 프록시)

### 4-1. 구현 범위

`skeleton/proxy/` 내 `views.py`와 `services.py`만 구현. 나머지 파일은 건드리지 않음.

### 4-2. `services.py` 구현 패턴

`get_chat_response` 예시를 동일한 패턴으로 6개 확장:

| 함수 | 엔드포인트 | 요청 키 | 응답 키 |
|---|---|---|---|
| `get_chat_guardrail_response` | `/chat/guardrail` | `prompt` | `is_appropriate` |
| `get_chat_score_response` | `/chat/score` | `messages`, `answer` | `score`, `reason` |
| `get_image_generation_response` | `/images/generations` | `prompt` | `url` |
| `get_image_score_response_for_url` | `/images/score/url` | `question`, `image_url` | `score`, `reason` |
| `get_decide_route_response` | `/decide-route` | `prompt` | `route` |
| `get_tts_response` | `/generate-speech` | `text` | `audio_data` |

모두 에러 시 `None` 반환.

### 4-3. `views.py` 구현 패턴

`chat_response` 예시와 동일 패턴. 단, `chat_guardrail_response`는 `is_appropriate=False`일 때 **HTTP 403** 반환:

```python
if not result.get('is_appropriate'):
    return Response({'detail': 'Inappropriate content'}, status=status.HTTP_403_FORBIDDEN)
return Response(ChatGuardrailResponseSerializer(result).data, status=201)
```

### 4-4. 추가 설정

- `pip install django-cors-headers`
- `settings.py`:
  ```python
  INSTALLED_APPS += ['corsheaders']
  MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...기존...]
  CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
  ```
- `.env`: `MODEL_SERVER_URL=http://localhost:8081/api/v1/openai`

---

## 5. API 레이어 (`src/api/`)

각 파일 상단 `USE_MOCK` 플래그로 mock ↔ 실서버 전환:

```js
// src/api/chat.js
const USE_MOCK = true

export async function sendChat(messages) {
  if (USE_MOCK) return { content: '숭례문은 조선 태조 7년(1398년)에 건립된...' }
  const res = await fetch('/api/v1/openai/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  return res.json()
}
```

파일 목록: `chat.js`, `guardrail.js`, `score.js`, `imageGen.js`, `imageScore.js`, `tts.js`, `route.js`

---

## 6. 정적 에셋

`public/img/`에 복사:
- `sungnyemun_after.png`, `sungnyemun_before.png`
- `gyeongbok_night.png`, `geunjeongjeon.png`
- `stone_pagoda.png`, `cheomseongdae.png`, `map_bg.png`

폰트: Google Fonts 또는 CDN으로 Wanted Sans + Pretendard 로드 (`index.html` `<link>`).

---

## 7. 구현 순서 (Phase별 마일스톤)

### Phase 1 — 기반 세팅 (1일)
- [ ] Vite + React + Tailwind + React Router + Zustand 프로젝트 생성
- [ ] Tailwind 디자인 토큰 등록
- [ ] Vite proxy 설정 (`/api` → `localhost:8080`)
- [ ] Django CORS 설정 + `.env`
- [ ] `MobileShell`, `BottomNav`, `LangToggle` 구현
- [ ] `src/data/copy.js` KR/EN 카피 정리

### Phase 2 — 백엔드 완성 (0.5일)
- [ ] `services.py` 6개 함수 구현
- [ ] `views.py` 6개 뷰 구현 (guardrail 403 포함)
- [ ] 각 엔드포인트 curl 검증

### Phase 3 — 핵심 화면 구현 (2~3일)
- [ ] Onboarding, Home, Map (BottomSheet 드래그)
- [ ] Capture, Analyzing (타이머), Identify
- [ ] Detail: BeforeAfterSlider, CommentaryPlayer, AskAIChat, Quiz
- [ ] Notifications, Saved, My, Unsupported

### Phase 4 — 연동 + 마무리 (1일)
- [ ] `USE_MOCK = false` 전환, 실 API 검증
- [ ] `/web` 데스크탑 랜딩 페이지
- [ ] KR/EN 전체 토글 검증
- [ ] 발표 시나리오 동선 최종 점검

---

## 8. 비고

- 문화유산 이미지는 현재 placeholder — 실제 라이선스 사진으로 교체 예정, 구조 변경 없음
- AI 식별 흐름(이미지 → id + 일치율)은 현재 mock; 추후 `/images/score/url` API 연결
- 지도 핀 데이터는 `src/data/heritage.js` 정적 JSON으로 관리 (추후 geolocation API 연결)
- TTS는 mock 타이머 → 실서버 전환 시 `<audio>` 또는 Web Audio API로 base64 재생
