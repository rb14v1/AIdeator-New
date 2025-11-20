from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from django.conf import settings

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)  # Explicit for admin routing

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  

    def __str__(self):
        return self.email

class Idea(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    score = models.FloatField(default=0.0)
    accepted = models.BooleanField(default=False)
    created_by = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='ideas')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

#  Organization model
class Organization(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

#  Conversation template
class ConversationTemplate(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    phases = models.JSONField()
    required_info = models.JSONField()
    optional_info = models.JSONField(blank=True, null=True)

    def __str__(self):
        return self.name

#  Conversation state
class ConversationState(models.Model):
    template = models.ForeignKey(ConversationTemplate, on_delete=models.CASCADE, null=True, blank=True)
    is_rejected = models.BooleanField(default=False)
    current_phase = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    collected_info = models.JSONField(default=dict)
    current_key = models.CharField(max_length=100, blank=True, null=True)  
    is_complete = models.BooleanField(default=False)
    problem_score = models.IntegerField(default=0)
    business_score = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    priority = models.CharField(max_length=20, blank=True)
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    messages = models.JSONField(default=list)  # stores full chat flow
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conversations")

    def __str__(self):
        return f"State for {self.template.name} - Phase: {self.current_phase}"

#  Scoring questions
class ScoringQuestion(models.Model):
    key = models.CharField(max_length=100, unique=True)
    text = models.TextField()
    phase = models.CharField(max_length=50)
    options = models.JSONField(blank=True, null=True, default=list)
    weights = models.JSONField(blank=True, null=True, default=dict)

    def __str__(self):
        return f"{self.phase} - {self.text}"



