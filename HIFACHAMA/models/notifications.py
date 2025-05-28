from django.db import models
from django.core.mail import send_mail
from .customuser import CustomUser

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField()
    subject = models.CharField(max_length=255, default="No Subject")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    recipient_email = models.EmailField(default='default@example.com')

    def __str__(self):
        return f"Notification for {self.user.username} - {self.subject}"

    def send_email(self):
        send_mail(
            self.subject,
            self.message,
            'hifachama@gmail.com',
            [self.recipient_email],
            fail_silently=False,
        )