FROM python:3.12-slim

WORKDIR /app

# 의존성 먼저 (레이어 캐시)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 앱 소스
COPY . .

# Railway가 $PORT 주입 (PORT=8080 변수와 도메인 타깃 포트 일치)
CMD gunicorn proxy_pjt.wsgi --bind 0.0.0.0:$PORT --log-file -
