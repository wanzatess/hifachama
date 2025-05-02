from django.db import models
from HIFACHAMA.models.customuser import CustomUser

class Chama(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=False, default="No description provided.")
    chama_type = models.CharField(
        max_length=50,
        choices=[
            ('investment', 'Investment'),
            ('merry_go_round', 'Merry-Go-Round'),
            ('hybrid', 'Hybrid'),
        ],
        default='hybrid',  # <-- Add this line
    )

    created_at = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    admin = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='chamas_admin')
    members = models.ManyToManyField(CustomUser, through='ChamaMember', related_name='chamas')

    def __str__(self):
        return self.name
