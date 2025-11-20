from django.contrib import admin
from .models import ConversationTemplate, ConversationState, ScoringQuestion
from .models import CustomUser

# Register custom user model in admin
admin.site.register(CustomUser)

# Admin config for ConversationTemplate model
@admin.register(ConversationTemplate)
class ConversationTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "organization")
    search_fields = ("name",)

# Admin config for ConversationState model
@admin.register(ConversationState)
class ConversationStateAdmin(admin.ModelAdmin):
    list_display = ("template", "current_phase", "is_complete", "total_score", "priority")
    search_fields = ("template__name", "current_phase", "priority")

# Admin config for ScoringQuestion model
@admin.register(ScoringQuestion)
class ScoringQuestionAdmin(admin.ModelAdmin):
    list_display = ("key", "phase", "text")
    search_fields = ("key", "text", "phase")

