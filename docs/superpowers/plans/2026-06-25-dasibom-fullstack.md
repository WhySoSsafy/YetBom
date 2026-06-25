# 다시봄 (Dasibom) 풀스택 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 문화유산 촬영 → AI 식별 → 복원 전·후 비교 → 수준별 해설 → AI Q&A → 퀴즈를 제공하는 React SPA를 만들고, Django 프록시 서버 7개 API를 완성해 FastAPI 모델 서버와 연결한다.

**Architecture:** Vite + React SPA(`localhost:5173`)가 `/api/*` 요청을 Vite proxy로 Django(`localhost:8080`)에 포워딩하고, Django는 다시 FastAPI 모델 서버(`localhost:8081`)로 전달한다. 프론트엔드는 `USE_MOCK` 플래그로 백엔드 없이도 독립 개발 가능하다.

**Tech Stack:** Vite, React 18, React Router v6, Zustand, Tailwind CSS, Vitest + React Testing Library (프론트) / Django REST Framework, requests (백엔드)

## Global Constraints

- 브랜드 색상: `--primary-normal` = `#9A5ABF`, `--primary-strong` = `#681993`, `--primary-heavy` = `#4E1370` (verbatim)
- 폰트: Wanted Sans + Pretendard, Korean-first, 폴라이트 인포멀 `-요/-하세요` 레지스터
- 모바일 콘텐츠 좌우 여백: `22px`. 4px base spacing scale (4,6,8,10,12,16,20,22,24,32,40,48)
- Radius: 입력/버튼 8–12px, 카드 15–18px, 시트/강조 18–22px, 칩/아바타 fully round, FAB/handle 99px
- 모바일 프레임: 448×946 content
- Entrance 애니메이션: 8px 위로 슬라이드 0.3s `cubic-bezier(.4,0,.2,1)`. **opacity는 기본 1** (애니메이션에 가시성 의존 금지)
- 기본 언어 `ko`. 모든 카피는 KR/EN 양쪽 제공, README/dc.html 문구 그대로 사용
- 제품 UI에 이모지 사용 금지 (아이콘 라이브러리 사용)
- 슬라이더/시트 드래그는 포인터 1:1 추적, 드래그 중 easing 없음
- Django 변경 범위: `skeleton/proxy/proxies/views.py`, `services.py`만. 다른 파일 미변경
- 모든 services 함수는 에러 시 `None` 반환. guardrail은 부적절 시 HTTP 403

---

## 파일 구조

### 프론트엔드 (`C:\Users\SSAFY\Desktop\dasibom_handoff_v2\web\`)

```
web/
  index.html                  # 폰트 CDN, root div
  package.json
  vite.config.js              # /api proxy → localhost:8080
  tailwind.config.js          # 디자인 토큰
  postcss.config.js
  src/
    main.jsx                  # React Router 마운트
    index.css                 # Tailwind directives + 글로벌
    App.jsx                   # 라우트 정의
    store/
      useAppStore.js          # Zustand 전역 상태
    data/
      copy.js                 # KR/EN 카피 전체
      heritage.js             # 문화유산 정적 데이터 + 지도 핀
      commentary.js           # 해설 모드별 텍스트, 요약카드, 퀴즈
    api/
      client.js               # fetch 래퍼 + USE_MOCK 플래그
      chat.js                 # AI Q&A
      tts.js                  # TTS
      identify.js             # 이미지 식별 (mock)
    components/
      MobileShell.jsx
      StatusBar.jsx
      BottomNav.jsx
      LangToggle.jsx
      Switch.jsx
      HeritageCard.jsx
      BottomSheet.jsx
      BeforeAfterSlider.jsx
      CommentaryPlayer.jsx
      AskAIChat.jsx
      Quiz.jsx
      Icon.jsx                # 아이콘 매핑 래퍼
    screens/
      Onboarding.jsx
      Home.jsx
      Map.jsx
      Saved.jsx
      My.jsx
      Capture.jsx
      Analyzing.jsx
      Identify.jsx
      Detail.jsx
      Notifications.jsx
      Unsupported.jsx
      WebLanding.jsx          # /web 데스크탑 페이지
    layouts/
      MainLayout.jsx          # 탭 화면 공통 (BottomNav 포함)
  public/
    img/                      # 7개 placeholder 이미지 복사
```

### 백엔드 (`c:\Users\SSAFY\Desktop\pjt\pjt_09\skeleton\proxy\`)

```
proxies/
  views.py     # 6개 뷰 구현
  services.py  # 6개 서비스 함수 구현
```

---

## 주의: 모델 서버 응답 스키마 검증

참고 구현(`007_gms_api/main.py`)에서 실제 FastAPI 응답 키가 스켈레톤 주석과 다를 수 있다:
- guardrail: FastAPI는 `{result, reason}` 반환 (스켈레톤 직렬화는 `is_appropriate` 기대)
- score: FastAPI 요청은 `{prompt, answer}` (스켈레톤 직렬화는 `messages, answer` 기대)

**구현 시 모델 서버를 띄워 실제 응답 키를 확인하고, services.py에서 키 매핑을 맞춘다.** Task 16에 이 검증 단계가 포함되어 있다.

---

# PART A — 백엔드 (Django 프록시)

## Task 1: services.py — 6개 함수 구현

**Files:**
- Modify: `c:\Users\SSAFY\Desktop\pjt\pjt_09\skeleton\proxy\proxies\services.py`

**Interfaces:**
- Consumes: `MODEL_SERVER_URL` (settings), `requests`
- Produces: `get_chat_guardrail_response`, `get_chat_score_response`, `get_image_generation_response`, `get_image_score_response_for_url`, `get_decide_route_response`, `get_tts_response` — 각각 dict 또는 None 반환

- [ ] **Step 1: guardrail 서비스 구현**

`services.py`의 `get_chat_guardrail_response`를 교체:

```python
def get_chat_guardrail_response(guardrail_request):
    """prompt 를 모델 서버 /chat/guardrail 로 보내고 is_appropriate 를 반환합니다."""
    payload_data = {"prompt": guardrail_request["prompt"]}
    try:
        response = requests.post(
            f"{MODEL_SERVER_URL}/chat/guardrail", json=payload_data
        )
        response.raise_for_status()
        data = response.json()
        # 모델 서버가 result 또는 is_appropriate 키로 응답할 수 있어 둘 다 수용
        is_appropriate = data.get("is_appropriate", data.get("result"))
        return {"is_appropriate": is_appropriate}
    except Exception as e:
        print(f"[서비스 에러 발생] {e}")
        return None
```

- [ ] **Step 2: score 서비스 구현**

```python
def get_chat_score_response(score_request):
    """messages, answer 를 모델 서버 /chat/score 로 보내고 score, reason 을 반환합니다."""
    payload_data = {
        "messages": score_request["messages"],
        "answer": score_request["answer"],
    }
    try:
        response = requests.post(
            f"{MODEL_SERVER_URL}/chat/score", json=payload_data
        )
        response.raise_for_status()
        data = response.json()
        return {"score": data["score"], "reason": data["reason"]}
    except Exception as e:
        print(f"[서비스 에러 발생] {e}")
        return None
```

- [ ] **Step 3: image generation 서비스 구현**

```python
def get_image_generation_response(gen_request):
    """prompt 를 모델 서버 /images/generations 로 보내고 url 을 반환합니다."""
    payload_data = {"prompt": gen_request["prompt"]}
    try:
        response = requests.post(
            f"{MODEL_SERVER_URL}/images/generations", json=payload_data
        )
        response.raise_for_status()
        return {"url": response.json()["url"]}
    except Exception as e:
        print(f"[서비스 에러 발생] {e}")
        return None
```

- [ ] **Step 4: image score 서비스 구현**

```python
def get_image_score_response_for_url(score_request):
    """question, image_url 을 모델 서버 /images/score/url 로 보내고 score, reason 을 반환합니다."""
    payload_data = {
        "question": score_request["question"],
        "image_url": score_request["image_url"],
    }
    try:
        response = requests.post(
            f"{MODEL_SERVER_URL}/images/score/url", json=payload_data
        )
        response.raise_for_status()
        data = response.json()
        return {"score": data["score"], "reason": data["reason"]}
    except Exception as e:
        print(f"[서비스 에러 발생] {e}")
        return None
```

- [ ] **Step 5: decide-route 서비스 구현**

```python
def get_decide_route_response(route_request):
    """prompt 를 모델 서버 /decide-route 로 보내고 route 를 반환합니다."""
    payload_data = {"prompt": route_request["prompt"]}
    try:
        response = requests.post(
            f"{MODEL_SERVER_URL}/decide-route", json=payload_data
        )
        response.raise_for_status()
        return {"route": response.json()["route"]}
    except Exception as e:
        print(f"[서비스 에러 발생] {e}")
        return None
```

- [ ] **Step 6: TTS 서비스 구현**

```python
def get_tts_response(tts_request):
    """text 를 모델 서버 /generate-speech 로 보내고 audio_data 를 반환합니다."""
    payload_data = {"text": tts_request["text"]}
    try:
        response = requests.post(
            f"{MODEL_SERVER_URL}/generate-speech", json=payload_data
        )
        response.raise_for_status()
        return {"audio_data": response.json()["audio_data"]}
    except Exception as e:
        print(f"[서비스 에러 발생] {e}")
        return None
```

- [ ] **Step 7: Django check 실행**

Run: `cd c:/Users/SSAFY/Desktop/pjt/pjt_09/skeleton/proxy && python manage.py check`
Expected: `System check identified no issues`

- [ ] **Step 8: Commit**

```bash
cd c:/Users/SSAFY/Desktop/pjt/pjt_09/skeleton/proxy
git add proxies/services.py
git commit -m "feat(proxy): implement 6 model-server proxy services"
```

---

## Task 2: views.py — 6개 뷰 구현

**Files:**
- Modify: `c:\Users\SSAFY\Desktop\pjt\pjt_09\skeleton\proxy\proxies\views.py`

**Interfaces:**
- Consumes: Task 1의 services 함수들, serializers (이미 정의됨)
- Produces: 6개 `@api_view` 핸들러

- [ ] **Step 1: import 추가**

`views.py` 상단 import 블록을 교체:

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from proxies.serializers import (
    ChatRequestSerializer, ChatResponseSerializer,
    ChatGuardrailRequestSerializer, ChatGuardrailResponseSerializer,
    ChatScoreRequestSerializer, ChatScoreResponseSerializer,
    ImageGenerationRequestSerializer, ImageGenerationResponseSerializer,
    ImageScoreRequestForImageURLSerializer, ImageScoreResponseForImageURLSerializer,
    DecideRouteRequestSerializer, DecideRouteResponseSerializer,
    GenerateSpeechRequestSerializer, GenerateSpeechResponseSerializer,
)
from proxies.services import (
    get_chat_response,
    get_chat_guardrail_response, get_chat_score_response,
    get_image_generation_response, get_image_score_response_for_url,
    get_decide_route_response, get_tts_response,
)
```

(기존 `chat_response` 뷰는 그대로 유지)

- [ ] **Step 2: guardrail 뷰 구현 (403 분기)**

`chat_guardrail_response`의 `pass`를 교체:

```python
@api_view(["POST"])
def chat_guardrail_response(request):
    serializer = ChatGuardrailRequestSerializer(data=request.data)
    if serializer.is_valid():
        result = get_chat_guardrail_response(serializer.validated_data)
        if result is None:
            return Response({"detail": "Guardrail check failed"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        if not result.get("is_appropriate"):
            return Response(ChatGuardrailResponseSerializer(result).data,
                            status=status.HTTP_403_FORBIDDEN)
        return Response(ChatGuardrailResponseSerializer(result).data,
                        status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

- [ ] **Step 3: score 뷰 구현**

```python
@api_view(["POST"])
def chat_score_response(request):
    serializer = ChatScoreRequestSerializer(data=request.data)
    if serializer.is_valid():
        result = get_chat_score_response(serializer.validated_data)
        if result is None:
            return Response({"detail": "Chat score failed"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(ChatScoreResponseSerializer(result).data,
                        status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

- [ ] **Step 4: image generation 뷰 구현**

```python
@api_view(["POST"])
def image_generation_response(request):
    serializer = ImageGenerationRequestSerializer(data=request.data)
    if serializer.is_valid():
        result = get_image_generation_response(serializer.validated_data)
        if result is None:
            return Response({"detail": "Image generation failed"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(ImageGenerationResponseSerializer(result).data,
                        status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

- [ ] **Step 5: image score 뷰 구현**

```python
@api_view(["POST"])
def image_score_response_for_url(request):
    serializer = ImageScoreRequestForImageURLSerializer(data=request.data)
    if serializer.is_valid():
        result = get_image_score_response_for_url(serializer.validated_data)
        if result is None:
            return Response({"detail": "Image score failed"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(ImageScoreResponseForImageURLSerializer(result).data,
                        status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

- [ ] **Step 6: decide-route 뷰 구현**

```python
@api_view(["POST"])
def decide_route_response(request):
    serializer = DecideRouteRequestSerializer(data=request.data)
    if serializer.is_valid():
        result = get_decide_route_response(serializer.validated_data)
        if result is None:
            return Response({"detail": "Route decision failed"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(DecideRouteResponseSerializer(result).data,
                        status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

- [ ] **Step 7: TTS 뷰 구현**

```python
@api_view(["POST"])
def tts_response(request):
    serializer = GenerateSpeechRequestSerializer(data=request.data)
    if serializer.is_valid():
        result = get_tts_response(serializer.validated_data)
        if result is None:
            return Response({"detail": "TTS failed"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(GenerateSpeechResponseSerializer(result).data,
                        status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

- [ ] **Step 8: Django check + URL 로드 검증**

Run: `cd c:/Users/SSAFY/Desktop/pjt/pjt_09/skeleton/proxy && python manage.py check`
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 9: Commit**

```bash
cd c:/Users/SSAFY/Desktop/pjt/pjt_09/skeleton/proxy
git add proxies/views.py
git commit -m "feat(proxy): implement 6 proxy views with guardrail 403"
```

---

## Task 3: .env 설정 + 서버 기동 스모크 테스트

**Files:**
- Create: `c:\Users\SSAFY\Desktop\pjt\pjt_09\skeleton\proxy\.env`

- [ ] **Step 1: .env 작성**

```
MODEL_SERVER_URL="http://localhost:8081/api/v1/openai"
```

> 주의: 실제 FastAPI 라우트 prefix를 확인하라. 참고 구현(`007_gms_api`)은 `/api/v1` prefix를 쓴다. 모델 서버 실행 후 실제 prefix에 맞춰 URL을 조정한다.

- [ ] **Step 2: 서버 기동**

Run: `cd c:/Users/SSAFY/Desktop/pjt/pjt_09/skeleton/proxy && python manage.py runserver 0.0.0.0:8080`
Expected: `Starting development server at http://0.0.0.0:8080/`

- [ ] **Step 3: 검증 (별도 터미널)**

모델 서버가 없는 경우, guardrail 호출은 services에서 None → 500을 반환해야 한다:

```bash
curl -s -X POST http://localhost:8080/api/v1/chat/guardrail/ \
  -H "Content-Type: application/json" -d '{"prompt":"test"}' -w "\n%{http_code}\n"
```
Expected: 모델 서버 없으면 `500`. 잘못된 body(`{}`)면 `400`.

- [ ] **Step 4: Commit**

```bash
cd c:/Users/SSAFY/Desktop/pjt/pjt_09/skeleton/proxy
git add .env 2>/dev/null || echo ".env gitignored - ok"
git commit -m "chore(proxy): add MODEL_SERVER_URL env" --allow-empty
```

---

# PART B — 프론트엔드 기반

## Task 4: Vite + React + Tailwind 프로젝트 스캐폴드

**Files:**
- Create: `web/package.json`, `web/vite.config.js`, `web/tailwind.config.js`, `web/postcss.config.js`, `web/index.html`, `web/src/main.jsx`, `web/src/App.jsx`, `web/src/index.css`

**Interfaces:**
- Produces: 실행 가능한 빈 Vite 앱, `/api` proxy 설정, 디자인 토큰

- [ ] **Step 1: 프로젝트 생성**

Run:
```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2
npm create vite@latest web -- --template react
cd web
npm install
npm install react-router-dom zustand
npm install -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: tailwind.config.js 작성**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#9A5ABF',
        'primary-strong': '#681993',
        'primary-heavy': '#4E1370',
      },
      fontFamily: {
        sans: ['Wanted Sans', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        btn: '12px',
        card: '15px',
        'card-lg': '18px',
        sheet: '22px',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(.4,0,.2,1)',
        emphasized: 'cubic-bezier(.2,0,0,1)',
      },
      keyframes: {
        dbfade: { from: { transform: 'translateY(8px)' }, to: { transform: 'none' } },
        dbspin: { to: { transform: 'rotate(360deg)' } },
        dbpulse: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
      },
      animation: {
        dbfade: 'dbfade .3s cubic-bezier(.4,0,.2,1) both',
        dbspin: 'dbspin 1s linear infinite',
        dbpulse: 'dbpulse 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: postcss.config.js 작성**

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
```

- [ ] **Step 4: src/index.css 작성**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-normal: #9A5ABF;
  --primary-strong: #681993;
  --primary-heavy: #4E1370;
}

* { box-sizing: border-box; }
body { margin: 0; -webkit-font-smoothing: antialiased; }
.nsb::-webkit-scrollbar { width: 0; height: 0; display: none; }
.nsb { scrollbar-width: none; }
```

- [ ] **Step 5: index.html에 폰트 추가**

`<head>` 안에 추가:

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net" />
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" rel="stylesheet" />
<link href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.css" rel="stylesheet" />
```

- [ ] **Step 6: vite.config.js 작성**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
})
```

- [ ] **Step 7: src/setupTests.js 작성**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 8: src/App.jsx 임시 작성**

```jsx
export default function App() {
  return <div className="font-sans text-primary p-content">다시봄</div>
}
```

- [ ] **Step 9: src/main.jsx 작성**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 10: 빌드 검증**

Run: `cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web && npm run build`
Expected: `✓ built in` 메시지, 에러 없음

- [ ] **Step 11: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git init 2>/dev/null; git add -A
git commit -m "chore(web): scaffold Vite + React + Tailwind with design tokens"
```

---

## Task 5: 정적 데이터 — copy.js (KR/EN 카피)

**Files:**
- Create: `web/src/data/copy.js`
- Test: `web/src/data/copy.test.js`

**Interfaces:**
- Produces: `copy` 객체 — `copy.ko`, `copy.en` 각각 동일한 키 셋을 가진다. 화면들은 `copy[lang].<key>`로 텍스트 참조

- [ ] **Step 1: 실패 테스트 작성**

`copy.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { copy } from './copy'

describe('copy', () => {
  it('ko와 en이 동일한 최상위 키를 가진다', () => {
    expect(Object.keys(copy.ko).sort()).toEqual(Object.keys(copy.en).sort())
  })
  it('온보딩 타이틀이 한국어 카피를 가진다', () => {
    expect(copy.ko.onbTitle).toContain('다시 봄')
  })
  it('영어 온보딩 타이틀이 존재한다', () => {
    expect(copy.en.onbTitle.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/data/copy.test.js`
Expected: FAIL — `Cannot find module './copy'`

- [ ] **Step 3: copy.js 구현**

dc.html과 README의 문구를 그대로 사용. 최소 다음 키를 양 언어로 작성:

```js
export const copy = {
  ko: {
    brandSub: '✦ AI 문화유산 복원·해설',
    onbTitle: '사라진 풍경을,\n다시 봄',
    onbBody: '문화유산을 비추면, AI가 복원 전·후를 보여주고\n눈높이에 맞춰 설명해 드려요.',
    onbLang: '언어를 선택하세요',
    onbStart: '시작하기',
    // 홈
    homeLocation: '서울 · 중구',
    homeRecommend: '추천 문화유산',
    // 네비
    navHome: '홈', navMap: '지도', navSaved: '즐겨찾기', navMy: '마이',
    // 지도
    mapNearby: '내 주변 문화유산',
    mapLegendAvailable: '체험 가능', mapLegendSoon: '준비 중',
    // 캡처
    captureTitle: '문화유산 비추기',
    captureHint: '안내판이 보이게 비춰주세요',
    captureOcr: 'OCR 자동 인식',
    captureSheetTitle: '무엇을 촬영할까요?',
    captureCamera: '카메라 촬영', captureOcrOpt: '안내판 OCR',
    captureQr: 'QR 인식', captureGallery: '갤러리 선택',
    // 분석
    analyzingTitle: 'AI가 분석하고 있어요',
    analyzingImg: '이미지 인식', analyzingOcr: '안내판 OCR', analyzingMatch: '데이터 매칭',
    // 식별
    identifyTitle: '이 문화유산이 맞나요?',
    identifyMatch: '일치율', identifyOcrResult: 'OCR 인식 결과',
    identifyStart: '복원 시작하기',
    // 상세
    detailBeforeAfter: '복원 전·후 비교',
    detailBefore: '2008년 화재 직후', detailAfter: '2013년 복원 완료',
    detailAiEstimate: 'AI 추정 복원',
    detailSource: '문화재청 국가유산포털',
    detailWhatChanged: '무엇이 달라졌나요',
    detailCommentary: '맞춤 해설',
    detailAskAi: 'AI 질문',
    detailSummary: '핵심 요약 카드',
    detailQuiz: '퀴즈',
    quizRetry: '다시 풀기', quizScore: '점수',
    // 알림
    notiTitle: '알림 설정',
    // 마이
    myTitle: '마이페이지',
    // 미지원
    unsupportedTitle: '준비 중인 문화유산이에요',
    unsupportedBrowse: '다른 문화유산 둘러보기',
  },
  en: {
    brandSub: '✦ AI Heritage Restoration & Commentary',
    onbTitle: 'See what time erased,\nonce again.',
    onbBody: 'Point at a heritage site and AI shows you\nbefore & after, explained at your level.',
    onbLang: 'Choose your language',
    onbStart: 'Get started',
    homeLocation: 'Seoul · Jung-gu',
    homeRecommend: 'Recommended',
    navHome: 'Home', navMap: 'Map', navSaved: 'Saved', navMy: 'My',
    mapNearby: 'Heritage near you',
    mapLegendAvailable: 'Available', mapLegendSoon: 'Coming soon',
    captureTitle: 'Point at heritage',
    captureHint: 'Make sure the info sign is visible',
    captureOcr: 'Auto OCR',
    captureSheetTitle: 'What would you like to capture?',
    captureCamera: 'Camera', captureOcrOpt: 'Sign OCR',
    captureQr: 'QR scan', captureGallery: 'From gallery',
    analyzingTitle: 'AI is analyzing',
    analyzingImg: 'Image recognition', analyzingOcr: 'Sign OCR', analyzingMatch: 'Data matching',
    identifyTitle: 'Is this the right heritage?',
    identifyMatch: 'match', identifyOcrResult: 'OCR result',
    identifyStart: 'Start restoration',
    detailBeforeAfter: 'Before / After',
    detailBefore: 'Right after 2008 fire', detailAfter: 'Restored in 2013',
    detailAiEstimate: 'AI-estimated',
    detailSource: 'Cultural Heritage Administration',
    detailWhatChanged: 'What changed',
    detailCommentary: 'Tailored commentary',
    detailAskAi: 'Ask AI',
    detailSummary: 'Summary cards',
    detailQuiz: 'Quiz',
    quizRetry: 'Try again', quizScore: 'Score',
    notiTitle: 'Notifications',
    myTitle: 'My page',
    unsupportedTitle: 'This heritage is coming soon',
    unsupportedBrowse: 'Browse other heritage',
  },
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd web && npx vitest run src/data/copy.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/data/copy.js src/data/copy.test.js
git commit -m "feat(web): add bilingual copy data"
```

---

## Task 6: 정적 데이터 — heritage.js + commentary.js

**Files:**
- Create: `web/src/data/heritage.js`, `web/src/data/commentary.js`
- Test: `web/src/data/heritage.test.js`

**Interfaces:**
- Produces:
  - `heritages` — 배열, 각 항목 `{ id, name:{ko,en}, era:{ko,en}, thumb, supported, tag:{ko,en}, distance, lat, lng, status }`
  - `getHeritage(id)` — id로 단일 항목 반환
  - `commentary` — `{ [heritageId]: { modes: [{key, label:{ko,en}, text:{ko,en}}], summaryCards:[{label:{ko,en}, value:{ko,en}, accent}], quiz:[{q:{ko,en}, options:[{ko,en}], answer, explain:{ko,en}}], changes:[{icon, title:{ko,en}, body:{ko,en}}], suggestedQuestions:[{ko,en}] }}`

- [ ] **Step 1: 실패 테스트 작성**

`heritage.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { heritages, getHeritage } from './heritage'

describe('heritage', () => {
  it('숭례문이 supported=true 이다', () => {
    const s = getHeritage('sungnyemun')
    expect(s.supported).toBe(true)
    expect(s.name.ko).toBe('숭례문')
  })
  it('최소 4개 이상의 문화유산이 있다', () => {
    expect(heritages.length).toBeGreaterThanOrEqual(4)
  })
  it('지도 핀에 lat/lng와 status가 있다', () => {
    heritages.forEach(h => {
      expect(typeof h.lat).toBe('number')
      expect(['available', 'soon']).toContain(h.status)
    })
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/data/heritage.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: heritage.js 구현**

```js
export const heritages = [
  {
    id: 'sungnyemun', name: { ko: '숭례문', en: 'Sungnyemun' },
    era: { ko: '국보 제1호 · 서울 · 조선 1398년 창건', en: 'National Treasure No.1 · Seoul · Joseon, 1398' },
    thumb: '/img/sungnyemun_after.png', supported: true,
    tag: { ko: '복원 사례', en: 'Restored' },
    distance: '320m', lat: 37.5601, lng: 126.9752, status: 'available',
  },
  {
    id: 'gyeongbok', name: { ko: '경복궁 근정전', en: 'Geunjeongjeon' },
    era: { ko: '국보 · 서울 · 조선 1395년', en: 'National Treasure · Seoul · Joseon, 1395' },
    thumb: '/img/geunjeongjeon.png', supported: true,
    tag: { ko: '인기', en: 'Popular' },
    distance: '1.2km', lat: 37.5796, lng: 126.9770, status: 'available',
  },
  {
    id: 'cheomseongdae', name: { ko: '첨성대', en: 'Cheomseongdae' },
    era: { ko: '국보 제31호 · 경주 · 신라', en: 'National Treasure No.31 · Gyeongju · Silla' },
    thumb: '/img/cheomseongdae.png', supported: false,
    tag: { ko: '준비 중', en: 'Coming soon' },
    distance: '278km', lat: 35.8347, lng: 129.2190, status: 'soon',
  },
  {
    id: 'mireuksa', name: { ko: '미륵사지 석탑', en: 'Mireuksa Stone Pagoda' },
    era: { ko: '국보 제11호 · 익산 · 백제', en: 'National Treasure No.11 · Iksan · Baekje' },
    thumb: '/img/stone_pagoda.png', supported: false,
    tag: { ko: '준비 중', en: 'Coming soon' },
    distance: '178km', lat: 36.0120, lng: 127.0286, status: 'soon',
  },
]

export function getHeritage(id) {
  return heritages.find(h => h.id === id)
}
```

- [ ] **Step 4: commentary.js 구현 (숭례문 중심)**

숭례문에 대해 전체 데이터를 작성한다 (해설 5모드, 요약카드 5개, 퀴즈 3문항, 변화카드 3개, 제안질문). README의 문구를 반영:

```js
export const commentary = {
  sungnyemun: {
    changes: [
      { icon: 'home', title: { ko: '구조', en: 'Structure' },
        body: { ko: '화재로 소실된 2층 문루의 목조 구조를 전통 기법으로 다시 세웠습니다.',
                 en: 'The two-story wooden gate tower lost to fire was rebuilt with traditional methods.' } },
      { icon: 'palette', title: { ko: '단청', en: 'Dancheong' },
        body: { ko: '천연 안료를 사용해 조선 시대 단청 문양을 고증하여 복원했습니다.',
                 en: 'Joseon-era dancheong patterns were restored with natural pigments.' } },
      { icon: 'layers', title: { ko: '기와·지붕', en: 'Roof tiles' },
        body: { ko: '전통 방식으로 구운 기와로 지붕을 새로 이었습니다.',
                 en: 'The roof was re-laid with traditionally fired tiles.' } },
    ],
    modes: [
      { key: '30s', label: { ko: '30초 요약', en: '30-sec' },
        text: { ko: '숭례문은 조선의 한양도성 정문으로, 2008년 화재로 누각이 소실됐다가 2013년 전통 기법으로 복원되었습니다.',
                 en: 'Sungnyemun, the main southern gate of Joseon-era Seoul, lost its tower to a 2008 fire and was restored in 2013.' } },
      { key: 'kids', label: { ko: '어린이', en: 'Kids' },
        text: { ko: '아주 오래된 큰 대문이에요. 불이 나서 다쳤지만, 사람들이 옛날 방식 그대로 다시 고쳤답니다.',
                 en: 'A very old big gate. It was hurt by a fire, but people fixed it just like the old days.' } },
      { key: 'teen', label: { ko: '청소년 학습', en: 'Teen' },
        text: { ko: '숭례문(남대문)은 1398년 한양도성과 함께 세워진 국보 제1호입니다. 2008년 방화로 목조 누각이 소실되었고, 5년간의 복원을 거쳐 2013년 시민에게 다시 공개되었습니다.',
                 en: 'Sungnyemun (Namdaemun), National Treasure No.1, was built in 1398. A 2008 arson destroyed the wooden tower; after 5 years of restoration it reopened in 2013.' } },
      { key: 'deep', label: { ko: '심화', en: 'In-depth' },
        text: { ko: '복원 과정에서 일제강점기에 변형된 좌우 성곽 일부를 함께 복원하고, 지반을 조선 시대 원형에 가깝게 조정했습니다. 단청은 전통 아교 기법을 적용했습니다.',
                 en: 'Restoration also recovered fortress walls altered during the colonial period and adjusted the ground closer to the Joseon original, using traditional glue-based dancheong.' } },
      { key: 'foreign', label: { ko: '외국인', en: 'For visitors' },
        text: { ko: 'Sungnyemun is the iconic southern gate of old Seoul. 한국을 처음 방문하셨다면, 600년 도시의 관문을 보고 계신 거예요.',
                 en: 'Sungnyemun is the iconic southern gate of old Seoul — the gateway to a 600-year-old capital.' } },
    ],
    summaryCards: [
      { label: { ko: '시대', en: 'Era' }, value: { ko: '조선 1398년', en: 'Joseon, 1398' }, accent: 'blue' },
      { label: { ko: '인물', en: 'People' }, value: { ko: '태조 이성계', en: 'King Taejo' }, accent: 'green' },
      { label: { ko: '사건', en: 'Event' }, value: { ko: '2008 화재', en: '2008 fire' }, accent: 'red' },
      { label: { ko: '변화', en: 'Change' }, value: { ko: '2013 복원', en: '2013 restored' }, accent: 'orange' },
      { label: { ko: '의미', en: 'Meaning' }, value: { ko: '국보 제1호', en: 'Treasure No.1' }, accent: 'purple' },
    ],
    suggestedQuestions: [
      { ko: '화재는 왜 났나요?', en: 'Why did the fire happen?' },
      { ko: '복원에 얼마나 걸렸나요?', en: 'How long did restoration take?' },
      { ko: '단청이 뭔가요?', en: 'What is dancheong?' },
    ],
    quiz: [
      { q: { ko: '숭례문의 국보 번호는?', en: "Sungnyemun's National Treasure number?" },
        options: [{ ko: '제1호', en: 'No.1' }, { ko: '제2호', en: 'No.2' }, { ko: '제31호', en: 'No.31' }, { ko: '제11호', en: 'No.11' }],
        answer: 0,
        explain: { ko: '숭례문은 국보 제1호입니다.', en: 'Sungnyemun is National Treasure No.1.' } },
      { q: { ko: '화재가 발생한 해는?', en: 'Year of the fire?' },
        options: [{ ko: '2005년', en: '2005' }, { ko: '2008년', en: '2008' }, { ko: '2010년', en: '2010' }, { ko: '2013년', en: '2013' }],
        answer: 1,
        explain: { ko: '2008년 2월 방화로 누각이 소실되었습니다.', en: 'The tower was lost to arson in February 2008.' } },
      { q: { ko: '복원이 완료된 해는?', en: 'Year restoration completed?' },
        options: [{ ko: '2011년', en: '2011' }, { ko: '2012년', en: '2012' }, { ko: '2013년', en: '2013' }, { ko: '2015년', en: '2015' }],
        answer: 2,
        explain: { ko: '2013년 5월 복원이 완료되어 공개되었습니다.', en: 'Restoration was completed and reopened in May 2013.' } },
    ],
  },
}

export function getCommentary(id) {
  return commentary[id]
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `cd web && npx vitest run src/data/heritage.test.js`
Expected: PASS (3 tests)

- [ ] **Step 6: 이미지 에셋 복사**

Run:
```bash
mkdir -p C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web/public/img
cp C:/Users/SSAFY/Desktop/dasibom_handoff_v2/img/*.png C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web/public/img/
```

- [ ] **Step 7: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/data/ public/img/
git commit -m "feat(web): add heritage and commentary static data + assets"
```

---

## Task 7: Zustand 스토어

**Files:**
- Create: `web/src/store/useAppStore.js`
- Test: `web/src/store/useAppStore.test.js`

**Interfaces:**
- Produces: `useAppStore` — 상태 + 액션. 다른 컴포넌트가 사용하는 액션 시그니처:
  - `setLang(lang)`, `toggleSaved(id)`, `setNoti(key, value)`
  - `setMapSheet(state)` where state ∈ `'collapsed'|'expanded'`
  - `setSheetOpen(bool)`, `setCaptureMode(mode)`
  - `setSlider(surface, pos)` surface ∈ `'m'|'w'`
  - `setMode(surface, modeKey)`, `setTTS(surface, {play, progress, speed})`
  - `addChat(surface, msg)`, `setPick(surface, qIdx, answerIdx)`, `resetQuiz(surface)`

- [ ] **Step 1: 실패 테스트 작성**

`useAppStore.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './useAppStore'

describe('useAppStore', () => {
  beforeEach(() => useAppStore.getState().__reset())

  it('기본 언어는 ko', () => {
    expect(useAppStore.getState().lang).toBe('ko')
  })
  it('toggleSaved가 저장 상태를 토글한다', () => {
    useAppStore.getState().toggleSaved('sungnyemun')
    expect(useAppStore.getState().saved.sungnyemun).toBe(true)
    useAppStore.getState().toggleSaved('sungnyemun')
    expect(useAppStore.getState().saved.sungnyemun).toBeUndefined()
  })
  it('setSlider가 surface별로 독립적이다', () => {
    useAppStore.getState().setSlider('m', 30)
    useAppStore.getState().setSlider('w', 70)
    expect(useAppStore.getState().mSliderPos).toBe(30)
    expect(useAppStore.getState().wSliderPos).toBe(70)
  })
  it('setPick은 첫 선택만 고정한다', () => {
    useAppStore.getState().setPick('m', 0, 2)
    useAppStore.getState().setPick('m', 0, 1)
    expect(useAppStore.getState().mPick[0]).toBe(2)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/store/useAppStore.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: useAppStore.js 구현**

```js
import { create } from 'zustand'

const initial = {
  lang: 'ko',
  captureMode: 'camera',
  sheetOpen: false,
  mapSheet: 'collapsed',
  saved: {},
  noti: { ads: true, today: true, newRestore: true, nearby: true },
  mSliderPos: 50, wSliderPos: 50,
  mMode: '30s', wMode: '30s',
  mPlay: false, wPlay: false,
  mTTS: 0, wTTS: 0,
  mSpeed: 1, wSpeed: 1,
  mChat: [], wChat: [],
  mPick: {}, wPick: {},
  mInput: '', wInput: '',
}

export const useAppStore = create((set) => ({
  ...initial,
  __reset: () => set({ ...initial, saved: {}, noti: { ...initial.noti }, mPick: {}, wPick: {}, mChat: [], wChat: [] }),
  setLang: (lang) => set({ lang }),
  toggleSaved: (id) => set((s) => {
    const saved = { ...s.saved }
    if (saved[id]) delete saved[id]; else saved[id] = true
    return { saved }
  }),
  setNoti: (key, value) => set((s) => ({ noti: { ...s.noti, [key]: value } })),
  setMapSheet: (state) => set({ mapSheet: state }),
  setSheetOpen: (v) => set({ sheetOpen: v }),
  setCaptureMode: (m) => set({ captureMode: m }),
  setSlider: (surface, pos) => set({ [`${surface}SliderPos`]: pos }),
  setMode: (surface, modeKey) => set({ [`${surface}Mode`]: modeKey }),
  setTTS: (surface, { play, progress, speed }) => set((s) => ({
    [`${surface}Play`]: play ?? s[`${surface}Play`],
    [`${surface}TTS`]: progress ?? s[`${surface}TTS`],
    [`${surface}Speed`]: speed ?? s[`${surface}Speed`],
  })),
  addChat: (surface, msg) => set((s) => ({ [`${surface}Chat`]: [...s[`${surface}Chat`], msg] })),
  setInput: (surface, v) => set({ [`${surface}Input`]: v }),
  setPick: (surface, qIdx, answerIdx) => set((s) => {
    const key = `${surface}Pick`
    if (s[key][qIdx] !== undefined) return s // 첫 선택만 고정
    return { [key]: { ...s[key], [qIdx]: answerIdx } }
  }),
  resetQuiz: (surface) => set({ [`${surface}Pick`]: {} }),
}))
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd web && npx vitest run src/store/useAppStore.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/store/
git commit -m "feat(web): add Zustand app store"
```

---

## Task 8: API 레이어 (client + chat + tts + identify)

**Files:**
- Create: `web/src/api/client.js`, `web/src/api/chat.js`, `web/src/api/tts.js`, `web/src/api/identify.js`
- Test: `web/src/api/chat.test.js`

**Interfaces:**
- Produces:
  - `client.js`: `USE_MOCK` (bool), `postJSON(path, body)` → Promise<json>
  - `chat.js`: `askAI(question, heritageId, lang)` → Promise<{answer, source}>
  - `tts.js`: `requestTTS(text)` → Promise<{audio_data}|null>
  - `identify.js`: `identifyImage(file)` → Promise<{heritageId, match, ocrText}>

- [ ] **Step 1: 실패 테스트 작성**

`chat.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { askAI } from './chat'

describe('askAI (mock)', () => {
  it('answer와 source를 반환한다', async () => {
    const res = await askAI('화재는 왜 났나요?', 'sungnyemun', 'ko')
    expect(res.answer.length).toBeGreaterThan(0)
    expect(res.source.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/api/chat.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: client.js 구현**

```js
export const USE_MOCK = true

export async function postJSON(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
```

- [ ] **Step 4: chat.js 구현**

```js
import { USE_MOCK, postJSON } from './client'

const MOCK = {
  ko: '2008년 2월, 한 시민의 방화로 화재가 발생했습니다. 이후 약 5년에 걸쳐 전통 기법으로 복원되었습니다.',
  en: 'In Feb 2008, arson caused the fire. Restoration with traditional methods took about 5 years.',
}
const SOURCE = { ko: '출처 · 문화재청 국가유산포털', en: 'Source · Cultural Heritage Administration' }

export async function askAI(question, heritageId, lang) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return { answer: MOCK[lang] || MOCK.ko, source: SOURCE[lang] || SOURCE.ko }
  }
  const messages = [{ role: 'user', content: `${heritageId}: ${question}` }]
  const data = await postJSON('/api/v1/chat/completions/', { messages })
  return { answer: data.content, source: SOURCE[lang] || SOURCE.ko }
}
```

- [ ] **Step 5: tts.js 구현**

```js
import { USE_MOCK, postJSON } from './client'

export async function requestTTS(text) {
  if (USE_MOCK) return null // mock 모드: 타이머 시뮬레이션 (컴포넌트가 처리)
  try {
    const data = await postJSON('/api/v1/generate-speech/', { text })
    return { audio_data: data.audio_data }
  } catch {
    return null
  }
}
```

- [ ] **Step 6: identify.js 구현**

```js
import { USE_MOCK } from './client'

export async function identifyImage(_file) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100))
    return {
      heritageId: 'sungnyemun',
      match: 96,
      ocrText: '숭례문 (崇禮門)\n국보 제1호\n서울특별시 중구 세종대로 40',
    }
  }
  // 실서버: /api/v1/images/score/url 로 후처리 예정
  return { heritageId: 'sungnyemun', match: 96, ocrText: '' }
}
```

- [ ] **Step 7: 테스트 통과 확인**

Run: `cd web && npx vitest run src/api/chat.test.js`
Expected: PASS (1 test)

- [ ] **Step 8: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/api/
git commit -m "feat(web): add API layer with mock toggle"
```

---

# PART C — 공통 컴포넌트

## Task 9: Icon + MobileShell + StatusBar + LangToggle

**Files:**
- Create: `web/src/components/Icon.jsx`, `web/src/components/StatusBar.jsx`, `web/src/components/MobileShell.jsx`, `web/src/components/LangToggle.jsx`
- Test: `web/src/components/LangToggle.test.jsx`

**Interfaces:**
- Consumes: `useAppStore` (lang, setLang)
- Produces:
  - `Icon({ name, size })` — SVG 아이콘. 지원 name: `home, map, camera, bookmark, bell, location, sparkle, chevron-right, chevron-left, play, pause, check, close, search, palette, layers, graduation, trophy`
  - `MobileShell({ children })` — 448×946 프레임
  - `StatusBar({ color })` — 상단 9:41 + 배터리
  - `LangToggle({ variant })` — variant ∈ `'pill'|'segment'`

- [ ] **Step 1: LangToggle 실패 테스트 작성**

`LangToggle.test.jsx`:

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LangToggle } from './LangToggle'
import { useAppStore } from '../store/useAppStore'

describe('LangToggle', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('EN 클릭 시 언어가 en으로 바뀐다', () => {
    render(<LangToggle />)
    fireEvent.click(screen.getByText('EN'))
    expect(useAppStore.getState().lang).toBe('en')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/components/LangToggle.test.jsx`
Expected: FAIL — module not found

- [ ] **Step 3: Icon.jsx 구현**

각 아이콘을 인라인 SVG path로 정의. 미정의 이름은 원(circle) fallback:

```jsx
const PATHS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  map: 'M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z',
  camera: 'M4 8h3l2-2h6l2 2h3v12H4V8zm8 3a4 4 0 100 8 4 4 0 000-8z',
  bookmark: 'M6 3h12v18l-6-4-6 4V3z',
  bell: 'M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6zM9 19a3 3 0 006 0',
  location: 'M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 4a3 3 0 100 6 3 3 0 000-6z',
  sparkle: 'M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  play: 'M7 4v16l13-8L7 4z',
  pause: 'M7 4h4v16H7zM13 4h4v16h-4z',
  check: 'M4 12l5 5L20 6',
  close: 'M5 5l14 14M19 5L5 19',
  search: 'M11 4a7 7 0 105 12l5 5M11 4a7 7 0 010 14',
  palette: 'M12 3a9 9 0 100 18c1 0 2-1 2-2s-1-2-1-3 1-2 3-2h2a3 3 0 003-3c0-4-4-8-9-8z',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5',
  graduation: 'M12 4L2 9l10 5 10-5-10-5zM6 11v5c0 1 3 3 6 3s6-2 6-3v-5',
  trophy: 'M6 4h12v3a6 6 0 01-12 0V4zM4 4h2M18 4h2M9 17h6v3H9z',
}

export function Icon({ name, size = 24 }) {
  const d = PATHS[name]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d ? <path d={d} /> : <circle cx="12" cy="12" r="9" />}
    </svg>
  )
}
```

- [ ] **Step 4: StatusBar.jsx 구현**

```jsx
export function StatusBar({ color = '#000' }) {
  return (
    <div style={{ color }} className="absolute top-0 left-0 right-0 h-[52px] z-[55] flex items-center justify-between px-[30px] pt-4 pointer-events-none">
      <span className="font-semibold text-base leading-none">9:41</span>
      <span className="flex gap-[7px] items-center">
        <span className="flex gap-[2px] items-end h-[11px]">
          {[5, 7, 9, 11].map((h) => (
            <i key={h} style={{ height: h }} className="w-[3px] bg-current rounded-[1px] block" />
          ))}
        </span>
        <span className="inline-flex items-center gap-[2px]">
          <i className="w-[22px] h-[11px] border-[1.5px] border-current rounded-[3px] block relative">
            <b className="absolute inset-[1.5px] w-[13px] bg-current rounded-[1px] block" />
          </i>
        </span>
      </span>
    </div>
  )
}
```

- [ ] **Step 5: MobileShell.jsx 구현**

```jsx
export function MobileShell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 py-8">
      <div className="p-[13px] bg-[#161617] rounded-[56px] shadow-2xl">
        <div className="relative w-[448px] h-[946px] bg-white overflow-hidden rounded-[44px]">
          {children}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: LangToggle.jsx 구현**

```jsx
import { useAppStore } from '../store/useAppStore'

export function LangToggle({ variant = 'pill' }) {
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)
  const opts = [{ key: 'ko', label: '한국어' }, { key: 'en', label: 'EN' }]
  return (
    <div className="flex gap-[6px]">
      {opts.map((o) => (
        <button key={o.key} onClick={() => setLang(o.key)}
          className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
            lang === o.key ? 'bg-primary text-white' : 'bg-black/5 text-black/60'
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 7: 테스트 통과 확인**

Run: `cd web && npx vitest run src/components/LangToggle.test.jsx`
Expected: PASS (1 test)

- [ ] **Step 8: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/components/
git commit -m "feat(web): add Icon, MobileShell, StatusBar, LangToggle"
```

---

## Task 10: BeforeAfterSlider

**Files:**
- Create: `web/src/components/BeforeAfterSlider.jsx`
- Test: `web/src/components/BeforeAfterSlider.test.jsx`

**Interfaces:**
- Consumes: `Icon`
- Produces: `BeforeAfterSlider({ beforeSrc, afterSrc, pos, onPosChange, beforeLabel, afterLabel })`
  - `pos` 0–100, base layer = after, overlay = before clipped `inset(0 ${100-pos}% 0 0)`

- [ ] **Step 1: 실패 테스트 작성**

`BeforeAfterSlider.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BeforeAfterSlider } from './BeforeAfterSlider'

describe('BeforeAfterSlider', () => {
  it('before/after 라벨을 렌더링한다', () => {
    render(<BeforeAfterSlider beforeSrc="/b.png" afterSrc="/a.png" pos={50}
      onPosChange={vi.fn()} beforeLabel="화재 직후" afterLabel="복원 완료" />)
    expect(screen.getByText('화재 직후')).toBeInTheDocument()
    expect(screen.getByText('복원 완료')).toBeInTheDocument()
  })
  it('overlay에 clip-path inset이 pos에 따라 적용된다', () => {
    const { container } = render(<BeforeAfterSlider beforeSrc="/b.png" afterSrc="/a.png"
      pos={30} onPosChange={vi.fn()} beforeLabel="b" afterLabel="a" />)
    const overlay = container.querySelector('[data-overlay]')
    expect(overlay.style.clipPath).toBe('inset(0 70% 0 0)')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/components/BeforeAfterSlider.test.jsx`
Expected: FAIL

- [ ] **Step 3: 구현**

```jsx
import { useRef } from 'react'
import { Icon } from './Icon'

export function BeforeAfterSlider({ beforeSrc, afterSrc, pos, onPosChange, beforeLabel, afterLabel }) {
  const ref = useRef(null)
  const dragging = useRef(false)

  const update = (clientX) => {
    const rect = ref.current.getBoundingClientRect()
    const p = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    onPosChange(p)
  }
  const onDown = (e) => { dragging.current = true; update(e.clientX) }
  const onMove = (e) => { if (dragging.current) update(e.clientX) }
  const onUp = () => { dragging.current = false }

  return (
    <div ref={ref} onPointerDown={onDown} onPointerMove={onMove}
         onPointerUp={onUp} onPointerLeave={onUp}
         className="relative w-full aspect-[4/3] rounded-card-lg overflow-hidden select-none touch-none cursor-ew-resize">
      <img src={afterSrc} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <img data-overlay src={beforeSrc} alt="" draggable={false}
           style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
           className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/55 text-white text-[11px]">{beforeLabel}</span>
      <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/55 text-white text-[11px]">{afterLabel}</span>
      <div style={{ left: `${pos}%` }} className="absolute top-0 bottom-0 -ml-[1px] w-[2px] bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
          <Icon name="chevron-left" size={14} />
          <Icon name="chevron-right" size={14} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd web && npx vitest run src/components/BeforeAfterSlider.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/components/BeforeAfterSlider.jsx src/components/BeforeAfterSlider.test.jsx
git commit -m "feat(web): add BeforeAfterSlider with clip-path drag"
```

---

## Task 11: BottomSheet + Switch + HeritageCard

**Files:**
- Create: `web/src/components/BottomSheet.jsx`, `web/src/components/Switch.jsx`, `web/src/components/HeritageCard.jsx`
- Test: `web/src/components/Switch.test.jsx`, `web/src/components/BottomSheet.test.jsx`

**Interfaces:**
- Produces:
  - `BottomSheet({ open, collapsedH, expandedH, state, onToggle, title, children })` — drag/tap 토글
  - `Switch({ on, onChange })` — 46×28 토글
  - `HeritageCard({ heritage, lang, onClick, thumbSize })`

- [ ] **Step 1: Switch 실패 테스트 작성**

`Switch.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Switch } from './Switch'

describe('Switch', () => {
  it('클릭 시 onChange(!on)을 호출한다', () => {
    const onChange = vi.fn()
    const { container } = render(<Switch on={false} onChange={onChange} />)
    fireEvent.click(container.firstChild)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
```

- [ ] **Step 2: BottomSheet 실패 테스트 작성**

`BottomSheet.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BottomSheet } from './BottomSheet'

describe('BottomSheet', () => {
  it('핸들 클릭 시 onToggle을 호출한다', () => {
    const onToggle = vi.fn()
    render(<BottomSheet open state="collapsed" collapsedH={150} expandedH={402}
      onToggle={onToggle} title="내 주변"><div>list</div></BottomSheet>)
    fireEvent.click(screen.getByTestId('sheet-handle'))
    expect(onToggle).toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `cd web && npx vitest run src/components/Switch.test.jsx src/components/BottomSheet.test.jsx`
Expected: FAIL (both)

- [ ] **Step 4: Switch.jsx 구현**

```jsx
export function Switch({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`w-[46px] h-[28px] rounded-full transition-colors relative shrink-0 ${on ? 'bg-primary' : 'bg-black/15'}`}>
      <span className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow transition-all ${on ? 'left-[21px]' : 'left-[3px]'}`} />
    </button>
  )
}
```

- [ ] **Step 5: BottomSheet.jsx 구현**

```jsx
import { useRef } from 'react'

export function BottomSheet({ open, state, collapsedH, expandedH, onToggle, title, children }) {
  const start = useRef(null)
  const height = state === 'expanded' ? expandedH : collapsedH
  if (!open) return null

  const onDown = (e) => { start.current = e.clientY }
  const onUp = (e) => {
    if (start.current === null) return
    const dy = start.current - e.clientY
    if (Math.abs(dy) > 24) {
      if (dy > 0 && state === 'collapsed') onToggle()
      if (dy < 0 && state === 'expanded') onToggle()
    }
    start.current = null
  }

  return (
    <div style={{ height, bottom: 90, transition: 'height .28s cubic-bezier(.2,0,0,1)' }}
         className="absolute left-0 right-0 bg-white rounded-t-sheet shadow-[0_-10px_34px_-10px_rgba(20,20,40,.22)] z-40">
      <div data-testid="sheet-handle" onPointerDown={onDown} onPointerUp={onUp}
           onClick={onToggle} className="pt-3 pb-2 flex flex-col items-center cursor-grab">
        <span className="w-9 h-1 rounded-full bg-black/20" />
        <div className="w-full px-content mt-2 font-bold text-[17px]">{title}</div>
      </div>
      <div className="px-content overflow-y-auto nsb" style={{ height: height - 70 }}>{children}</div>
    </div>
  )
}
```

- [ ] **Step 6: HeritageCard.jsx 구현**

```jsx
import { Icon } from './Icon'

export function HeritageCard({ heritage, lang, onClick, thumbSize = 96 }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3 text-left">
      <img src={heritage.thumb} alt="" style={{ width: thumbSize, height: thumbSize }}
           className="rounded-card object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[17px]">{heritage.name[lang]}</div>
        <div className="text-[13px] text-black/60 mt-1 truncate">{heritage.era[lang]}</div>
        <span className={`inline-block mt-2 px-2 py-[2px] rounded-full text-[11px] ${
          heritage.status === 'available' ? 'bg-primary text-white' : 'bg-black/8 text-black/55'
        }`}>{heritage.tag[lang]}</span>
      </div>
      <Icon name="chevron-right" size={20} />
    </button>
  )
}
```

- [ ] **Step 7: 테스트 통과 확인**

Run: `cd web && npx vitest run src/components/Switch.test.jsx src/components/BottomSheet.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 8: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/components/
git commit -m "feat(web): add BottomSheet, Switch, HeritageCard"
```

---

## Task 12: CommentaryPlayer (모드 칩 + TTS)

**Files:**
- Create: `web/src/components/CommentaryPlayer.jsx`
- Test: `web/src/components/CommentaryPlayer.test.jsx`

**Interfaces:**
- Consumes: `Icon`, `requestTTS` from api/tts
- Produces: `CommentaryPlayer({ modes, lang, activeMode, onModeChange, play, progress, speed, onPlayToggle, onSpeedChange })`
  - modes: `[{key, label:{ko,en}, text:{ko,en}}]`

- [ ] **Step 1: 실패 테스트 작성**

`CommentaryPlayer.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommentaryPlayer } from './CommentaryPlayer'

const modes = [
  { key: '30s', label: { ko: '30초 요약', en: '30s' }, text: { ko: '요약본', en: 'summary' } },
  { key: 'kids', label: { ko: '어린이', en: 'Kids' }, text: { ko: '쉬운 설명', en: 'easy' } },
]

describe('CommentaryPlayer', () => {
  it('활성 모드의 본문을 보여준다', () => {
    render(<CommentaryPlayer modes={modes} lang="ko" activeMode="30s"
      onModeChange={vi.fn()} play={false} progress={0} speed={1}
      onPlayToggle={vi.fn()} onSpeedChange={vi.fn()} />)
    expect(screen.getByText('요약본')).toBeInTheDocument()
  })
  it('다른 칩 클릭 시 onModeChange를 호출한다', () => {
    const onModeChange = vi.fn()
    render(<CommentaryPlayer modes={modes} lang="ko" activeMode="30s"
      onModeChange={onModeChange} play={false} progress={0} speed={1}
      onPlayToggle={vi.fn()} onSpeedChange={vi.fn()} />)
    fireEvent.click(screen.getByText('어린이'))
    expect(onModeChange).toHaveBeenCalledWith('kids')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/components/CommentaryPlayer.test.jsx`
Expected: FAIL

- [ ] **Step 3: 구현**

```jsx
import { Icon } from './Icon'

export function CommentaryPlayer({ modes, lang, activeMode, onModeChange, play, progress, speed, onPlayToggle, onSpeedChange }) {
  const active = modes.find((m) => m.key === activeMode) || modes[0]
  const nextSpeed = { 1: 1.5, 1.5: 2, 2: 1 }
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto nsb pb-1">
        {modes.map((m) => (
          <button key={m.key} onClick={() => onModeChange(m.key)}
            className={`px-3 py-[6px] rounded-full text-[13px] whitespace-nowrap ${
              m.key === activeMode ? 'bg-primary text-white' : 'bg-black/5 text-black/70'
            }`}>{m.label[lang]}</button>
        ))}
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-black/80">{active.text[lang]}</p>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={onPlayToggle}
          className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
          <Icon name={play ? 'pause' : 'play'} size={18} />
        </button>
        <div className="flex-1 h-[6px] rounded-full bg-black/10 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
        <button onClick={() => onSpeedChange(nextSpeed[speed])}
          className="px-2 py-1 rounded-md bg-black/5 text-[13px] font-medium">{speed}x</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd web && npx vitest run src/components/CommentaryPlayer.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/components/CommentaryPlayer.jsx src/components/CommentaryPlayer.test.jsx
git commit -m "feat(web): add CommentaryPlayer with mode chips + TTS bar"
```

---

## Task 13: AskAIChat

**Files:**
- Create: `web/src/components/AskAIChat.jsx`
- Test: `web/src/components/AskAIChat.test.jsx`

**Interfaces:**
- Consumes: `Icon`
- Produces: `AskAIChat({ chat, suggestions, lang, input, onInputChange, onSend })`
  - chat: `[{ role:'ai'|'user', text, source? }]`
  - onSend(question) — 부모가 askAI 호출 후 addChat

- [ ] **Step 1: 실패 테스트 작성**

`AskAIChat.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AskAIChat } from './AskAIChat'

const suggestions = [{ ko: '화재는 왜 났나요?', en: 'why fire?' }]

describe('AskAIChat', () => {
  it('제안 질문 클릭 시 onSend를 호출한다', () => {
    const onSend = vi.fn()
    render(<AskAIChat chat={[]} suggestions={suggestions} lang="ko"
      input="" onInputChange={vi.fn()} onSend={onSend} />)
    fireEvent.click(screen.getByText('화재는 왜 났나요?'))
    expect(onSend).toHaveBeenCalledWith('화재는 왜 났나요?')
  })
  it('AI 메시지의 출처를 렌더링한다', () => {
    render(<AskAIChat chat={[{ role: 'ai', text: '답변', source: '출처 · X' }]}
      suggestions={[]} lang="ko" input="" onInputChange={vi.fn()} onSend={vi.fn()} />)
    expect(screen.getByText('출처 · X')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/components/AskAIChat.test.jsx`
Expected: FAIL

- [ ] **Step 3: 구현**

```jsx
import { Icon } from './Icon'

export function AskAIChat({ chat, suggestions, lang, input, onInputChange, onSend }) {
  const submit = () => { if (input.trim()) onSend(input.trim()) }
  return (
    <div>
      <div className="space-y-3">
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[14px] ${
              m.role === 'user' ? 'bg-primary text-white' : 'bg-black/5 text-black/85'
            }`}>
              <div>{m.text}</div>
              {m.source && <div className="mt-1 text-[11px] opacity-70">{m.source}</div>}
            </div>
          </div>
        ))}
      </div>
      {suggestions.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => onSend(s[lang])}
              className="px-3 py-[6px] rounded-full bg-primary/10 text-primary text-[13px]">{s[lang]}</button>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="flex-1 h-11 px-3 rounded-btn bg-black/5 text-[14px] outline-none"
          placeholder={lang === 'ko' ? '궁금한 점을 물어보세요' : 'Ask anything'} />
        <button onClick={submit} className="w-11 h-11 rounded-btn bg-primary text-white flex items-center justify-center">
          <Icon name="chevron-right" size={18} />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd web && npx vitest run src/components/AskAIChat.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/components/AskAIChat.jsx src/components/AskAIChat.test.jsx
git commit -m "feat(web): add AskAIChat component"
```

---

## Task 14: Quiz

**Files:**
- Create: `web/src/components/Quiz.jsx`
- Test: `web/src/components/Quiz.test.jsx`

**Interfaces:**
- Consumes: none
- Produces: `Quiz({ questions, lang, picks, onPick, onReset })`
  - questions: `[{q:{ko,en}, options:[{ko,en}], answer, explain:{ko,en}}]`
  - picks: `{ [qIdx]: answerIdx }`

- [ ] **Step 1: 실패 테스트 작성**

`Quiz.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Quiz } from './Quiz'

const questions = [
  { q: { ko: '국보 번호?', en: 'no?' },
    options: [{ ko: '1호', en: '1' }, { ko: '2호', en: '2' }],
    answer: 0, explain: { ko: '1호입니다', en: 'it is 1' } },
]

describe('Quiz', () => {
  it('답 선택 시 onPick을 호출한다', () => {
    const onPick = vi.fn()
    render(<Quiz questions={questions} lang="ko" picks={{}} onPick={onPick} onReset={vi.fn()} />)
    fireEvent.click(screen.getByText('1호'))
    expect(onPick).toHaveBeenCalledWith(0, 0)
  })
  it('답한 뒤 설명을 보여준다', () => {
    render(<Quiz questions={questions} lang="ko" picks={{ 0: 0 }} onPick={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText('1호입니다')).toBeInTheDocument()
  })
  it('모두 답하면 점수를 보여준다', () => {
    render(<Quiz questions={questions} lang="ko" picks={{ 0: 0 }} onPick={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText(/1 \/ 1/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/components/Quiz.test.jsx`
Expected: FAIL

- [ ] **Step 3: 구현**

```jsx
export function Quiz({ questions, lang, picks, onPick, onReset }) {
  const answered = Object.keys(picks).length
  const allDone = answered === questions.length
  const score = questions.reduce((acc, q, i) => acc + (picks[i] === q.answer ? 1 : 0), 0)

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => {
        const picked = picks[qi]
        const isAnswered = picked !== undefined
        return (
          <div key={qi}>
            <div className="font-semibold text-[15px] mb-2">{qi + 1}. {q.q[lang]}</div>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                let cls = 'bg-black/5 text-black/80'
                if (isAnswered) {
                  if (oi === q.answer) cls = 'bg-green-100 text-green-700 border border-green-400'
                  else if (oi === picked) cls = 'bg-red-100 text-red-700 border border-red-400'
                  else cls = 'bg-black/5 text-black/30'
                }
                return (
                  <button key={oi} disabled={isAnswered} onClick={() => onPick(qi, oi)}
                    className={`w-full text-left px-3 py-2 rounded-btn text-[14px] ${cls}`}>{opt[lang]}</button>
                )
              })}
            </div>
            {isAnswered && <p className="mt-2 text-[13px] text-black/60">{q.explain[lang]}</p>}
          </div>
        )
      })}
      {allDone && (
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-primary">{score} / {questions.length}</span>
          <button onClick={onReset} className="px-3 py-2 rounded-btn bg-black/5 text-[13px]">
            {lang === 'ko' ? '다시 풀기' : 'Try again'}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd web && npx vitest run src/components/Quiz.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/components/Quiz.jsx src/components/Quiz.test.jsx
git commit -m "feat(web): add Quiz component"
```

---

## Task 15: BottomNav + MainLayout

**Files:**
- Create: `web/src/components/BottomNav.jsx`, `web/src/layouts/MainLayout.jsx`
- Test: `web/src/components/BottomNav.test.jsx`

**Interfaces:**
- Consumes: `Icon`, `useAppStore`, react-router `useNavigate`, `useLocation`
- Produces:
  - `BottomNav()` — 5탭 + 중앙 카메라 FAB. FAB 클릭 → `setSheetOpen(true)`
  - `MainLayout({ children })` — 탭 화면 래퍼, BottomNav 포함

- [ ] **Step 1: 실패 테스트 작성**

`BottomNav.test.jsx`:

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useAppStore } from '../store/useAppStore'

describe('BottomNav', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('카메라 FAB 클릭 시 sheetOpen을 연다', () => {
    render(<MemoryRouter><BottomNav /></MemoryRouter>)
    fireEvent.click(screen.getByTestId('camera-fab'))
    expect(useAppStore.getState().sheetOpen).toBe(true)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/components/BottomNav.test.jsx`
Expected: FAIL

- [ ] **Step 3: BottomNav.jsx 구현**

```jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'

export function BottomNav() {
  const nav = useNavigate()
  const loc = useLocation()
  const lang = useAppStore((s) => s.lang)
  const setSheetOpen = useAppStore((s) => s.setSheetOpen)
  const t = copy[lang]
  const tabs = [
    { path: '/home', icon: 'home', label: t.navHome },
    { path: '/map', icon: 'map', label: t.navMap },
    { path: '/saved', icon: 'bookmark', label: t.navSaved },
    { path: '/my', icon: 'graduation', label: t.navMy },
  ]
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[90px] bg-white border-t border-black/8 flex items-center justify-around px-2 z-30">
      {tabs.slice(0, 2).map((tab) => <NavBtn key={tab.path} tab={tab} loc={loc} nav={nav} />)}
      <button data-testid="camera-fab" onClick={() => setSheetOpen(true)}
        className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center -mt-6 shadow-lg shrink-0">
        <Icon name="camera" size={26} />
      </button>
      {tabs.slice(2).map((tab) => <NavBtn key={tab.path} tab={tab} loc={loc} nav={nav} />)}
    </div>
  )
}

function NavBtn({ tab, loc, nav }) {
  const active = loc.pathname === tab.path
  return (
    <button onClick={() => nav(tab.path)}
      className={`flex flex-col items-center gap-1 w-14 ${active ? 'text-primary' : 'text-black/30'}`}>
      <Icon name={tab.icon} size={25} />
      <span className="text-[11px]">{tab.label}</span>
    </button>
  )
}
```

- [ ] **Step 4: MainLayout.jsx 구현**

```jsx
import { BottomNav } from '../components/BottomNav'
import { CaptureSheet } from '../screens/Capture'

export function MainLayout({ children }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 overflow-y-auto nsb pb-[110px]">{children}</div>
      <BottomNav />
      <CaptureSheet />
    </div>
  )
}
```

> 주의: `CaptureSheet`는 Task 19에서 생성된다. Task 15 단계에서는 MainLayout에서 import를 주석 처리하고, Task 19 완료 후 주석을 해제한다. (또는 Task 19를 먼저 실행)

- [ ] **Step 5: 테스트 통과 확인**

먼저 MainLayout의 CaptureSheet import를 주석 처리한 상태로:

Run: `cd web && npx vitest run src/components/BottomNav.test.jsx`
Expected: PASS (1 test)

- [ ] **Step 6: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/components/BottomNav.jsx src/components/BottomNav.test.jsx src/layouts/
git commit -m "feat(web): add BottomNav and MainLayout"
```

---

# PART D — 백엔드/프론트 통합 검증 게이트

## Task 16: 모델 서버 응답 키 검증 + 라우트 확정

**Files:**
- Modify (필요 시): `c:\Users\SSAFY\Desktop\pjt\pjt_09\skeleton\proxy\proxies\services.py`, `web/src/api/*.js`

**Interfaces:**
- Consumes: 실행 중인 FastAPI 모델 서버
- Produces: 검증된 services 키 매핑

- [ ] **Step 1: 모델 서버 기동**

Run: FastAPI 모델 서버를 8081에서 실행 (참고: `007_gms_api` 또는 `008_gms_api`). 실제 라우트 prefix와 응답 스키마를 확인.

- [ ] **Step 2: 각 엔드포인트 실제 응답 확인**

Run:
```bash
curl -s -X POST http://localhost:8081/<실제prefix>/chat/guardrail \
  -H "Content-Type: application/json" -d '{"prompt":"테스트"}'
```
Expected: `{"result": true, "reason": "..."}` 또는 `{"is_appropriate": true}` — 실제 키 기록

- [ ] **Step 3: services.py 키 매핑 조정**

Step 2에서 확인한 실제 키에 맞춰 `services.py`의 `.get()` / `["key"]` 접근을 수정. (Task 1의 guardrail은 이미 양쪽 키를 수용하도록 작성됨. score/imageScore의 응답 키도 동일하게 확인.)

- [ ] **Step 4: .env URL 확정**

`skeleton/proxy/.env`의 `MODEL_SERVER_URL`을 Step 1의 실제 prefix에 맞춰 수정.

- [ ] **Step 5: Django 통한 end-to-end 검증**

Run:
```bash
curl -s -X POST http://localhost:8080/api/v1/chat/guardrail/ \
  -H "Content-Type: application/json" -d '{"prompt":"숭례문에 대해 알려줘"}' -w "\n%{http_code}\n"
```
Expected: `201` + `{"is_appropriate": true}`. 부적절 prompt면 `403`.

- [ ] **Step 6: Commit**

```bash
cd c:/Users/SSAFY/Desktop/pjt/pjt_09/skeleton/proxy
git add proxies/services.py .env 2>/dev/null
git commit -m "fix(proxy): align service response keys with model server" --allow-empty
```

---

# PART E — 화면 조립

> 각 화면 Task는 컴포넌트를 조립하고 라우팅에 연결한다. 화면은 렌더링 스모크 테스트(크래시 없이 핵심 텍스트 표시)로 검증한다.

## Task 17: App 라우팅 + Onboarding

**Files:**
- Modify: `web/src/App.jsx`
- Create: `web/src/screens/Onboarding.jsx`
- Test: `web/src/screens/Onboarding.test.jsx`

**Interfaces:**
- Consumes: `MobileShell`, `LangToggle`, `useAppStore`, `copy`, react-router
- Produces: 전체 라우트 트리, Onboarding 화면. "시작하기" → `/home`

- [ ] **Step 1: Onboarding 실패 테스트 작성**

`Onboarding.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Onboarding } from './Onboarding'

describe('Onboarding', () => {
  it('온보딩 타이틀을 렌더링한다', () => {
    render(<MemoryRouter><Onboarding /></MemoryRouter>)
    expect(screen.getByText(/다시 봄/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/screens/Onboarding.test.jsx`
Expected: FAIL

- [ ] **Step 3: Onboarding.jsx 구현**

```jsx
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { Icon } from '../components/Icon'

export function Onboarding() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)
  const t = copy[lang]
  return (
    <div className="absolute inset-0 flex flex-col justify-end animate-dbfade">
      <img src="/img/sungnyemun_after.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(15,18,30,.15) 0%, rgba(15,18,30,.35) 45%, rgba(13,16,26,.92) 100%)' }} />
      <div className="relative px-[30px] pb-[46px] text-white">
        <div className="inline-flex items-center gap-2 px-3 py-[7px] bg-white/15 backdrop-blur rounded-full mb-5">
          <Icon name="sparkle" size={14} />
          <span className="text-[13px]">{t.brandSub}</span>
        </div>
        <div className="text-[36px] font-bold leading-[1.18] whitespace-pre-line tracking-tight">{t.onbTitle}</div>
        <div className="text-[15px] text-white/80 mt-4 whitespace-pre-line">{t.onbBody}</div>
        <div className="mt-6">
          <div className="text-[12px] text-white/60 mb-2">{t.onbLang}</div>
          <div className="flex gap-2">
            {[{ k: 'ko', l: '한국어' }, { k: 'en', l: 'EN' }].map((o) => (
              <button key={o.k} onClick={() => setLang(o.k)}
                className={`px-4 py-2 rounded-full text-[14px] ${lang === o.k ? 'bg-white text-black' : 'bg-white/15 text-white'}`}>{o.l}</button>
            ))}
          </div>
        </div>
        <button onClick={() => nav('/home')}
          className="mt-7 w-full h-14 rounded-2xl bg-primary text-white font-bold text-[17px] flex items-center justify-center gap-2">
          {t.onbStart} <Icon name="chevron-right" size={18} />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: App.jsx 라우팅 구현**

```jsx
import { Routes, Route } from 'react-router-dom'
import { MobileShell } from './components/MobileShell'
import { StatusBar } from './components/StatusBar'
import { MainLayout } from './layouts/MainLayout'
import { Onboarding } from './screens/Onboarding'
import { Home } from './screens/Home'
import { MapScreen } from './screens/Map'
import { Saved } from './screens/Saved'
import { My } from './screens/My'
import { Capture } from './screens/Capture'
import { Analyzing } from './screens/Analyzing'
import { Identify } from './screens/Identify'
import { Detail } from './screens/Detail'
import { Notifications } from './screens/Notifications'
import { Unsupported } from './screens/Unsupported'
import { WebLanding } from './screens/WebLanding'

function Phone({ children }) {
  return <MobileShell><StatusBar />{children}</MobileShell>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Phone><Onboarding /></Phone>} />
      <Route path="/home" element={<Phone><MainLayout><Home /></MainLayout></Phone>} />
      <Route path="/map" element={<Phone><MainLayout><MapScreen /></MainLayout></Phone>} />
      <Route path="/saved" element={<Phone><MainLayout><Saved /></MainLayout></Phone>} />
      <Route path="/my" element={<Phone><MainLayout><My /></MainLayout></Phone>} />
      <Route path="/capture" element={<Phone><Capture /></Phone>} />
      <Route path="/analyzing" element={<Phone><Analyzing /></Phone>} />
      <Route path="/identify" element={<Phone><Identify /></Phone>} />
      <Route path="/detail/:id" element={<Phone><Detail /></Phone>} />
      <Route path="/notifications" element={<Phone><Notifications /></Phone>} />
      <Route path="/unsupported" element={<Phone><Unsupported /></Phone>} />
      <Route path="/web" element={<WebLanding />} />
    </Routes>
  )
}
```

> 주의: 아직 생성되지 않은 화면들(Home, Map 등)이 import되어 빌드가 깨진다. Task 17 단계에서는 미생성 화면을 임시 stub으로 만든다 (각 화면 파일에 `export function X(){ return <div/> }`). 후속 Task에서 실제 구현으로 교체. 또는 Task 17~25를 연속 실행한다.

- [ ] **Step 5: 미구현 화면 stub 생성**

Home, MapScreen, Saved, My, Capture, Analyzing, Identify, Detail, Notifications, Unsupported, WebLanding 각각에 대해 최소 stub 파일을 생성:

```jsx
// 예: web/src/screens/Home.jsx
export function Home() { return <div className="p-content pt-16">Home</div> }
```

(Capture.jsx에는 `export function CaptureSheet(){ return null }`도 함께 추가하여 MainLayout import 해결)

- [ ] **Step 6: 테스트 통과 + 빌드 확인**

Run: `cd web && npx vitest run src/screens/Onboarding.test.jsx && npm run build`
Expected: 테스트 PASS, 빌드 성공

- [ ] **Step 7: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/App.jsx src/screens/
git commit -m "feat(web): add routing and Onboarding screen"
```

---

## Task 18: Home 화면

**Files:**
- Modify: `web/src/screens/Home.jsx`
- Test: `web/src/screens/Home.test.jsx`

**Interfaces:**
- Consumes: `useAppStore`, `copy`, `heritages`, `HeritageCard`, `LangToggle`, `Icon`, react-router
- Produces: Home — 위치행/언어토글/벨, 히어로 배너 캐러셀, 추천 문화유산 리스트

- [ ] **Step 1: 실패 테스트 작성**

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Home } from './Home'
import { useAppStore } from '../store/useAppStore'

describe('Home', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('추천 문화유산 섹션 제목을 보여준다', () => {
    render(<MemoryRouter><Home /></MemoryRouter>)
    expect(screen.getByText('추천 문화유산')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/screens/Home.test.jsx`
Expected: FAIL (stub은 'Home'만 표시)

- [ ] **Step 3: Home.jsx 구현**

```jsx
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { heritages } from '../data/heritage'
import { HeritageCard } from '../components/HeritageCard'
import { LangToggle } from '../components/LangToggle'
import { Icon } from '../components/Icon'

const banners = [
  { img: '/img/gyeongbok_night.png', text: { ko: '야간개장 · 경복궁 별빛 야행\n오늘 19:00–21:30 · 예약 오픈', en: 'Night opening · Gyeongbokgung\nToday 19:00–21:30' } },
  { img: '/img/sungnyemun_after.png', text: { ko: '오늘의 문화유산 · 숭례문, 다시 보다\n복원 전·후를 비교해 보세요', en: "Today's heritage · Sungnyemun\nCompare before & after" } },
]

export function Home() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  const openHeritage = (h) => nav(h.supported ? `/detail/${h.id}` : '/unsupported')
  return (
    <div className="pt-[58px]">
      <div className="px-content flex items-center justify-between">
        <div className="flex items-center gap-1 text-[14px]"><Icon name="location" size={16} />{t.homeLocation}</div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <button onClick={() => nav('/notifications')}><Icon name="bell" size={22} /></button>
        </div>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto nsb px-content snap-x snap-mandatory">
        {banners.map((b, i) => (
          <div key={i} className="relative shrink-0 w-[92%] h-[480px] rounded-card-lg overflow-hidden snap-center">
            <img src={b.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,.75))' }} />
            <div className="absolute bottom-5 left-5 right-5 text-white text-[18px] font-bold whitespace-pre-line">{b.text[lang]}</div>
          </div>
        ))}
      </div>
      <div className="px-content mt-7">
        <h2 className="text-[18px] font-bold mb-1">{t.homeRecommend}</h2>
        {heritages.map((h) => (
          <HeritageCard key={h.id} heritage={h} lang={lang} onClick={() => openHeritage(h)} thumbSize={96} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd web && npx vitest run src/screens/Home.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/screens/Home.jsx src/screens/Home.test.jsx
git commit -m "feat(web): implement Home screen"
```

---

## Task 19: Capture + CaptureSheet + Analyzing

**Files:**
- Modify: `web/src/screens/Capture.jsx`, `web/src/screens/Analyzing.jsx`
- Test: `web/src/screens/Analyzing.test.jsx`

**Interfaces:**
- Consumes: `useAppStore`, `copy`, `Icon`, `identifyImage`, react-router
- Produces:
  - `Capture()` — 다크 카메라 뷰. 셔터 → `/analyzing`
  - `CaptureSheet()` — capture-options 바텀시트 (sheetOpen 제어), 4옵션, 선택 → `/capture`
  - `Analyzing()` — 스피너 + 3상태, 2.1s 후 `/identify`

- [ ] **Step 1: Analyzing 실패 테스트 작성**

```jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Analyzing } from './Analyzing'

describe('Analyzing', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())
  it('분석 타이틀을 보여준다', () => {
    render(<MemoryRouter><Analyzing /></MemoryRouter>)
    expect(screen.getByText('AI가 분석하고 있어요')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/screens/Analyzing.test.jsx`
Expected: FAIL

- [ ] **Step 3: Capture.jsx 구현 (Capture + CaptureSheet)**

```jsx
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { Icon } from '../components/Icon'

export function Capture() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  return (
    <div className="absolute inset-0 bg-[#0c0d12]">
      <img src="/img/sungnyemun_after.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,.6))' }} />
      <div className="absolute top-24 left-0 right-0 text-center text-white">
        <div className="text-[20px] font-bold">{t.captureTitle}</div>
        <div className="text-[13px] text-white/70 mt-1">{t.captureHint}</div>
        <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/20 text-[12px]">{t.captureOcr}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[140px] bg-[#0c0d12] flex items-center justify-around px-8">
        <button onClick={() => nav('/analyzing')}><Icon name="layers" size={28} /></button>
        <button onClick={() => nav('/analyzing')} className="w-20 h-20 rounded-full bg-white border-4 border-white/40" />
        <button onClick={() => nav('/home')} className="text-white"><Icon name="close" size={28} /></button>
      </div>
    </div>
  )
}

export function CaptureSheet() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const sheetOpen = useAppStore((s) => s.sheetOpen)
  const setSheetOpen = useAppStore((s) => s.setSheetOpen)
  const setCaptureMode = useAppStore((s) => s.setCaptureMode)
  const t = copy[lang]
  if (!sheetOpen) return null
  const opts = [
    { mode: 'camera', label: t.captureCamera, icon: 'camera' },
    { mode: 'ocr', label: t.captureOcrOpt, icon: 'search' },
    { mode: 'qr', label: t.captureQr, icon: 'layers' },
    { mode: 'gallery', label: t.captureGallery, icon: 'bookmark' },
  ]
  const pick = (mode) => { setCaptureMode(mode); setSheetOpen(false); nav('/capture') }
  return (
    <div className="absolute inset-0 z-50" onClick={() => setSheetOpen(false)}>
      <div className="absolute inset-0 bg-black/40" />
      <div onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-sheet p-content pb-8 animate-dbfade">
        <div className="w-9 h-1 rounded-full bg-black/20 mx-auto mb-4" />
        <h3 className="font-bold text-[18px] mb-4">{t.captureSheetTitle}</h3>
        <div className="grid grid-cols-2 gap-3">
          {opts.map((o) => (
            <button key={o.mode} onClick={() => pick(o.mode)}
              className="flex flex-col items-center gap-2 py-5 rounded-card bg-black/5">
              <Icon name={o.icon} size={26} /><span className="text-[14px]">{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Analyzing.jsx 구현**

```jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { Icon } from '../components/Icon'

export function Analyzing() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  useEffect(() => {
    const id = setTimeout(() => nav('/identify'), 2100)
    return () => clearTimeout(id)
  }, [nav])
  const rows = [
    { label: t.analyzingImg, state: 'done' },
    { label: t.analyzingOcr, state: 'active' },
    { label: t.analyzingMatch, state: 'wait' },
  ]
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white"
         style={{ background: 'linear-gradient(160deg, #2a1840, #0c0d12)' }}>
      <div className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-dbspin" />
      <h2 className="mt-8 text-[20px] font-bold">{t.analyzingTitle}</h2>
      <div className="mt-6 space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-[14px]">
            <span className={r.state === 'active' ? 'animate-dbpulse' : ''}>
              {r.state === 'done' ? <Icon name="check" size={16} /> : <span className="w-2 h-2 rounded-full bg-white/60 inline-block" />}
            </span>
            <span className={r.state === 'wait' ? 'text-white/40' : ''}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: MainLayout의 CaptureSheet import 활성화**

Task 15에서 주석 처리했던 `import { CaptureSheet } from '../screens/Capture'`를 활성화한다.

- [ ] **Step 6: 테스트 통과 확인**

Run: `cd web && npx vitest run src/screens/Analyzing.test.jsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/screens/Capture.jsx src/screens/Analyzing.jsx src/screens/Analyzing.test.jsx src/layouts/MainLayout.jsx
git commit -m "feat(web): implement Capture, CaptureSheet, Analyzing"
```

---

## Task 20: Identify 화면

**Files:**
- Modify: `web/src/screens/Identify.jsx`
- Test: `web/src/screens/Identify.test.jsx`

**Interfaces:**
- Consumes: `useAppStore`, `copy`, `getHeritage`, `identifyImage`, `Icon`, react-router
- Produces: Identify — 후보 카드(이미지/일치율/이름/시대), OCR 결과 카드, "복원 시작하기" → `/detail/:id`

- [ ] **Step 1: 실패 테스트 작성**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Identify } from './Identify'

describe('Identify', () => {
  it('식별 질문 타이틀을 보여준다', () => {
    render(<MemoryRouter><Identify /></MemoryRouter>)
    expect(screen.getByText('이 문화유산이 맞나요?')).toBeInTheDocument()
  })
  it('일치율을 보여준다', async () => {
    render(<MemoryRouter><Identify /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/96/)).toBeInTheDocument())
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/screens/Identify.test.jsx`
Expected: FAIL

- [ ] **Step 3: Identify.jsx 구현**

```jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { getHeritage } from '../data/heritage'
import { identifyImage } from '../api/identify'
import { Icon } from '../components/Icon'

export function Identify() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  const [result, setResult] = useState(null)
  useEffect(() => { identifyImage(null).then(setResult) }, [])
  if (!result) return null
  const h = getHeritage(result.heritageId)
  return (
    <div className="absolute inset-0 overflow-y-auto nsb px-content pt-16 pb-8">
      <button onClick={() => nav('/home')} className="mb-4"><Icon name="chevron-left" size={24} /></button>
      <h1 className="text-[22px] font-bold">{t.identifyTitle}</h1>
      <div className="mt-5 rounded-card-lg overflow-hidden border border-black/8">
        <div className="relative">
          <img src={h.thumb} alt="" className="w-full h-[200px] object-cover" />
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary text-white text-[13px] font-bold">{result.match}% {t.identifyMatch}</span>
        </div>
        <div className="p-4">
          <div className="text-[18px] font-bold">{h.name[lang]}</div>
          <div className="text-[13px] text-black/60 mt-1">{h.era[lang]}</div>
        </div>
      </div>
      <div className="mt-4 rounded-card bg-black/5 p-4">
        <div className="text-[13px] font-semibold mb-2">{t.identifyOcrResult}</div>
        <pre className="text-[13px] text-black/70 whitespace-pre-wrap font-sans">{result.ocrText}</pre>
      </div>
      <button onClick={() => nav(`/detail/${h.id}`)}
        className="mt-6 w-full h-14 rounded-2xl bg-primary text-white font-bold text-[16px]">{t.identifyStart}</button>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd web && npx vitest run src/screens/Identify.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/screens/Identify.jsx src/screens/Identify.test.jsx
git commit -m "feat(web): implement Identify screen"
```

---

## Task 21: Detail 화면 (코어)

**Files:**
- Modify: `web/src/screens/Detail.jsx`
- Test: `web/src/screens/Detail.test.jsx`

**Interfaces:**
- Consumes: `useAppStore`, `copy`, `getHeritage`, `getCommentary`, `askAI`, `requestTTS`, 모든 코어 컴포넌트, react-router `useParams`
- Produces: Detail — Hero, BeforeAfterSlider, 변화카드 3, CommentaryPlayer(TTS 타이머), AskAIChat, 요약카드 5, Quiz

- [ ] **Step 1: 실패 테스트 작성**

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Detail } from './Detail'
import { useAppStore } from '../store/useAppStore'

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/detail/sungnyemun']}>
      <Routes><Route path="/detail/:id" element={<Detail />} /></Routes>
    </MemoryRouter>
  )
}

describe('Detail', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('복원 전·후 비교 섹션을 보여준다', () => {
    renderDetail()
    expect(screen.getByText('복원 전·후 비교')).toBeInTheDocument()
  })
  it('퀴즈 섹션을 보여준다', () => {
    renderDetail()
    expect(screen.getByText('퀴즈')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/screens/Detail.test.jsx`
Expected: FAIL

- [ ] **Step 3: Detail.jsx 구현**

```jsx
import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { getHeritage } from '../data/heritage'
import { getCommentary } from '../data/commentary'
import { askAI } from '../api/chat'
import { Icon } from '../components/Icon'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'
import { CommentaryPlayer } from '../components/CommentaryPlayer'
import { AskAIChat } from '../components/AskAIChat'
import { Quiz } from '../components/Quiz'

const ACCENT = { blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700', orange: 'bg-orange-50 text-orange-700', purple: 'bg-primary/10 text-primary' }

export function Detail() {
  const { id } = useParams()
  const nav = useNavigate()
  const s = useAppStore()
  const lang = s.lang
  const t = copy[lang]
  const h = getHeritage(id)
  const c = getCommentary(id)
  const ttsTimer = useRef(null)

  // TTS mock 타이머
  useEffect(() => {
    if (s.mPlay) {
      ttsTimer.current = setInterval(() => {
        const next = s.mTTS + s.mSpeed * 1.1
        if (next >= 100) { s.setTTS('m', { play: false, progress: 100 }); clearInterval(ttsTimer.current) }
        else s.setTTS('m', { progress: next })
      }, 55)
    }
    return () => clearInterval(ttsTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.mPlay, s.mSpeed])

  if (!h || !c) return <div className="p-content pt-16">Not found</div>

  const handleSend = async (q) => {
    s.addChat('m', { role: 'user', text: q })
    const res = await askAI(q, id, lang)
    s.addChat('m', { role: 'ai', text: res.answer, source: res.source })
  }

  return (
    <div className="absolute inset-0 overflow-y-auto nsb pb-[110px]">
      <div className="relative h-[230px]">
        <img src={h.thumb} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        <button onClick={() => nav(-1)} className="absolute top-14 left-4 text-white"><Icon name="chevron-left" size={26} /></button>
        <button onClick={() => s.toggleSaved(id)} className="absolute top-14 right-4 text-white"><Icon name="bookmark" size={24} /></button>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-[24px] font-bold">{h.name[lang]}</div>
          <div className="text-[13px] text-white/80">{h.era[lang]}</div>
        </div>
      </div>

      <div className="px-content py-6 space-y-8">
        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailBeforeAfter}</h2>
          <BeforeAfterSlider beforeSrc="/img/sungnyemun_before.png" afterSrc="/img/sungnyemun_after.png"
            pos={s.mSliderPos} onPosChange={(p) => s.setSlider('m', p)}
            beforeLabel={t.detailBefore} afterLabel={t.detailAfter} />
          <div className="mt-2 flex items-center gap-2 text-[12px] text-orange-600">
            <Icon name="sparkle" size={14} />{t.detailAiEstimate}
            <span className="text-black/40 ml-auto">{t.detailSource}</span>
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailWhatChanged}</h2>
          <div className="space-y-3">
            {c.changes.map((ch, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-card bg-black/[.03]">
                <div className="w-10 h-10 rounded-card bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon name={ch.icon} size={20} /></div>
                <div>
                  <div className="font-semibold text-[15px]">{ch.title[lang]}</div>
                  <div className="text-[13px] text-black/60 mt-1">{ch.body[lang]}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailCommentary}</h2>
          <CommentaryPlayer modes={c.modes} lang={lang} activeMode={s.mMode}
            onModeChange={(m) => s.setMode('m', m)} play={s.mPlay} progress={s.mTTS} speed={s.mSpeed}
            onPlayToggle={() => s.setTTS('m', { play: !s.mPlay })}
            onSpeedChange={(sp) => s.setTTS('m', { speed: sp })} />
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailAskAi}</h2>
          <AskAIChat chat={s.mChat} suggestions={c.suggestedQuestions} lang={lang}
            input={s.mInput} onInputChange={(v) => s.setInput('m', v)} onSend={handleSend} />
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailSummary}</h2>
          <div className="grid grid-cols-2 gap-2">
            {c.summaryCards.map((card, i) => (
              <div key={i} className={`p-3 rounded-card ${ACCENT[card.accent]}`}>
                <div className="text-[11px] opacity-70">{card.label[lang]}</div>
                <div className="text-[15px] font-bold mt-1">{card.value[lang]}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailQuiz}</h2>
          <Quiz questions={c.quiz} lang={lang} picks={s.mPick}
            onPick={(qi, oi) => s.setPick('m', qi, oi)} onReset={() => s.resetQuiz('m')} />
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd web && npx vitest run src/screens/Detail.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/screens/Detail.jsx src/screens/Detail.test.jsx
git commit -m "feat(web): implement Detail screen with all sections"
```

---

## Task 22: Map 화면

**Files:**
- Modify: `web/src/screens/Map.jsx`
- Test: `web/src/screens/Map.test.jsx`

**Interfaces:**
- Consumes: `useAppStore`, `copy`, `heritages`, `BottomSheet`, `HeritageCard`, `Icon`, react-router
- Produces: MapScreen — 풀블리드 지도, 핀 마커, 범례, BottomSheet

- [ ] **Step 1: 실패 테스트 작성**

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MapScreen } from './Map'
import { useAppStore } from '../store/useAppStore'

describe('MapScreen', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('내 주변 문화유산 시트 제목을 보여준다', () => {
    render(<MemoryRouter><MapScreen /></MemoryRouter>)
    expect(screen.getByText('내 주변 문화유산')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/screens/Map.test.jsx`
Expected: FAIL

- [ ] **Step 3: Map.jsx 구현**

```jsx
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { heritages } from '../data/heritage'
import { BottomSheet } from '../components/BottomSheet'
import { Icon } from '../components/Icon'

export function MapScreen() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const mapSheet = useAppStore((s) => s.mapSheet)
  const setMapSheet = useAppStore((s) => s.setMapSheet)
  const t = copy[lang]
  const toggle = () => setMapSheet(mapSheet === 'collapsed' ? 'expanded' : 'collapsed')
  const open = (h) => nav(h.supported ? `/detail/${h.id}` : '/unsupported')
  // 핀 위치는 데모용 고정 좌표 매핑
  const pinPos = [{ top: '38%', left: '44%' }, { top: '30%', left: '52%' }, { top: '60%', left: '35%' }, { top: '66%', left: '60%' }]

  return (
    <div className="absolute inset-0">
      <img src="/img/map_bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute top-16 left-4 flex gap-2 z-10">
        <span className="px-3 py-1 rounded-full bg-white/90 text-[12px] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />{t.mapLegendAvailable}</span>
        <span className="px-3 py-1 rounded-full bg-white/90 text-[12px] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-black/40" />{t.mapLegendSoon}</span>
      </div>
      {heritages.map((h, i) => (
        <button key={h.id} onClick={() => open(h)} style={pinPos[i]}
          className="absolute -translate-x-1/2 -translate-y-full">
          <span className={`block w-7 h-7 rotate-45 rounded-full rounded-bl-none ${h.status === 'available' ? 'bg-primary' : 'bg-black/40'} flex items-center justify-center`}>
            <span className="-rotate-45 text-white"><Icon name="location" size={14} /></span>
          </span>
        </button>
      ))}
      <BottomSheet open state={mapSheet} collapsedH={150} expandedH={402} onToggle={toggle}
        title={`${t.mapNearby} · ${heritages.length}`}>
        {heritages.map((h) => (
          <button key={h.id} onClick={() => open(h)} className="w-full flex items-center gap-3 py-3 text-left border-b border-black/5">
            <img src={h.thumb} alt="" className="w-[54px] h-[54px] rounded-card object-cover" />
            <div className="flex-1">
              <div className="font-semibold text-[15px]">{h.name[lang]}</div>
              <div className="text-[12px] text-black/50">{h.distance} · {h.status === 'available' ? t.mapLegendAvailable : t.mapLegendSoon}</div>
            </div>
            <Icon name="chevron-right" size={18} />
          </button>
        ))}
      </BottomSheet>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd web && npx vitest run src/screens/Map.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/screens/Map.jsx src/screens/Map.test.jsx
git commit -m "feat(web): implement Map screen with bottom sheet"
```

---

## Task 23: Notifications + Unsupported

**Files:**
- Modify: `web/src/screens/Notifications.jsx`, `web/src/screens/Unsupported.jsx`
- Test: `web/src/screens/Notifications.test.jsx`

**Interfaces:**
- Consumes: `useAppStore`, `copy`, `Switch`, `Icon`, react-router
- Produces: Notifications (4 토글 행), Unsupported (빈 상태 + 둘러보기)

- [ ] **Step 1: 실패 테스트 작성**

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Notifications } from './Notifications'
import { useAppStore } from '../store/useAppStore'

describe('Notifications', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('알림 설정 타이틀을 보여준다', () => {
    render(<MemoryRouter><Notifications /></MemoryRouter>)
    expect(screen.getByText('알림 설정')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/screens/Notifications.test.jsx`
Expected: FAIL

- [ ] **Step 3: Notifications.jsx 구현**

```jsx
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { Switch } from '../components/Switch'
import { Icon } from '../components/Icon'

export function Notifications() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const noti = useAppStore((s) => s.noti)
  const setNoti = useAppStore((s) => s.setNoti)
  const t = copy[lang]
  const rows = [
    { key: 'ads', icon: 'sparkle', label: { ko: '야간개장·행사', en: 'Night events' }, desc: { ko: '야간개장과 행사 소식', en: 'Night openings & events' } },
    { key: 'today', icon: 'home', label: { ko: '오늘의 문화유산', en: "Today's heritage" }, desc: { ko: '매일 새로운 문화유산', en: 'A new heritage daily' } },
    { key: 'newRestore', icon: 'layers', label: { ko: '신규 복원 공개', en: 'New restorations' }, desc: { ko: '복원 사례가 추가되면', en: 'When restorations are added' } },
    { key: 'nearby', icon: 'location', label: { ko: '주변 문화유산 추천', en: 'Nearby heritage' }, desc: { ko: '근처 문화유산 알림', en: 'Heritage near you' } },
  ]
  return (
    <div className="absolute inset-0 overflow-y-auto nsb px-content pt-16 pb-8">
      <button onClick={() => nav(-1)} className="mb-4"><Icon name="chevron-left" size={24} /></button>
      <h1 className="text-[22px] font-bold">{t.notiTitle}</h1>
      <div className="mt-6 space-y-4">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-card bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon name={r.icon} size={20} /></div>
            <div className="flex-1">
              <div className="font-semibold text-[15px]">{r.label[lang]}</div>
              <div className="text-[12px] text-black/50">{r.desc[lang]}</div>
            </div>
            <Switch on={noti[r.key]} onChange={(v) => setNoti(r.key, v)} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Unsupported.jsx 구현**

```jsx
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { Icon } from '../components/Icon'

export function Unsupported() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-content text-center">
      <button onClick={() => nav(-1)} className="absolute top-16 left-4"><Icon name="chevron-left" size={24} /></button>
      <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4"><Icon name="search" size={28} /></div>
      <h1 className="text-[20px] font-bold">{t.unsupportedTitle}</h1>
      <p className="text-[14px] text-black/55 mt-2">
        {lang === 'ko' ? '데이터를 계속 확충하고 있어요.\n조금만 기다려 주세요.' : 'We are expanding our dataset.\nPlease check back soon.'}
      </p>
      <button onClick={() => nav('/home')} className="mt-6 px-5 py-3 rounded-btn bg-primary text-white text-[14px]">{t.unsupportedBrowse}</button>
    </div>
  )
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `cd web && npx vitest run src/screens/Notifications.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/screens/Notifications.jsx src/screens/Unsupported.jsx src/screens/Notifications.test.jsx
git commit -m "feat(web): implement Notifications and Unsupported screens"
```

---

## Task 24: Saved + My 화면

**Files:**
- Modify: `web/src/screens/Saved.jsx`, `web/src/screens/My.jsx`
- Test: `web/src/screens/Saved.test.jsx`

**Interfaces:**
- Consumes: `useAppStore`, `copy`, `heritages`, `HeritageCard`, `Icon`, react-router
- Produces: Saved (저장 목록/빈 상태), My (프로필/통계/설정 목록)

- [ ] **Step 1: 실패 테스트 작성**

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Saved } from './Saved'
import { useAppStore } from '../store/useAppStore'

describe('Saved', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('즐겨찾기 제목을 보여준다', () => {
    render(<MemoryRouter><Saved /></MemoryRouter>)
    expect(screen.getByText(/즐겨찾기/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/screens/Saved.test.jsx`
Expected: FAIL

- [ ] **Step 3: Saved.jsx 구현**

```jsx
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { heritages } from '../data/heritage'
import { HeritageCard } from '../components/HeritageCard'

export function Saved() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const saved = useAppStore((s) => s.saved)
  const list = heritages.filter((h) => saved[h.id])
  const title = lang === 'ko' ? '즐겨찾기' : 'Saved'
  return (
    <div className="pt-16 px-content">
      <h1 className="text-[22px] font-bold">{title} · {list.length}</h1>
      {list.length === 0 ? (
        <p className="text-[14px] text-black/50 mt-8 text-center">
          {lang === 'ko' ? '아직 저장한 문화유산이 없어요.' : 'No saved heritage yet.'}
        </p>
      ) : (
        list.map((h) => <HeritageCard key={h.id} heritage={h} lang={lang} onClick={() => nav(`/detail/${h.id}`)} />)
      )}
    </div>
  )
}
```

- [ ] **Step 4: My.jsx 구현**

```jsx
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { LangToggle } from '../components/LangToggle'
import { Icon } from '../components/Icon'

export function My() {
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  const stats = [
    { label: { ko: '방문', en: 'Visited' }, value: 12 },
    { label: { ko: '저장', en: 'Saved' }, value: 5 },
    { label: { ko: '퀴즈', en: 'Quiz' }, value: 8 },
  ]
  const settings = [
    { ko: '언어 설정', en: 'Language' }, { ko: '알림 설정', en: 'Notifications' },
    { ko: '저장 기록', en: 'Saved history' }, { ko: '방문한 문화유산', en: 'Visited heritage' },
    { ko: '계정 관리', en: 'Account' },
  ]
  return (
    <div className="pt-16 px-content">
      <h1 className="text-[22px] font-bold">{t.myTitle}</h1>
      <div className="flex items-center gap-3 mt-5">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center"><Icon name="graduation" size={26} /></div>
        <div className="flex-1"><div className="font-bold text-[16px]">{lang === 'ko' ? '문화유산 탐험가' : 'Heritage Explorer'}</div></div>
        <LangToggle />
      </div>
      <div className="flex gap-3 mt-5">
        {stats.map((s, i) => (
          <div key={i} className="flex-1 rounded-card bg-black/5 py-4 text-center">
            <div className="text-[20px] font-bold text-primary">{s.value}</div>
            <div className="text-[12px] text-black/55">{s.label[lang]}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 divide-y divide-black/5">
        {settings.map((s, i) => (
          <button key={i} className="w-full flex items-center justify-between py-4 text-left text-[15px]">
            {s[lang]} <Icon name="chevron-right" size={18} />
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `cd web && npx vitest run src/screens/Saved.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/screens/Saved.jsx src/screens/My.jsx src/screens/Saved.test.jsx
git commit -m "feat(web): implement Saved and My screens"
```

---

## Task 25: WebLanding (데스크탑 웹)

**Files:**
- Modify: `web/src/screens/WebLanding.jsx`
- Test: `web/src/screens/WebLanding.test.jsx`

**Interfaces:**
- Consumes: `useAppStore`, `copy`, `getCommentary`, `getHeritage`, `BeforeAfterSlider`, `CommentaryPlayer`, `AskAIChat`, `Quiz`, `LangToggle`
- Produces: WebLanding — 풀스크린 1440 페이지. sticky 헤더, 히어로(드롭존 + 슬라이더), 변화/해설/요약/Q&A/퀴즈, 카탈로그 그리드, 푸터. **갤러리 버튼 없음**, 드래그앤드롭 + 클릭 업로드만

- [ ] **Step 1: 실패 테스트 작성**

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WebLanding } from './WebLanding'
import { useAppStore } from '../store/useAppStore'

describe('WebLanding', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('워드마크를 보여준다', () => {
    render(<WebLanding />)
    expect(screen.getByText(/다시봄/)).toBeInTheDocument()
  })
  it('업로드 드롭존을 보여준다 (갤러리 버튼 없음)', () => {
    render(<WebLanding />)
    expect(screen.getByText(/끌어다 놓으세요/)).toBeInTheDocument()
    expect(screen.queryByText('갤러리 선택')).toBeNull()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd web && npx vitest run src/screens/WebLanding.test.jsx`
Expected: FAIL

- [ ] **Step 3: WebLanding.jsx 구현**

웹은 mobile과 독립된 surface(`w`) 상태를 사용한다. 드롭존은 `<input type="file">` 클릭 + drag 이벤트:

```jsx
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { getCommentary } from '../data/commentary'
import { getHeritage } from '../data/heritage'
import { askAI } from '../api/chat'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'
import { CommentaryPlayer } from '../components/CommentaryPlayer'
import { AskAIChat } from '../components/AskAIChat'
import { Quiz } from '../components/Quiz'
import { LangToggle } from '../components/LangToggle'
import { heritages } from '../data/heritage'

export function WebLanding() {
  const s = useAppStore()
  const lang = s.lang
  const t = copy[lang]
  const c = getCommentary('sungnyemun')
  const h = getHeritage('sungnyemun')

  const handleSend = async (q) => {
    s.addChat('w', { role: 'user', text: q })
    const res = await askAI(q, 'sungnyemun', lang)
    s.addChat('w', { role: 'ai', text: res.answer, source: res.source })
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-black/5">
        <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
          <span className="font-bold text-[20px] text-primary">✦ 다시봄</span>
          <nav className="flex items-center gap-6 text-[14px] text-black/70">
            <a>복원 비교</a><a>맞춤 해설</a><a>AI 학습</a><a>문화유산</a>
            <LangToggle />
            <button className="px-4 py-2 rounded-btn bg-primary text-white">사진 업로드</button>
          </nav>
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-8 py-16 grid grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[13px] mb-4">{t.brandSub}</span>
          <h1 className="text-[40px] font-bold leading-tight whitespace-pre-line tracking-tight">{t.onbTitle}</h1>
          <p className="text-[16px] text-black/60 mt-4 whitespace-pre-line">{t.onbBody}</p>
          <label className="mt-6 block border-2 border-dashed border-primary/40 rounded-card-lg p-10 text-center cursor-pointer">
            <input type="file" accept="image/*" className="hidden" />
            <div className="text-[16px] font-medium">{lang === 'ko' ? '사진을 끌어다 놓으세요' : 'Drag & drop a photo'}</div>
            <div className="text-[13px] text-black/50 mt-2">{lang === 'ko' ? 'JPG·PNG·HEIC 지원 · 클릭해서 선택' : 'JPG·PNG·HEIC · click to choose'}</div>
          </label>
        </div>
        <BeforeAfterSlider beforeSrc="/img/sungnyemun_before.png" afterSrc="/img/sungnyemun_after.png"
          pos={s.wSliderPos} onPosChange={(p) => s.setSlider('w', p)}
          beforeLabel={t.detailBefore} afterLabel={t.detailAfter} />
      </section>

      <section className="max-w-[1000px] mx-auto px-8 py-12">
        <h2 className="text-[24px] font-bold mb-6">{t.detailCommentary}</h2>
        <CommentaryPlayer modes={c.modes} lang={lang} activeMode={s.wMode}
          onModeChange={(m) => s.setMode('w', m)} play={s.wPlay} progress={s.wTTS} speed={s.wSpeed}
          onPlayToggle={() => s.setTTS('w', { play: !s.wPlay })}
          onSpeedChange={(sp) => s.setTTS('w', { speed: sp })} />
      </section>

      <section className="max-w-[1000px] mx-auto px-8 py-12">
        <h2 className="text-[24px] font-bold mb-6">{t.detailAskAi}</h2>
        <AskAIChat chat={s.wChat} suggestions={c.suggestedQuestions} lang={lang}
          input={s.wInput} onInputChange={(v) => s.setInput('w', v)} onSend={handleSend} />
      </section>

      <section className="max-w-[1000px] mx-auto px-8 py-12">
        <h2 className="text-[24px] font-bold mb-6">{t.detailQuiz}</h2>
        <Quiz questions={c.quiz} lang={lang} picks={s.wPick}
          onPick={(qi, oi) => s.setPick('w', qi, oi)} onReset={() => s.resetQuiz('w')} />
      </section>

      <section className="max-w-[1200px] mx-auto px-8 py-12">
        <h2 className="text-[24px] font-bold mb-6">{t.unsupportedBrowse}</h2>
        <div className="grid grid-cols-4 gap-4">
          {heritages.map((hh) => (
            <div key={hh.id} className="rounded-card overflow-hidden border border-black/8">
              <img src={hh.thumb} alt="" className="w-full h-40 object-cover" />
              <div className="p-3"><div className="font-semibold text-[15px]">{hh.name[lang]}</div></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/5 py-8 text-center text-[13px] text-black/40">
        {t.detailSource}
      </footer>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd web && npx vitest run src/screens/WebLanding.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add src/screens/WebLanding.jsx src/screens/WebLanding.test.jsx
git commit -m "feat(web): implement desktop WebLanding page"
```

---

# PART F — 마무리

## Task 26: 전체 테스트 + 빌드 + 통합 스모크

**Files:**
- Modify (필요 시): 발견된 버그 수정

- [ ] **Step 1: 전체 단위 테스트 실행**

Run: `cd web && npx vitest run`
Expected: 모든 테스트 PASS

- [ ] **Step 2: 프로덕션 빌드**

Run: `cd web && npm run build`
Expected: 빌드 성공, 에러 없음

- [ ] **Step 3: 수동 스모크 (개발 서버)**

Run: `cd web && npm run dev`
브라우저에서 `localhost:5173` 확인:
- 온보딩 → 시작하기 → 홈
- 카메라 FAB → 시트 → 촬영 → 분석(2.1s) → 식별 → 상세
- 상세에서 슬라이더 드래그, 해설 모드 전환, TTS 재생, AI 질문, 퀴즈 풀이
- 지도 시트 드래그, 알림 토글, 언어 KR/EN 전환
- `localhost:5173/web` 데스크탑 페이지

- [ ] **Step 4: 백엔드 연동 스모크 (선택)**

Django(8080) + FastAPI(8081) 기동 후, `client.js`의 `USE_MOCK = false`로 변경. 상세 화면 AI 질문이 실제 응답을 받는지 확인. 확인 후 데모 안정성을 위해 `USE_MOCK = true`로 되돌리거나 유지 결정.

- [ ] **Step 5: 최종 커밋**

```bash
cd C:/Users/SSAFY/Desktop/dasibom_handoff_v2/web
git add -A
git commit -m "test: full suite green + integration smoke" --allow-empty
```

---

## 실행 가이드 (심사용)

1. **백엔드**: FastAPI 모델 서버를 8081에서 실행 → Django를 `python manage.py runserver 0.0.0.0:8080`
2. **프론트**: `cd web && npm install && npm run dev` → `localhost:5173`
3. mock 모드(`USE_MOCK=true`)면 백엔드 없이도 프론트 전체 데모 가능

---

## Self-Review 결과

**Spec 커버리지:**
- 디자인 토큰 → Task 4 ✓
- copy KR/EN → Task 5 ✓
- heritage/commentary 데이터 → Task 6 ✓
- Zustand 상태 모델 → Task 7 ✓
- API 레이어 + USE_MOCK → Task 8 ✓
- 공통 컴포넌트 9종 → Task 9~15 ✓
- Django 6 services + 6 views + guardrail 403 → Task 1~2 ✓
- 모델 서버 키 검증 → Task 16 ✓
- 11개 모바일 화면 → Task 17~24 ✓
- 데스크탑 웹 → Task 25 ✓
- BeforeAfter clip-path, BottomSheet 드래그, TTS 타이머, Quiz, 언어토글 → 각 컴포넌트 Task ✓

**Placeholder 스캔:** Task 15/17의 stub은 의도된 순서 의존성으로, 후속 Task에서 실제 구현으로 교체됨을 명시. 그 외 placeholder 없음.

**타입 일관성:** store 액션 시그니처(`setSlider('m'|'w', pos)`, `setTTS(surface, {play,progress,speed})`, `setPick(surface, qIdx, answerIdx)`)가 모든 소비 Task에서 일관됨. heritage/commentary 객체 형태가 컴포넌트 props와 일치.
