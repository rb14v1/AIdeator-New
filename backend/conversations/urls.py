from django.urls import path
from .views import (
    StartConversationView,
    RespondToConversationView,
    PrioritizedConversationListView,
    RankedConversationsView,
    PrioritizedConversationDetailView,
    ApproveConversationView,
    DisapproveIdeaView, 
)
from conversations.views import EmailTokenObtainPairView
from . import views
from .views import dashboard_stats,RecentUsersView,UserRankingsView,WeeklyActivityView, AllIdeasView, get_user_model,idea_list

urlpatterns = [
    path("start/", StartConversationView.as_view(), name="start_conversation"),
    path("respond/", RespondToConversationView.as_view(), name="respond_conversation"),
    path("prioritized/", PrioritizedConversationListView.as_view(), name="prioritized_conversations"),
    path("ranked/", RankedConversationsView.as_view(), name="ranked_conversations"),
    path("prioritized/<int:conversation_id>/", PrioritizedConversationDetailView.as_view(), name="prioritized_detail"),
    path("<int:pk>/approve/", ApproveConversationView.as_view()),
    path("<int:pk>/disapprove/", DisapproveIdeaView.as_view(), name="disapprove_idea"),
    path("token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("user/", get_user_model, name="get_user_info"),
    path("dashboard-stats/", dashboard_stats, name="dashboard_stats"),
    path("recent-users/", RecentUsersView.as_view(), name="recent-users"),
    path("user-rankings/", UserRankingsView.as_view(), name="user-rankings"),
    path("weekly-activity/", WeeklyActivityView.as_view(), name="weekly-activity"),
    path('ideas/', idea_list, name='idea-list'),
    path("user-ideas/<int:user_id>/", views.user_ideas, name="user-ideas"),
    path("conversation/<int:id>/", views.get_conversation, name="get-conversation"),
    path('all-ideas', AllIdeasView.as_view(), name='all-ideas'),
]







