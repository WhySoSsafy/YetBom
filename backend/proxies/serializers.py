from rest_framework import serializers


class MessageSerializer(serializers.Serializer):
    role = serializers.CharField()
    content = serializers.JSONField()


class ChatRequestSerializer(serializers.Serializer):
    messages = MessageSerializer(many=True)


class ChatResponseSerializer(serializers.Serializer):
    content = serializers.CharField()


class IdentifyRequestSerializer(serializers.Serializer):
    image = serializers.CharField()


class IdentifyResponseSerializer(serializers.Serializer):
    heritageId = serializers.CharField()
    match = serializers.IntegerField()
    ocrText = serializers.CharField(allow_blank=True)


class GenerateSpeechRequestSerializer(serializers.Serializer):
    text = serializers.CharField()


class GenerateSpeechResponseSerializer(serializers.Serializer):
    audio_data = serializers.CharField()
