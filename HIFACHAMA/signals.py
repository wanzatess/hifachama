from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from HIFACHAMA.models.transactions import Transaction, Rotation
from HIFACHAMA.models.notifications import Notification
from HIFACHAMA.models import Loan, Meeting
from HIFACHAMA.models.chama import Chama
from HIFACHAMA.models.chamamember import ChamaMember
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Transaction)
def transaction_notification(sender, instance, created, **kwargs):
    if not isinstance(instance.member, ChamaMember):
        logger.error(f"Transaction {instance.id} has invalid member: {instance.member} (expected ChamaMember)")
        return
    if created and instance.category == 'contribution':
        subject = "Contribution Notification"
        message = (
            f"Hello {instance.member.user.first_name},\n\n"
            f"Your contribution of Ksh {instance.amount} has been successfully received.\n"
            f"Chama: {instance.member.chama.name}\n"
            f"Date: {instance.date.strftime('%B %d, %Y')}\n\n"
            "Thank you for your support!\n\n"
            "Best regards,\nThe HIFACHAMA Team"
        )
        notification = Notification.objects.create(
            user=instance.member.user,
            message=message,
            subject=subject,
            recipient_email=instance.member.user.email,
        )
        notification.send_email()
    elif created and instance.category == 'withdrawal' and instance.status == 'approved':
        subject = "Withdrawal Notification"
        message = (
            f"Hello {instance.member.user.first_name},\n\n"
            f"Your withdrawal of Ksh {instance.amount} has been successfully processed.\n"
            f"Chama: {instance.member.chama.name}\n"
            f"Date: {instance.date.strftime('%B %d, %Y')}\n\n"
            "Best regards,\nThe HIFACHAMA Team"
        )
        notification = Notification.objects.create(
            user=instance.member.user,
            message=message,
            subject=subject,
            recipient_email=instance.member.user.email,
        )
        notification.send_email()

@receiver(pre_save, sender=Transaction)
def withdrawal_approval_notification(sender, instance, **kwargs):
    if instance.pk:
        old_instance = Transaction.objects.get(pk=instance.pk)
        if old_instance.status != 'approved' and instance.status == 'approved' and instance.category == 'withdrawal':
            if not isinstance(instance.member, ChamaMember):
                logger.error(f"Transaction {instance.id} has invalid member: {instance.member} (expected ChamaMember)")
                return
            subject = "Withdrawal Approved"
            message = (
                f"Hello {instance.member.user.first_name},\n\n"
                f"Your withdrawal request of Ksh {instance.amount} has been approved.\n"
                f"Chama: {instance.member.chama.name}\n"
                f"Date of approval: {instance.date.strftime('%B %d, %Y')}\n\n"
                "Please follow the necessary steps for completing the transaction.\n\n"
                "Best regards,\nThe HIFACHAMA Team"
            )
            notification = Notification.objects.create(
                user=instance.member.user,
                message=message,
                subject=subject,
                recipient_email=instance.member.user.email,
            )
            notification.send_email()

@receiver(post_save, sender=Loan)
def loan_approval_notification(sender, instance, created, **kwargs):
    if instance.status == 'approved':
        if not isinstance(instance.member, ChamaMember):
            logger.error(f"Loan {instance.id} has invalid member: {instance.member} (expected ChamaMember)")
            return
        subject = "Loan Approval Notification"
        message = (
            f"Hello {instance.member.user.first_name},\n\n"
            f"Your loan of Ksh {instance.amount} has been approved.\n"
            f"Purpose: {instance.purpose}\n"
            f"Approval Date: {instance.approval_date.strftime('%B %d, %Y') if instance.approval_date else 'N/A'}\n\n"
            "Please refer to your repayment schedule.\n\n"
            "Best regards,\nThe HIFACHAMA Team"
        )
        notification = Notification.objects.create(
            user=instance.member.user,
            message=message,
            subject=subject,
            recipient_email=instance.member.user.email,
        )
        notification.send_email()

@receiver(post_save, sender=Meeting)
def meeting_scheduled_notification(sender, instance, created, **kwargs):
    if created:
        subject = "Meeting Scheduled Notification"
        members = instance.chama.members.all()
        for member in members:
            if not isinstance(member, ChamaMember):
                logger.error(f"ChamaMember {member} is not a ChamaMember instance")
                continue
            message = (
                f"Hello {member.user.first_name},\n\n"
                f"A new meeting titled '{instance.title}' has been scheduled for {instance.date.strftime('%B %d, %Y %I:%M %p')}.\n"
                f"Location: {instance.location or 'Not specified'}\n"
                f"Agenda: {instance.agenda}\n\n"
                "Please make sure to attend.\n\n"
                "Best regards,\nThe HIFACHAMA Team"
            )
            notification = Notification.objects.create(
                user=member.user,
                message=message,
                subject=subject,
                recipient_email=member.user.email,
            )
            notification.send_email()

@receiver(post_save, sender=Rotation)
def rotation_due_notification(sender, instance, created, **kwargs):
    if not created and instance.cycle_date and instance.cycle_date <= timezone.now().date():
        try:
            chama = Chama.objects.get(id=instance.chama_id)
            subject = "Rotation Due Notification"
            members = chama.members.all()
            for member in members:
                if not isinstance(member, ChamaMember):
                    logger.error(f"ChamaMember {member} is not a ChamaMember instance")
                    continue
                message = (
                    f"Hello {member.user.first_name},\n\n"
                    f"The rotation for member ID {instance.member_id} is due on {instance.cycle_date.strftime('%B %d, %Y')}.\n"
                    f"Please ensure your contributions are up to date.\n\n"
                    "Best regards,\nThe HIFACHAMA Team"
                )
                notification = Notification.objects.create(
                    user=member.user,
                    message=message,
                    subject=subject,
                    recipient_email=member.user.email,
                )
                notification.send_email()
        except Chama.DoesNotExist:
            logger.error(f"Chama with id {instance.chama_id} not found for rotation {instance.id}")