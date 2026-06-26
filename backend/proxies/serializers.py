from rest_framework import serializers


class MessageSerializer(serializers.Serializer):
    role = serializers.CharField()
    content = serializers.JSONField()


class PromptRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField()


class ScoreResponseSerializer(serializers.Serializer):
    score = serializers.IntegerField()
    reason = serializers.CharField()


class ChatRequestSerializer(serializers.Serializer):
    messages = MessageSerializer(many=True)


class ChatResponseSerializer(serializers.Serializer):
    content = serializers.CharField()


class ChatGuardrailRequestSerializer(PromptRequestSerializer):
    pass


class ChatGuardrailResponseSerializer(serializers.Serializer):
    is_appropriate = serializers.BooleanField()


class ChatScoreRequestSerializer(serializers.Serializer):
    messages = MessageSerializer(many=True)
    answer = serializers.CharField()


class ChatScoreResponseSerializer(ScoreResponseSerializer):
    pass


class ImageGenerationRequestSerializer(PromptRequestSerializer):
    pass


class ImageGenerationResponseSerializer(serializers.Serializer):
    url = serializers.CharField()


class ImageScoreRequestForImageURLSerializer(serializers.Serializer):
    question = serializers.CharField()
    image_url = serializers.CharField()


class ImageScoreResponseForImageURLSerializer(ScoreResponseSerializer):
    pass


class DecideRouteRequestSerializer(PromptRequestSerializer):
    pass


class DecideRouteResponseSerializer(serializers.Serializer):
    route = serializers.CharField()


class GenerateSpeechRequestSerializer(serializers.Serializer):
    text = serializers.CharField()


class GenerateSpeechResponseSerializer(serializers.Serializer):
    audio_data = serializers.CharField()
