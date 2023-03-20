from django.urls import path
from . import views

urlpatterns = [
    path('api/chat/', views.ChatGPT.as_view(), name='chat_gpt'),
    path('api/chats/', views.ChatGPT.as_view(), name='chat_history'),
    path('api/chats/<str:chat_id>/', views.ChatGPT.as_view(), name='chat_messages'),
]
