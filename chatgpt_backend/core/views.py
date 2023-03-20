from rest_framework.views import APIView
from rest_framework.response import Response
import openai
import os

from .models import Message
from .serializers import (
    ChatMessageSerializer,
    ChatResponseSerializer,
    MessageSerializer,
)

openai.api_key = os.environ.get("OPENAI_API_KEY")

class ChatGPT(APIView):
    def post(self, request, format=None):
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            request_message = serializer.validated_data['message']

            user_message_obj = Message(content=request_message, is_user=True)
            user_message_obj.save()

            messages = Message.objects.filter().order_by('timestamp')
            message_list = []
            for message in messages:
                role = "user" if message.is_user else "assistant"
                message_list.append({"role": role, "content": message.content})

            message_list.append({"role": "user", "content": request_message})

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=message_list
            )

            ai_message = response.choices[0].message['content'].strip()

            ai_message_obj = Message(content=ai_message, is_user=False)
            ai_message_obj.save()

            response_serializer = ChatResponseSerializer(data={"message": ai_message})
            if response_serializer.is_valid():
                return Response(response_serializer.validated_data)

        return Response(serializer.errors, status=400)

class ChatHistory(APIView):
    def get(self, request, format=None):
        messages = Message.objects.all().order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
