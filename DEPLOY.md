# 다시봄 / YetBom — 배포 가이드

모노레포 한 개(`github.com/WhySoSsafy/YetBom`)에서 **프론트(Vercel)** + **백엔드(Railway)** 를 배포합니다.

```
YetBom/
  web/       ← Vercel (Root Directory = web)   — Vite 정적 SPA
  backend/   ← Railway (Root Directory = backend) — Django + OpenAI
```

데이터 흐름: 브라우저 → (Vercel) `/api/*` → **rewrite** → Railway Django → OpenAI.

---

## 사전 준비물
- GitHub 레포: `WhySoSsafy/YetBom` (이미 있음)
- **OpenAI API 키** (본인 것)
- Railway 계정, Vercel 계정 (둘 다 GitHub 로그인 가능)

---

## STEP 1 — 코드 푸시 (제가 처리)
모노레포를 `main` 브랜치로 YetBom에 푸시합니다. (아래는 참고용 명령)
```
git remote add origin https://github.com/WhySoSsafy/YetBom.git
git branch -M main
git push -u origin main
```

## STEP 2 — 백엔드 배포 (Railway) — 먼저!
1. Railway → **New Project → Deploy from GitHub repo → YetBom** 선택.
2. 서비스 설정 → **Root Directory = `backend`** (중요).
   - Railway가 `requirements.txt` + `Procfile`을 자동 인식해 gunicorn으로 실행합니다.
3. **Variables(환경변수)** 추가:
   - `OPENAI_API_KEY` = (본인 OpenAI 키)
   - `DEBUG` = `False`
   - `SECRET_KEY` = (아무 긴 랜덤 문자열)
   - `ALLOWED_HOSTS` = (배포 후 생기는 도메인, 예: `yetbom-backend.up.railway.app`)  ※ 이미 코드에서 `.railway.app`는 허용되어 있어 비워둬도 동작
4. 배포 완료 후 **공개 URL** 확인 (예: `https://yetbom-backend.up.railway.app`).
5. 동작 확인(선택): `https://<railway-url>/api/v1/chat/completions/` 에 `{"messages":[{"role":"user","content":"안녕"}]}` POST → `{content:...}` 오면 OK.

## STEP 3 — rewrite에 Railway URL 넣기
`web/vercel.json` 의 `REPLACE-WITH-RAILWAY-URL` 을 STEP 2의 Railway 도메인으로 교체 후 커밋·푸시.
```json
{ "rewrites": [ { "source": "/api/:path*", "destination": "https://yetbom-backend.up.railway.app/api/:path*" } ] }
```

## STEP 4 — 프론트 배포 (Vercel)
1. Vercel → **Add New Project → Import YetBom**.
2. **Root Directory = `web`**, Framework Preset = **Vite** (자동 감지).
3. **Environment Variables** 추가:
   - `VITE_USE_MOCK` = `false`   ← 이게 있어야 실제 백엔드/AI를 호출합니다. (없으면 목업으로 동작)
4. Deploy → 완료되면 `https://<your-app>.vercel.app` 공개 URL.

## STEP 5 — 동작 검증 (실제 사용자 흐름)
- `https://<vercel-url>/` (모바일) — 온보딩 → 홈 → 촬영(사진 선택) → 분석 → **실제 식별** → 상세
- 상세에서: 복원 전·후 슬라이더, **AI 질문(실제 OpenAI 응답)**, **TTS 재생(실제 음성)**, 퀴즈
- `https://<vercel-url>/web` (데스크탑) — 사진 업로드 → 동일 플로우

---

## 비용/보안 메모
- OpenAI 키는 **Railway 서버 환경변수에만** 존재 (브라우저 노출 없음).
- 공개 배포 시 **모르는 사용자 호출도 본인 OpenAI 사용량으로 과금**됩니다. OpenAI 대시보드에서 **월 사용 한도(usage limit)** 를 꼭 설정하세요.
- 모델: 채팅·식별 `gpt-4o-mini`(저렴), TTS `tts-1`, 가드레일 Moderation(무료).
- 과한 트래픽이 걱정되면 추후 간단한 rate-limit 또는 접근 제한을 추가할 수 있습니다(현재 미적용).

## 로컬에서 실제 백엔드로 테스트 (선택)
```
# 1) 백엔드
cd backend && pip install -r requirements.txt
echo 'OPENAI_API_KEY="sk-..."' > .env
python manage.py runserver 0.0.0.0:8080
# 2) 프론트 (다른 터미널) — Vite proxy가 /api → localhost:8080 로 전달
cd web && (echo VITE_USE_MOCK=false > .env.local) && npm run dev
```
