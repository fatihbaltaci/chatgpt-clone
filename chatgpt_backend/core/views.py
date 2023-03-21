from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import openai
import os

from .models import Chat, Message
from .serializers import (
    ChatMessageSerializer,
    ChatResponseSerializer,
    MessageSerializer,
    ChatSerializer,
)

openai.api_key = os.environ.get("OPENAI_API_KEY")

class ChatGPT(APIView):
    def post(self, request, format=None):
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            request_message = serializer.validated_data.get('message', None)
            chat_id = serializer.validated_data.get('chat_id', None)

            if chat_id:
                chat = Chat.objects.get(id=chat_id)
            else:
                chat = Chat.objects.create()

            if not request_message:
                serializer = ChatSerializer(chat)
                return Response(serializer.data)
            
            user_message_obj = Message(content=request_message, role=Message.RoleChoices.USER, chat=chat)
            user_message_obj.save()

            messages = Message.objects.filter(chat=chat).order_by('timestamp')
            message_list = []
            for message in messages:
                role = message.role
                message_list.append({"role": role, "content": message.content})

            message_list.append({"role": "user", "content": request_message})

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=message_list
            )

            ai_message = response.choices[0].message['content'].strip()

            ai_message_obj = Message(content=ai_message, role=Message.RoleChoices.ASSISTANT, chat=chat)
            ai_message_obj.save()

            response_serializer = ChatResponseSerializer(data={"message": ai_message})
            if response_serializer.is_valid():
                return Response({"message": response_serializer.validated_data["message"], "chat_id": chat.id})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, chat_id=None, format=None):
        if chat_id:
            # GET method for fetching messages in a chat
            chat = Chat.objects.get(pk=chat_id)
            messages = Message.objects.filter(chat=chat).order_by('timestamp')
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)
        else:
            # GET method for fetching all chats
            chats = Chat.objects.all().order_by('-created_at')
            serializer = ChatSerializer(chats, many=True)
            return Response(serializer.data)
