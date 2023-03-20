from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"

class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField()

class ChatResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
