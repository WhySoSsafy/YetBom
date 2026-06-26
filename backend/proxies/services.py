"""
교육생 구현 영역: MODEL_SERVER_URL( FastAPI 모델 서버 )로 HTTP POST 요청을 보내고
응답을 파싱해 반환하세요. get_chat_response 는 예시로 구현되어 있습니다.
나머지는 None 대신 실제 로직을 구현하세요. (에러 시 None 반환)
"""
import requests
from django.conf import settings

MODEL_SERVER_URL = settings.MODEL_SERVER_URL


def get_chat_response(chat_request):
    """예시: 채팅 요청을 모델 서버 /chat/completions 로 전달하고 content 를 반환합니다."""
    messages = chat_request["messages"]
    payload_data = {"messages": messages}
    try:
        response = requests.post(
            f"{MODEL_SERVER_URL}/chat/completions", json=payload_data
        )
        response.raise_for_status()
        content = response.json()["content"]
        return {"content": content}
    except Exception as e:
        print(f"[서비스 에러 발생] {e}")
        return None


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
