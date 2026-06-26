"""
Django REST Framework 뷰.
serializer 로 요청을 검증하고 services 함수를 호출해 응답을 반환한다.
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from proxies.serializers import (
    ChatRequestSerializer, ChatResponseSerializer,
    IdentifyRequestSerializer, IdentifyResponseSerializer,
    GenerateSpeechRequestSerializer, GenerateSpeechResponseSerializer,
)
from proxies.services import (
    get_chat_response,
    get_identify_response,
    get_tts_response,
)


@api_view(["POST"])
def chat_response(request):
    """채팅 완성 (moderation 포함)."""
    serializer = ChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    result = get_chat_response(serializer.validated_data)
    if result is None:
        return Response({"detail": "Chat response failed"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(ChatResponseSerializer(result).data, status=status.HTTP_200_OK)


@api_view(["POST"])
def identify_response(request):
    """이미지로 문화유산 식별."""
    serializer = IdentifyRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    result = get_identify_response(serializer.validated_data)
    if result is None:
        return Response({"detail": "Identify failed"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(IdentifyResponseSerializer(result).data, status=status.HTTP_200_OK)


@api_view(["POST"])
def tts_response(request):
    """텍스트를 음성으로 변환."""
    serializer = GenerateSpeechRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    result = get_tts_response(serializer.validated_data)
    if result is None:
        return Response({"detail": "TTS failed"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(GenerateSpeechResponseSerializer(result).data, status=status.HTTP_200_OK)
