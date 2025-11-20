from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import ConversationState  

# Serializer for exposing idea-related fields from ConversationState
class IdeaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationState
        fields = ["id", "idea_name", "total_score", "is_approved", "approved_at"]


User = get_user_model()

# Custom JWT serializer that supports email-based login and auto-creates users
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.create_user(
                username=email.split("@")[0],
                email=email,
                password=password,
                is_staff=False
            )

        if user and user.check_password(password):
            attrs["username"] = user.username
            return super().validate(attrs)

        raise serializers.ValidationError("Invalid credentials")



