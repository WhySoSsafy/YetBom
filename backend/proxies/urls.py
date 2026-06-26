from django.urls import path
from . import views

urlpatterns = [
    path('chat/completions/', views.chat_response, name="chat_response"),
    path('chat/guardrail/', views.chat_guardrail_response, name="chat_guardrail_response"),
    path('chat/score/', views.chat_score_response, name="chat_score_response"),
    path('images/generations/', views.image_generation_response, name="image_generation_response"),
    path('images/score/url/', views.image_score_response_for_url, name="image_score_response_for_url"),
    path('decide-route/', views.decide_route_response, name="decide_route_response"),
    path('generate-speech/', views.tts_response, name="tts_response"),
]
