from django.db import models
from .customuser import CustomUser
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField()
    subject = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    recipient_email = models.EmailField()

    def __str__(self):
        return f"Notification for {self.user.username} - {self.subject}"

    def send_email(self):
        send_mail(
            self.subject,
            self.message,
            'noreply@yourdomain.com',
            [self.recipient_email],
            fail_silently=False,
        )

# Notifications for Transactions (Contributions & Withdrawals)
@receiver(post_save, sender='transactions.Contribution')
def send_contribution_notification(sender, instance, created, **kwargs):
    if created:
        message = f"Your contribution of {instance.amount} has been successfully recorded."
        subject = "Contribution Notification"
        notification = Notification.objects.create(
            user=instance.member.user,
            message=message,
            subject=subject,
            recipient_email=instance.member.user.email,
        )
        notification.send_email()

@receiver(post_save, sender='transactions.Withdrawal')
def send_withdrawal_notification(sender, instance, created, **kwargs):
    if created:
        message = f"Your withdrawal of {instance.amount} has been successfully processed."
        subject = "Withdrawal Notification"
        notification = Notification.objects.create(
            user=instance.member.user,
            message=message,
            subject=subject,
            recipient_email=instance.member.user.email,
        )
        notification.send_email()

# Notifications for Loan Approval
@receiver(post_save, sender='transactions.Loan')
def send_loan_approval_notification(sender, instance, created, **kwargs):
    if instance.status == 'approved':
        message = f"Your loan of {instance.amount} has been approved. Please refer to your repayment schedule."
        subject = "Loan Approval Notification"
        notification = Notification.objects.create(
            user=instance.member.user,
            message=message,
            subject=subject,
            recipient_email=instance.member.user.email,
        )
        notification.send_email()

# Notifications for Meetings
@receiver(post_save, sender='chama.Meeting')
def send_meeting_scheduled_notification(sender, instance, created, **kwargs):
    if created:
        message = f"A new meeting titled '{instance.title}' has been scheduled for {instance.date}. Please make sure to attend."
        subject = "Meeting Scheduled Notification"

        # Assuming the meeting is for all members of the chama
        members = instance.chama.members.all()
        for member in members:
            notification = Notification.objects.create(
                user=member.user,
                message=message,
                subject=subject,
                recipient_email=member.user.email,
            )
            notification.send_email()
