from django.core.mail import send_mail
from django.conf import settings

def send_approval_email(to_email, idea_name, status, approved):
    status_text = "approved" if approved else "disapproved"
    subject = f"Your idea '{idea_name}' has been {status_text}"
    message = f"Hi,\n\nYour idea '{idea_name}' was just {status_text} by the admin.\n\nThanks for contributing!"

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,  # Uses your Gmail from settings.py
        [to_email],                   # ✅ This is the recipient's email
        fail_silently=False
    )
