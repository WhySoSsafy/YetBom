# Task 16 — 모델 서버 통합 검증 체크리스트 (런타임, 사용자 실행 필요)

이 단계는 **실제 FastAPI 모델 서버(8081)와 API 키**가 있어야 검증됩니다. 프론트엔드는
`USE_MOCK=true`로 이미 독립 동작하므로, 이 검증은 실서버 연동 시점에 수행하세요.

## 현재 상태 (정적 분석으로 확인됨)

- **프론트 → Django(8080) 경로**: `/api/v1/chat/completions/`, `/api/v1/generate-speech/` 등 —
  `proxies/urls.py`의 실제 라우트와 **일치 확인됨**. (Vite proxy `/api` → 8080)
- **Django(services.py) → 모델 서버 경로**: `MODEL_SERVER_URL` + `/chat/completions`,
  `/chat/guardrail`, `/chat/score`, `/images/generations`, `/images/score/url`,
  `/decide-route`, `/generate-speech`. `MODEL_SERVER_URL` 기본값
  `http://localhost:8081/api/v1/openai`. 이 경로들은 스켈레톤이 제공한 예시
  `get_chat_response`(`/chat/completions`)의 패턴을 그대로 따른 것 — **스켈레톤 계약 준수**.
- **guardrail 응답 키**: services가 `{is_appropriate}` 또는 `{result}` 둘 다 수용하도록 작성됨.

## 주의 — 참조 연습 서버(007/008)와 경로가 다름

`pjt_09/007_gms_api`, `008_gms_api`는 **진행형 연습 서버**라 라우트가 다릅니다:
`/api/v1/chat`, `/api/v1/chat/score`, `/api/v1/chat/guardrail`, `/api/v1/images/generations`,
`/api/v1/audio/speech` (── `/openai` 프리픽스 없음, `/generate-speech` 대신 `/audio/speech`).

→ 따라서 **정답 모델 서버(`server/openai/`)를 8081에 띄우거나**, 만약 다른 서버를 쓴다면
`MODEL_SERVER_URL`과 services의 경로/키를 그 서버에 맞춰 조정해야 합니다.

## 런타임 검증 절차 (모델 서버 + Django 기동 후)

1. FastAPI 모델 서버를 8081에서 실행 (API 키 설정).
2. 실제 라우트 prefix와 각 엔드포인트 응답 키를 확인:
   ```bash
   curl -s -X POST http://localhost:8081/<실제prefix>/chat/guardrail \
     -H "Content-Type: application/json" -d '{"prompt":"테스트"}'
   ```
   기대: `{"result": true, ...}` 또는 `{"is_appropriate": true}` — 실제 키 기록.
   같은 방식으로 `/chat/score`(→ `{score, reason}`), `/images/generations`(→ `{url}`),
   `/images/score/url`(→ `{score, reason}`), `/decide-route`(→ `{route}`),
   `/generate-speech`(→ `{audio_data}`) 확인.
3. 불일치가 있으면 `proxies/services.py`의 경로/`.get()` 키 매핑을 조정.
   - 특히 `/chat/score`: 스켈레톤 serializer는 `{messages, answer}`를 보냄. 정답 서버가
     `{prompt, answer}`를 기대한다면 services에서 변환 필요.
4. `skeleton/proxy/.env`의 `MODEL_SERVER_URL`을 실제 prefix에 맞춤.
5. Django(8080) 기동 후 end-to-end 확인:
   ```bash
   curl -s -X POST http://localhost:8080/api/v1/chat/guardrail/ \
     -H "Content-Type: application/json" -d '{"prompt":"숭례문 알려줘"}' -w "\n%{http_code}\n"
   ```
   기대: `201` + `{"is_appropriate": true}`. 부적절 prompt → `403`.
6. 프론트 `src/api/client.js`의 `USE_MOCK = false`로 바꿔 상세 화면 AI 질문이 실응답을
   받는지 확인. 데모 안정성을 위해 확인 후 `true`로 되돌릴지 결정.
