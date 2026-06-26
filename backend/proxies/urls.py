from django.urls import path
from . import views

urlpatterns = [
    path('chat/completions/', views.chat_response, name="chat_response"),
    path('identify/', views.identify_response, name="identify_response"),
    path('generate-speech/', views.tts_response, name="tts_response"),
]
