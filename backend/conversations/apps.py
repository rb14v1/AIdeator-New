from django.apps import AppConfig
from django.db.utils import OperationalError, ProgrammingError

class ConversationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'conversations'

    def ready(self):
        from .models import ScoringQuestion, ConversationTemplate
        import sys

        # Skip during migration commands
        if 'makemigrations' in sys.argv or 'migrate' in sys.argv:
            return

        try:
            if ScoringQuestion.objects.count() == 0:
                questions = [
                    ScoringQuestion(
                key="I1",
                text="What is the problem or task you'd like AI to help with?",
                phase="Idea Details"
                 ),
                ScoringQuestion(
                 key="I2",
                text="How is this task done today?",
                phase="Idea Details"
                 ),
    ScoringQuestion(
        key="I3",
        text="How often does this task happen?",
        phase="Idea Details",
        options=["Weekly", "Monthly", "Daily", "Occasionally"]
    ),
    ScoringQuestion(
        key="I4",
        text="Who is impacted by this task?",
        phase="Idea Details",
        options=["Me", "My team", "Multiple Teams", "Our customers"]
    ),
    ScoringQuestion(
        key="I5",
        text="How much time do you or others spend on this task in a week?",
        phase="Idea Details",
        options=["<1 hr", "1-5 hr", "5-10 hr", "10+ hr"]
    ),
    ScoringQuestion(
        key="I6",
        text="What would be the benefit of solving this with AI?",
        phase="Idea Details",
        options=[
            "Time savings", "Cost Reduction", "Increased Revenue or sales",
            "Better Decision making", "Improved customer experience"
        ],
    ),
    ScoringQuestion(
        key="I7",
        text="What do you think the size of benefit would be were this automated or improved?",
        phase="Idea Details",
        options=["Low", "Moderate", "High"]
    ),
    ScoringQuestion(
        key="I8",
        text="Can you estimate how valuable the improvement would be?",
        phase="Idea Details",
        options=["Low", "Moderate", "High"]
    ),
    ScoringQuestion(
    key="I9",
    text="Are there digital records or data related to this task?",
    phase="Idea Details",
    options=["Yes", "No", "Not sure"]
),
ScoringQuestion(
    key="I10",
    text="If yes, where is the data stored?",
    phase="Idea Details",
    options=["Excel or spreadsheets", "Internal databases", "Emails or documents", "customer service logs", "Other"]
),
ScoringQuestion(
    key="I11",
    text="What kind of input does the task involve?",
    phase="Idea Details",
    options=["Text", "Numbers or Tables", "Images or videos", "Voice or audio", "Other"]
),
ScoringQuestion(
    key="I12",
    text="Does the task require Human Judgement or Decision making. If so, describe it.",
    phase="Idea Details"
),
ScoringQuestion(
    key="I13",
    text="What is your Idea for how AI could help?",
    phase="Idea Details"
),
ScoringQuestion(
    key="I14",
    text="Have you seen a similar solution else where?",
    phase="Idea Details",
    options=["Yes", "No", "Not sure"]
),
ScoringQuestion(
    key="I15",
    text="Which of our companies strategic objectives does this idea support?",
    phase="Idea Details",
    options=[
        "Increasing operational efficiency", "Increasing revenue",
        "Expanding into new markets", "Supporting sustainability goals"
    ]
),
ScoringQuestion(
    key="I16",
    text="Your name/team?",
    phase="Idea Details"
),
 
ScoringQuestion(
    key="1",
    text="Do we have sufficient high quality data to train, use or validate models",
    phase="problem",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 6, "Partial": 3, "No": -3}
),
ScoringQuestion(
    key="2",
    text="Is the data in an accessible and usable format",
    phase="problem",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 6, "Partial": 3, "No": -3}
),
ScoringQuestion(
    key="3",
    text="Does the current Tech stack/Target Architecture support this AI workload?",
    phase="problem",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 2, "Partial": 1, "No": -1}
),
ScoringQuestion(
    key="4",
    text="What is the level of additional infrastructure and/or services needed to deliver this initiative",
    phase="problem",
    options=["High", "Medium", "Low"],
    weights={"High": -4, "Medium": -2, "Low": 4}
),
ScoringQuestion(
    key="5",
    text="Are there significant resource costs associated with the PoC delivery",
    phase="problem",
    options=["High", "Medium", "Low"],
    weights={"High": -4, "Medium": -2, "Low": 4}
),
ScoringQuestion(
    key="6",
    text="Are there significant resource costs associated with the long term implementation of this initiative",
    phase="problem",
    options=["High", "Medium", "Low"],
    weights={"High": -4, "Medium": -2, "Low": 4}
),
ScoringQuestion(
    key="9",
    text="What level of effort is required from the business to test if the outputs are valid?",
    phase="problem",
    options=["High", "Medium", "Low"],
    weights={"High": -2, "Medium": -1, "Low": 2}
),
ScoringQuestion(
    key="10",
    text="To what extent will Tinkering (Iterative testing & Training) be required?",
    phase="problem",
    options=["High", "Medium", "Low"],
    weights={"High": -2, "Medium": -1, "Low": 6}
),
ScoringQuestion(
    key="7",
    text="Can the proposed solution scale to meet business needs as they grow?",
    phase="problem",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 2, "Partial": 1, "No": -1}  # 'Res' normalized to 'Yes'
),
ScoringQuestion(
    key="8",
    text="Can the proposed AI solution integrate with existing Systems?",
    phase="problem",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 2, "Partial": 1, "No": -1}
),

ScoringQuestion(
    key="B1",
    text="Does this AI initiative support the business objectives of the organisation, team or business unit deploying it?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 6, "Partial": 3, "No": -3}
),
ScoringQuestion(
    key="B2",
    text="Does this AI initiative serve senior stakeholder support?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 4, "Partial": 2, "No": -2}
),
ScoringQuestion(
    key="B3",
    text="Does this AI initiative enhance the support of the end users that will ultimately use it?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 4, "Partial": 2, "No": -2}
),
ScoringQuestion(
    key="B4",
    text="Does this AI initiative enhance customer (or employee) user experience or satisfaction?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 4, "Partial": 2, "No": -2}
),
ScoringQuestion(
    key="B5",
    text="Can this AI initiative provide an advantage to the engine (or reputational advantage) over its competitors?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 4, "Partial": 2, "No": -2}
),
ScoringQuestion(
    key="B7",
    text="Will this AI initiative rapidly deliver tangible benefits?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 4, "Partial": 2, "No": -2}
),
ScoringQuestion(
    key="B8",
    text="Does this AI initiative result in significant cost reduction or revenue growth?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 4, "Partial": 2, "No": -1}
),
ScoringQuestion(
    key="B9",
    text="Will this AI initiative streamline service processes or business metrics?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 4, "Partial": 2, "No": -1}
),
ScoringQuestion(
    key="B10",
    text="Will this AI project improve any specific business metric?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 4, "Partial": 2, "No": -1}
),
ScoringQuestion(
    key="B11",
    text="Does this process integrate with the existing business process that it seeks to enhance or replace?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 4, "Partial": 2, "No": -1}
),
ScoringQuestion(
    key="B12",
    text="Is the end user or staff training required to integrate this AI initiative into existing processes?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 6, "Partial": 3, "No": 0}
),
ScoringQuestion(
    key="B13",
    text="Do the AI initiative have ethical implications or potential biases that will need to be managed?",
    phase="Business",
    options=["Yes", "Partial", "No"],
    weights={"Yes": 6, "Partial": 3, "No": 0}
),
ScoringQuestion(
    key="B14",
    text="To what extent will this positively impact the organisation (High: >100 people, Med: <100 people, Low: <10 people)?",
    phase="Business",
    options=["High", "Medium", "Low"],
    weights={"High": 6, "Medium": 3, "Low": 0}
),
ScoringQuestion(
    key="B6",
    text="What level of risk does this initiative introduce to the business?",
    phase="Business",
    options=["High", "Medium", "Low"],
    weights={"High": 6, "Medium": 3, "Low": 0}
),
ScoringQuestion(
    key="Q1",
    text="What is Your Idea's name?",
    phase="Idea Details",
    options=[]
),

ScoringQuestion(
    key="Q2",
    text="Describe Your Idea",
    phase="Idea Details",
    options=[]
),
                    
                ]
                ScoringQuestion.objects.bulk_create(questions)
                print(f"✅ Inserted {len(questions)} scoring questions")
            template = ConversationTemplate.objects.first()
            expected_keys = [
                "Q1", "Q2",
                "I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8",
                "I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"
            ]
            if not template or template.required_info.get("Idea Details", []) != expected_keys:
                ConversationTemplate.objects.all().delete()
                ConversationTemplate.objects.create(
                    name="Default Template",
                    phases=["Idea Details", "problem", "Business"],
                    required_info={
                        "Idea Details": expected_keys,
                        "problem": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                        "Business": ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14"]
                    },
                    optional_info={}
                )
                print("✅ Auto-seeded complete ConversationTemplate")
                all_keys = ScoringQuestion.objects.values_list("key", flat=True)
                print(f" Total questions: {len(all_keys)}")
                print(" Question keys:", sorted(all_keys))


        except (OperationalError, ProgrammingError):
            pass

            