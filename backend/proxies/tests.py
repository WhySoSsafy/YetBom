"""
Mocked tests for the collapsed Django + OpenAI backend.
No real API calls are made — all OpenAI interactions are patched.
"""
import base64
import json
from unittest.mock import MagicMock, patch

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient


# ---------------------------------------------------------------------------
# Helpers to build realistic mock objects
# ---------------------------------------------------------------------------

def _make_chat_response(content: str):
    """Return a mock that looks like openai.types.chat.ChatCompletion."""
    msg = MagicMock()
    msg.content = content
    choice = MagicMock()
    choice.message = msg
    resp = MagicMock()
    resp.choices = [choice]
    return resp


def _make_moderation_response(flagged: bool):
    """Return a mock that looks like openai.types.ModerationCreateResponse."""
    result = MagicMock()
    result.flagged = flagged
    resp = MagicMock()
    resp.results = [result]
    return resp


def _make_tts_response(audio_bytes: bytes = b"fake-audio"):
    resp = MagicMock()
    resp.content = audio_bytes
    return resp


# ---------------------------------------------------------------------------
# Chat endpoint tests
# ---------------------------------------------------------------------------

class ChatResponseTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/chat/completions/"

    @patch("proxies.services._get_client")
    def test_chat_returns_content(self, mock_get_client):
        """Normal chat flow: moderation passes, model returns content."""
        openai_client = MagicMock()
        mock_get_client.return_value = openai_client

        openai_client.moderations.create.return_value = _make_moderation_response(False)
        openai_client.chat.completions.create.return_value = _make_chat_response(
            "숭례문은 서울 중구에 위치한 조선시대 성문입니다."
        )

        payload = {"messages": [{"role": "user", "content": "숭례문이 뭐예요?"}]}
        resp = self.client.post(self.url, payload, format="json")

        self.assertEqual(resp.status_code, 200)
        self.assertIn("content", resp.json())
        self.assertIn("숭례문", resp.json()["content"])

    @patch("proxies.services._get_client")
    def test_moderation_flagged_returns_refusal(self, mock_get_client):
        """When moderation flags the input, a polite refusal is returned (HTTP 200)."""
        openai_client = MagicMock()
        mock_get_client.return_value = openai_client

        openai_client.moderations.create.return_value = _make_moderation_response(True)

        payload = {"messages": [{"role": "user", "content": "harmful content here"}]}
        resp = self.client.post(self.url, payload, format="json")

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("content", data)
        # chat.completions.create must NOT have been called
        openai_client.chat.completions.create.assert_not_called()

    def test_chat_empty_body_returns_400(self):
        """Empty body should fail serializer validation → 400."""
        resp = self.client.post(self.url, {}, format="json")
        self.assertEqual(resp.status_code, 400)


# ---------------------------------------------------------------------------
# Identify endpoint tests
# ---------------------------------------------------------------------------

class IdentifyResponseTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/identify/"

    @patch("proxies.services._get_client")
    def test_identify_parses_valid_json(self, mock_get_client):
        """Valid JSON response from model is parsed and returned correctly."""
        openai_client = MagicMock()
        mock_get_client.return_value = openai_client

        model_json = json.dumps({
            "heritageId": "sungnyemun",
            "match": 92,
            "ocrText": "숭례문",
        })
        openai_client.chat.completions.create.return_value = _make_chat_response(model_json)

        payload = {"image": "data:image/jpeg;base64,/9j/fakeimagebytes=="}
        resp = self.client.post(self.url, payload, format="json")

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["heritageId"], "sungnyemun")
        self.assertEqual(data["match"], 92)
        self.assertEqual(data["ocrText"], "숭례문")

    @patch("proxies.services._get_client")
    def test_identify_unknown_heritage_becomes_unsupported(self, mock_get_client):
        """Unknown heritageId from model → forced to 'unsupported'."""
        openai_client = MagicMock()
        mock_get_client.return_value = openai_client

        model_json = json.dumps({
            "heritageId": "totally-unknown-site",
            "match": 10,
            "ocrText": "",
        })
        openai_client.chat.completions.create.return_value = _make_chat_response(model_json)

        payload = {"image": "data:image/jpeg;base64,/9j/fakeimagebytes=="}
        resp = self.client.post(self.url, payload, format="json")

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["heritageId"], "unsupported")

    @patch("proxies.services._get_client")
    def test_identify_junk_response_becomes_unsupported(self, mock_get_client):
        """Non-JSON / junk model response defaults to 'unsupported' without error."""
        openai_client = MagicMock()
        mock_get_client.return_value = openai_client

        openai_client.chat.completions.create.return_value = _make_chat_response(
            "I cannot identify this image."
        )

        payload = {"image": "data:image/png;base64,iVBORfakedata=="}
        resp = self.client.post(self.url, payload, format="json")

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["heritageId"], "unsupported")

    @patch("proxies.services._get_client")
    def test_identify_code_fence_stripped(self, mock_get_client):
        """Model wrapping JSON in ```json ... ``` is handled correctly."""
        openai_client = MagicMock()
        mock_get_client.return_value = openai_client

        fenced = "```json\n{\"heritageId\": \"gyeongbok\", \"match\": 85, \"ocrText\": \"경복궁\"}\n```"
        openai_client.chat.completions.create.return_value = _make_chat_response(fenced)

        payload = {"image": "data:image/jpeg;base64,/9j/fakeimagebytes=="}
        resp = self.client.post(self.url, payload, format="json")

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["heritageId"], "gyeongbok")
        self.assertEqual(data["match"], 85)

    def test_identify_empty_body_returns_400(self):
        """Empty body should fail serializer validation → 400."""
        resp = self.client.post(self.url, {}, format="json")
        self.assertEqual(resp.status_code, 400)

    @patch("proxies.services._get_client")
    def test_identify_raw_base64_wrapped_in_data_url(self, mock_get_client):
        """Raw base64 (no data: prefix) is auto-wrapped before sending to OpenAI."""
        openai_client = MagicMock()
        mock_get_client.return_value = openai_client

        model_json = json.dumps({"heritageId": "cheomseongdae", "match": 70, "ocrText": ""})
        openai_client.chat.completions.create.return_value = _make_chat_response(model_json)

        # Raw base64, no 'data:' prefix
        payload = {"image": "/9j/rawbase64data=="}
        resp = self.client.post(self.url, payload, format="json")

        self.assertEqual(resp.status_code, 200)
        # Verify the image_url sent to OpenAI starts with 'data:'
        call_kwargs = openai_client.chat.completions.create.call_args
        messages = call_kwargs[1]["messages"] if call_kwargs[1] else call_kwargs[0][0]
        # Find the image_url content block
        content_blocks = messages[0]["content"]
        image_block = next(b for b in content_blocks if b["type"] == "image_url")
        self.assertTrue(image_block["image_url"]["url"].startswith("data:"))


# ---------------------------------------------------------------------------
# TTS endpoint tests
# ---------------------------------------------------------------------------

class TtsResponseTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/generate-speech/"

    @patch("proxies.services._get_client")
    def test_tts_returns_base64_audio(self, mock_get_client):
        """TTS service returns base64-encoded audio_data."""
        openai_client = MagicMock()
        mock_get_client.return_value = openai_client

        fake_audio = b"\x00\x01\x02\x03fake-audio-bytes"
        openai_client.audio.speech.create.return_value = _make_tts_response(fake_audio)

        payload = {"text": "경복궁에 오신 것을 환영합니다."}
        resp = self.client.post(self.url, payload, format="json")

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("audio_data", data)
        # Verify it decodes back to the original bytes
        decoded = base64.b64decode(data["audio_data"])
        self.assertEqual(decoded, fake_audio)

    def test_tts_empty_body_returns_400(self):
        """Empty body should fail serializer validation → 400."""
        resp = self.client.post(self.url, {}, format="json")
        self.assertEqual(resp.status_code, 400)
