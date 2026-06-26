"""
OpenAI 직접 호출 서비스 레이어.
각 함수는 성공 시 dict, 실패 시 None 반환.
"""
import base64
import json
import re

from django.conf import settings
from openai import OpenAI

ALLOWED_HERITAGE_IDS = {"sungnyemun", "gyeongbok", "cheomseongdae", "mireuksa", "unsupported"}

DOCENT_SYSTEM_MESSAGE = {
    "role": "system",
    "content": (
        "당신은 한국 문화유산 도슨트입니다. "
        "방문객의 질문에 친절하고 간결하게 답변하세요. "
        "답변은 질문자가 사용하는 언어로 작성하세요 (한국어 질문이면 한국어, 영어 질문이면 영어). "
        "역사적 사실에 기반해 정확한 정보를 제공하고 지나치게 길지 않게 하세요."
    ),
}

IDENTIFY_PROMPT = (
    "Identify which of these Korean heritage sites this photo shows and read any signboard text. "
    "Respond ONLY with compact JSON: "
    "{\"heritageId\": one of [\"sungnyemun\",\"gyeongbok\",\"cheomseongdae\",\"mireuksa\",\"unsupported\"], "
    "\"match\": 0-100 confidence, "
    "\"ocrText\": any Korean text visible on signs or empty string}."
)


def _get_client() -> OpenAI:
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def get_chat_response(chat_request: dict):
    """
    채팅 완성 요청.
    먼저 최신 user 메시지에 대해 moderation 을 수행하고,
    부적절하면 거부 메시지를 반환한다.
    """
    messages = chat_request["messages"]

    # 마지막 user 메시지 추출
    user_text = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            content = msg.get("content", "")
            user_text = content if isinstance(content, str) else str(content)
            break

    try:
        client = _get_client()

        # Moderation 검사
        mod_resp = client.moderations.create(
            model="omni-moderation-latest",
            input=user_text,
        )
        if mod_resp.results[0].flagged:
            return {
                "content": (
                    "죄송합니다. 해당 내용은 답변드리기 어렵습니다. "
                    "한국 문화유산에 관한 다른 질문을 부탁드립니다."
                )
            }

        # 채팅 완성
        full_messages = [DOCENT_SYSTEM_MESSAGE] + list(messages)
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=full_messages,
        )
        content = resp.choices[0].message.content
        return {"content": content}

    except Exception as e:
        print(f"[서비스 에러 발생] get_chat_response: {e}")
        return None


def get_identify_response(identify_request: dict):
    """
    이미지(data URL 또는 raw base64)를 받아 문화유산을 식별한다.
    """
    image = identify_request["image"]

    # data URL 이 아닌 raw base64 라면 jpeg data URL 로 감싼다
    if not image.startswith("data:"):
        image = f"data:image/jpeg;base64,{image}"

    try:
        client = _get_client()

        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": IDENTIFY_PROMPT},
                        {"type": "image_url", "image_url": {"url": image}},
                    ],
                }
            ],
        )
        raw = resp.choices[0].message.content or ""

        # 코드 펜스 제거 후 JSON 파싱
        cleaned = re.sub(r"```[a-zA-Z]*\n?", "", raw).strip().rstrip("`").strip()
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            # JSON 블록만 추출 시도
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                data = json.loads(match.group())
            else:
                data = {}

        heritage_id = data.get("heritageId", "unsupported")
        if heritage_id not in ALLOWED_HERITAGE_IDS:
            heritage_id = "unsupported"

        match_score = int(data.get("match", 0))
        ocr_text = str(data.get("ocrText", ""))

        return {"heritageId": heritage_id, "match": match_score, "ocrText": ocr_text}

    except Exception as e:
        print(f"[서비스 에러 발생] get_identify_response: {e}")
        return None


def get_tts_response(tts_request: dict):
    """
    텍스트를 TTS 로 변환하고 base64 인코딩된 오디오 데이터를 반환한다.
    """
    text = tts_request["text"]
    try:
        client = _get_client()
        resp = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text,
        )
        audio_bytes = resp.content
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        return {"audio_data": audio_b64}
    except Exception as e:
        print(f"[서비스 에러 발생] get_tts_response: {e}")
        return None
