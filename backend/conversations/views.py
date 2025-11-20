from django.utils import timezone
from django.utils.timezone import now
from rest_framework.views import APIView
from django.db.models import Count, Avg, Q,Max
from django.db.models import Max
from rest_framework.response import Response
from django.db.models import Case, When, Value, IntegerField
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import ConversationTemplate, ConversationState, ScoringQuestion, CustomUser
from conversations.pagination import StandardResultsPagination
from conversations.utils.email import send_approval_email
from django.views.decorators.csrf import csrf_exempt
from rest_framework import serializers
from datetime import datetime, timedelta
from datetime import timezone as dt_timezone
from .models import Idea
from .serializers import IdeaSerializer
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import EmailTokenObtainPairSerializer
from django.utils.timezone import make_aware
import re
import spacy

# Custom view to obtain JWT token using email-based authentication
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
# Get the currently authenticated user
def get_user_model(request):
    user = request.user
    return Response({
        "email": user.email,
        "is_staff": user.is_staff,
        "id": user.id,
    })

# view To fetch all completed and non-rejected ideas, sorted by score
class AllIdeasView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = ConversationState.objects.filter(is_complete=True, is_rejected=False).order_by('-total_score')

        data = []
        for convo in conversations:
            info = convo.collected_info or {}
            idea_name = info.get("Q1", {}).get("answer", "Untitled")
            idea_description = info.get("Q2", {}).get("answer", "No description")
            user_email = convo.user.email if convo.user else "Unknown"

            data.append({
                "id": convo.id,
                "name": idea_name,
                "description": idea_description,
                "user": user_email
            })

        return Response(data)

# Fetches messages from a specific conversation by ID
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation(request, id):
    try:
        convo = ConversationState.objects.get(pk=id)
        messages = sorted(convo.messages, key=lambda m: m.get("timestamp", ""))
        return Response(messages)
    except ConversationState.DoesNotExist:
        return Response({"error": "Conversation not found"}, status=404)
    except Exception as e:
        print("Conversation fetch error:", e)
        return Response({"error": str(e)}, status=500)

#  API endpoint to fetch all valid ideas submitted by a specific user
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_ideas(request, user_id):
    conversations = ConversationState.objects.filter(
        user__id=user_id,
        is_complete=True,
        is_rejected=False
    ).order_by("-total_score")

    data = [{
        "conversation_id": convo.id,
        "idea_name": extract_idea_title(convo),
        "total_score": convo.total_score,
        "is_approved": convo.is_approved,
        "approved_at": convo.approved_at
    } for convo in conversations]

    return Response(data)

#API endpoint to fetch all ideas in the system
@api_view(['GET'])
def idea_list(request):
    ideas = Idea.objects.all()
    serializer = IdeaSerializer(ideas, many=True)
    return Response(serializer.data)

# Set the integration start date for filtering activity
integration_start = make_aware(datetime(2025, 10, 23))

# Admin-only API view to return daily idea activity over a given range of days
class WeeklyActivityView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        range_param = request.query_params.get("range", "7")  # default to 7 days
        try:
            days = int(range_param)
        except ValueError:
            days = 7

        today = now().date()
        labels = []
        total_counts = []
        approved_counts = []

        for i in range(days):
         day = today - timedelta(days=days - 1 - i)
         label = day.strftime("%a") if days <= 7 else day.strftime("%d %b")
         labels.append(label)
         
         
         # Define start and end of the day in UTC
         day_start = datetime.combine(day, datetime.min.time(), tzinfo=dt_timezone.utc)
         day_end = datetime.combine(day, datetime.max.time(), tzinfo=dt_timezone.utc)
         
          # Count total completed ideas for the day
         total = ConversationState.objects.filter(
         created_at__range=(day_start, day_end),
         created_at__gte=integration_start,
         is_complete=True  
         ).count()
         
         # Count approved ideas for the day
         approved = ConversationState.objects.filter(
         created_at__range=(day_start, day_end),
         created_at__gte=integration_start,
         is_complete=True,
         is_approved=True
         ).count()


         total_counts.append(total)
         approved_counts.append(approved)

        return Response({
            "labels": labels,
            "total_ideas": total_counts,
            "approved_ideas": approved_counts
        })

# Public API view to return the 20 most recently active non-admin users
class RecentUsersView(APIView):
    def get(self, request):
        try:
            users = (
    CustomUser.objects.filter(
        is_staff=False, is_superuser=False
    )
    .annotate(
        last_chat=Max("conversations__created_at", filter=Q(conversations__is_complete=True))
    )
    .filter(last_chat__isnull=False)  # Only users with complete conversations
    .order_by("-last_chat")[:20]
)

            data = [
                {
                    "id": user.id,
                    "name": user.get_display_name() if hasattr(user, "get_display_name") else user.email,
                    "email": user.email,
                    "last_activity": user.last_chat.isoformat() if user.last_chat else None
                }
                for user in users
            ]
            return Response(data, status=200)
        except Exception as e:
            print("Error in RecentUsersView:", str(e))
            return Response({"error": "Internal server error"}, status=500)


# View to rank users based on average score of their completed ideas
class UserRankingsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            users = CustomUser.objects.annotate(
            ideas_count=Count("conversations", filter=Q(conversations__is_complete=True)),
            score=Avg("conversations__total_score", filter=Q(conversations__is_complete=True))
            ).filter(ideas__gt=0).order_by("-score")[:20]
            data = []
            for idx, user in enumerate(users, start=1):
                data.append({
                    "rank": idx,
                    "user": getattr(user, "get_display_name", lambda: user.email)(),
                    "ideas": user.ideas,
                    "score": round(user.score or 0, 2)
                })

            return Response(data, status=200)
        except Exception as e:
            print("Error in UserRankingsView:", str(e))
            return Response({"error": "Internal server error"}, status=500)


# View to return total and approved idea counts for dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_stats(request):
    total = ConversationState.objects.filter(is_complete=True).count()
    approved = ConversationState.objects.filter(is_complete=True, is_approved=True).count()
    return Response({
        "total_ideas": total,
        "approved_ideas": approved
    })

# View to list all users (admin-only)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    if not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=403)

    User = get_user_model()
    users = User.objects.all().values('id', 'username', 'email', 'is_staff')
    return Response(list(users))

# View to approve a conversation and send notification email
class ApproveConversationView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        try:
            convo = ConversationState.objects.get(pk=pk)

            if not convo.user or not convo.user.email:
                return Response({"error": "User or email not found."}, status=status.HTTP_400_BAD_REQUEST)

            convo.is_approved = True
            convo.approved_at = timezone.now()
            convo.save()

            user_email = convo.user.email
            idea_name = ""
            if convo.collected_info and isinstance(convo.collected_info, dict):
                idea_name = convo.collected_info.get("Idea", {}).get("answer", "")

            try:
                send_approval_email(
                    to_email=user_email,
                    idea_name=idea_name,
                    status="approved",
                    approved=True
                )
            except Exception as e:
                print(f"Email sending failed: {str(e)}")

            return Response({"message": f"Idea '{idea_name}' approved and email sent to {user_email}."}, status=status.HTTP_200_OK)

        except ConversationState.DoesNotExist:
            return Response({"error": "Idea not found."}, status=status.HTTP_404_NOT_FOUND)

# View to disapprove a conversation and send notification email
class DisapproveIdeaView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        try:
            convo = ConversationState.objects.get(pk=pk)

            if not convo.user or not convo.user.email:
                return Response({"error": "User or email not found."}, status=status.HTTP_400_BAD_REQUEST)

            convo.is_approved = False
            convo.approved_at = None
            convo.is_rejected = True
            convo.save()

            user_email = convo.user.email
            idea_name = ""
            if convo.collected_info and isinstance(convo.collected_info, dict):
                idea_name = convo.collected_info.get("Idea", {}).get("answer", "")

            try:
                send_approval_email(
                    to_email=user_email,
                    idea_name=idea_name,
                    status="disapproved",
                    approved=False
                )
            except Exception as e:
                print(f"Email sending failed: {str(e)}")

            return Response({"message": f"Idea '{idea_name}' disapproved and email sent to {user_email}."}, status=status.HTTP_200_OK)

        except ConversationState.DoesNotExist:
            return Response({"error": "Idea not found."}, status=status.HTTP_404_NOT_FOUND)

# Helper function to extract idea title from conversation info
def extract_idea_title(convo):
    if convo.collected_info and isinstance(convo.collected_info, dict):
        return convo.collected_info.get("Q1", {}).get("answer", "Untitled Idea")
    return "Untitled Idea"

# View to rank conversations by approval status and score
class RankedConversationsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        conversations = ConversationState.objects.filter(is_complete=True, is_rejected=False).annotate(
        needs_action=Case(
            When(is_approved__isnull=True, then=Value(1)),
            default=Value(0),
            output_field=IntegerField()
        )
    ).order_by("-needs_action", "-total_score")
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(conversations, request)

        data = []
        for convo in page:
            
            user_email = None
            try:
                user_email = convo.user.email
            except Exception:
                user_email = None

            approved_at = getattr(convo, "approved_at", None)
            

            data.append({
    "conversation_id": convo.id,
    "idea_name": extract_idea_title(convo),
    "priority": convo.priority,
    "total_score": convo.total_score,
    "problem_score": convo.problem_score,
    "business_score": convo.business_score,
    "is_approved": convo.is_approved,
    "is_complete": convo.is_complete,
    "user": {
        "email": user_email
    },
    "approved_at": approved_at
})
        return paginator.get_paginated_response(data)

# View to list prioritized conversations (non-empty priority), sorted by score
class PrioritizedConversationListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        conversations = ConversationState.objects.filter(
            is_complete=True
        ).exclude(priority="").order_by("-total_score")

        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(conversations, request)

        data = [
            {
                "conversation_id": convo.id,
                "idea_name": convo.collected_info.get("Idea", {}).get("answer", ""),
                "priority": convo.priority,
                "total_score": convo.total_score,
                "problem_score": convo.problem_score,
                "business_score": convo.business_score,
                "is_approved": convo.is_approved,
                "is_complete": convo.is_complete
            }
            for convo in page
        ]

        return paginator.get_paginated_response(data)
    
    
# Utility to calculate total score
def calculate_phase_score(collected_info, required_keys):
    return sum(
        v["score"]
        for k, v in collected_info.items()
        if k in required_keys and isinstance(v, dict) and "score" in v
    )

def get_priority_label(total_score):
    if total_score >= 80:
        return "High"
    elif total_score >= 50:
        return "Medium"
    else:
        return "Low"
    
# View to start a new conversation for the authenticated user
class StartConversationView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Request headers:", request.headers)
        print("Authenticated user:", request.user)
        print("Is authenticated:", request.user.is_authenticated)

        template = ConversationTemplate.objects.first()
        if not template:
            return Response({"error": "No template found"}, status=404)

        user = request.user

        state = ConversationState.objects.create(
            template=template,
            current_phase="greeting",
            collected_info={},
            is_complete=False,
            user=user
        )

        first_key = template.required_info.get("Idea Details", [])[0]
        question_obj = ScoringQuestion.objects.filter(key=first_key).first()

        return Response({
            "message": "Hi there! I'm excited to hear your idea. Please share it to get started.",
            "conversation_id": state.id,
            "next_key": first_key,
            "ai_response": question_obj.text if question_obj else f"Please describe: {first_key}",
            "options": question_obj.options if question_obj else None
        })
    

nlp = spacy.load("en_core_web_md")

def split_camel_case(text):
    return re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', text)

 #Function to identify gibberish responses
def is_gibberish(text):
    text = split_camel_case(text.strip())
    if len(text) < 2 or not any(c.isalpha() for c in text):
        return True

    doc = nlp(text)

    
    meaningful_tokens = [t for t in doc if t.is_alpha and t.has_vector and not t.is_oov]

    return len(meaningful_tokens) == 0

# Handles user responses during a conversation and progresses through phases/questions
class RespondToConversationView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        conversation_id = request.data.get("conversation_id")
        user_input = request.data.get("user_input")
        next_key = request.data.get("next_key")

        try:
            state = ConversationState.objects.get(id=conversation_id)
            if state.user != request.user:
                return Response({"error": "Unauthorized access"}, status=status.HTTP_403_FORBIDDEN)
            template = state.template
        except ConversationState.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        if not state.collected_info:
            state.collected_info = {}

        collected = state.collected_info

        if state.current_phase == "Greeting":
            collected["Idea"] = {"answer": user_input, "score": 0}
            state.collected_info = collected
            state.current_phase = "Idea Details"

            first_key = template.required_info.get("Idea Details", [])[0]
            state.current_key = first_key
            state.save()

            question = ScoringQuestion.objects.filter(key=first_key).first()
            return Response({
                "ai_response": question.text if question else f"Please describe: {first_key}",
                "next_key": first_key,
                "options": question.options if question and question.options else []
            })


        if user_input and next_key:
            question = ScoringQuestion.objects.filter(key=next_key).first()
            is_text_input = not question.options if question else True

            if is_text_input and is_gibberish(user_input):
                return Response({
                    "conversation_id": state.id,
                    "ai_response": "Hmm, I couldn't understand that. Could you please rephrase your answer?",
                    "next_key": next_key,
                    "options": question.options if question and question.options else []
                })

            score = question.weights.get(user_input, 0) if question and isinstance(question.weights, dict) else None

            collected[next_key] = {
                "answer": user_input,
                "score": score,
                "timestamp": timezone.now().isoformat()
            }

            state.collected_info = collected

            if state.messages is None:
                state.messages = []

            state.messages.append({
                "sender": "bot",
                "text": question.text if question else f"Please describe: {next_key}",
                "timestamp": timezone.now().isoformat()
            })

            state.messages.append({
                "sender": "user",
                "text": user_input,
                "timestamp": timezone.now().isoformat()
            })

            state.save()

        required_keys = template.required_info.get(state.current_phase, [])
        unanswered = [k for k in required_keys if not collected.get(k) or not str(collected[k].get("answer", "")).strip()]

        if unanswered:
            next_key = unanswered[0]
            state.current_key = next_key
            state.save()

            question = ScoringQuestion.objects.filter(key=next_key).first()
            return Response({
                "ai_response": question.text if question else f"Please describe: {next_key}",
                "next_key": next_key,
                "options": question.options if question and question.options else []
            })

        phases = template.phases
        current_index = phases.index(state.current_phase) if state.current_phase in phases else -1

        if current_index + 1 < len(phases):
            next_phase = phases[current_index + 1]
            state.current_phase = next_phase

            next_keys = template.required_info.get(next_phase, [])
            for key in next_keys:
                answer = collected.get(key, {}).get("answer")
                if not answer or not str(answer).strip():
                    state.current_key = key
                    state.save()

                    question = ScoringQuestion.objects.filter(key=key).first()
                    return Response({
                        "ai_response": question.text if question else f"Please describe: {key}",
                        "next_key": key,
                        "options": question.options if question and question.options else []
                    })

       
        for phase in phases[current_index:]:
            keys = template.required_info.get(phase, [])
            for key in keys:
                answer = collected.get(key, {}).get("answer")
                if not answer or not str(answer).strip():
                    state.current_phase = phase
                    state.current_key = key
                    state.save()

                    question = ScoringQuestion.objects.filter(key=key).first()
                    return Response({
                        "ai_response": question.text if question else f"Please describe: {key}",
                        "next_key": key,
                        "options": question.options if question and question.options else []
                    })

       
        state.is_complete = True

        problem_keys = template.required_info.get("Problem", [])
        business_keys = template.required_info.get("Business", [])

        problem_score = calculate_phase_score(collected, problem_keys)
        business_score = calculate_phase_score(collected, business_keys)
        total_score = problem_score + business_score
        priority = get_priority_label(total_score)

        state.problem_score = problem_score
        state.business_score = business_score
        state.total_score = total_score
        state.priority = priority
        state.save()

        return Response({
            "ai_response": "✅ Thanks for sharing your idea! Your submission is complete.",
            "is_complete": True
        })

# View to fetch detailed info for a prioritized, completed conversation
class PrioritizedConversationDetailView(APIView):
    def get(self, request, conversation_id):
        try:
            convo = ConversationState.objects.get(id=conversation_id, is_complete=True)
        except ConversationState.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        idea_name = convo.collected_info.get("Idea", {}).get("answer", "")
        answers = {
            key: {
                "answer": val.get("answer", ""),
                "score": val.get("score", 0)
            }
            for key, val in convo.collected_info.items()
            if key != "Idea"
        }

        return Response({
            "conversation_id": convo.id,
            "idea_name": idea_name,
            "priority": convo.priority,
            "total_score": convo.total_score,
            "problem_score": convo.problem_score,
            "business_score": convo.business_score,
            "answers": answers
        })


