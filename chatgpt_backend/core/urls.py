from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.ChatGPT.as_view(), name='chat_gpt'),
    path('chat_history/', views.ChatHistory.as_view(), name='chat_history'),
]
