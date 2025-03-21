from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Transaction
from HIFACHAMA.utils.emails import send_email_notification
from HIFACHAMA.utils.notifications import send_push_notification

@receiver(post_save, sender=Transaction)
def contribution_notification(sender, instance, created, **kwargs):
    if created:
        subject = "New Contribution Received"
        message = f"Your contribution of {instance.amount} has been received."
        recipient = [instance.member.user.email]

        send_email_notification(subject, message, recipient)
        
        if instance.member.user:
            print(f"Sending push notification to User ID: {instance.member.user.id}")  # Debugging
            send_push_notification(instance.member.user.id, "Contribution Update", message)
        else:
            print("User ID not found for push notification")  # Debugging


