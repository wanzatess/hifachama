from django.db import models
from django.contrib.auth import get_user_model
from .chama import Chama

User = get_user_model()

class ChamaMember(models.Model):
    ROLE_CHOICES = [
        ('Chairperson', 'Chairperson'),
        ('Treasurer', 'Treasurer'),
        ('Secretary', 'Secretary'),
        ('Member', 'Member'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chama_memberships')
    chama = models.ForeignKey(Chama, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Member')
    join_date = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    is_active = models.BooleanField(default=True)


    class Meta:
        unique_together = ('user', 'chama')

    def __str__(self):
        return f"{self.user.username} - {self.chama.name} ({self.role})"
