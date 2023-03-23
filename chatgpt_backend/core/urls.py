from django.urls import path
from . import views

urlpatterns = [
    path('chats/', views.ChatGPT.as_view(), name='chat_history'),
    path('chats/<str:chat_id>/', views.ChatGPT.as_view(), name='chat_messages'),
]
