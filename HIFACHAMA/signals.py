from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Transaction, Loan, Meeting
from HIFACHAMA.utils.emails import send_email_notification

# --- Helper function to send emails ---
def notify_user(subject, message, recipient_email):
    if recipient_email:
        send_email_notification(subject, message, [recipient_email])

@receiver(post_save, sender=Transaction)
def contribution_notification(sender, instance, created, **kwargs):
    if created and instance.transaction_type == 'contribution':
        subject = "New Contribution Received"
        message = (
            f"Hello {instance.member.user.first_name},\n\n"
            f"Your contribution of Ksh {instance.amount} has been successfully received.\n"
            f"Chama: {instance.chama.name}\n"
            f"Date: {instance.date.strftime('%B %d, %Y')}\n\n"
            "Thank you for your support!\n\n"
            "Best regards,\nThe HIFACHAMA Team"
        )
        notify_user(subject, message, instance.member.user.email)

@receiver(post_save, sender=Transaction)
def withdrawal_approval_notification(sender, instance, created, **kwargs):
    if not created and instance.transaction_type == 'withdrawal' and instance.status == 'approved':
        subject = "Withdrawal Approved"
        message = (
            f"Hello {instance.member.user.first_name},\n\n"
            f"Your withdrawal request of Ksh {instance.amount} has been approved.\n"
            f"Chama: {instance.chama.name}\n"
            f"Date of approval: {instance.date.strftime('%B %d, %Y')}\n\n"
            "Please follow the necessary steps for completing the transaction.\n\n"
            "Best regards,\nThe HIFACHAMA Team"
        )
        notify_user(subject, message, instance.member.user.email)

@receiver(post_save, sender=Loan)
def loan_approval_notification(sender, instance, created, **kwargs):
    if not created and instance.status == 'approved':
        subject = "Loan Approved"
        message = (
            f"Hello {instance.member.user.first_name},\n\n"
            f"Your loan request of Ksh {instance.amount} has been approved.\n"
            f"Purpose: {instance.purpose}\n"
            f"Approval Date: {instance.approval_date.strftime('%B %d, %Y')}\n\n"
            "We look forward to supporting your financial goals!\n\n"
            "Best regards,\nThe HIFACHAMA Team"
        )
        notify_user(subject, message, instance.member.user.email)

@receiver(post_save, sender=Meeting)
def meeting_scheduled_notification(sender, instance, created, **kwargs):
    if created:
        subject = "Meeting Scheduled"
        message = (
            f"Hello,\n\n"
            f"A new meeting has been scheduled for {instance.date.strftime('%B %d, %Y')}.\n"
            f"Time: {instance.date}\n"
            f"Location: {instance.location}\n\n"
            "Please check the details and make arrangements to attend.\n\n"
            "Best regards,\nThe HIFACHAMA Team"
        )

        roles = ['chairperson', 'treasurer', 'secretary', 'member']
        emails_to_notify = []

        for role in roles:
            users = instance.chama.users.filter(role=role)
            for user in users:
                emails_to_notify.append(user.email)

        if emails_to_notify:
            send_email_notification(subject, message, emails_to_notify)
