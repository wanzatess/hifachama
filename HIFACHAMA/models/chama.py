from django.db import models

class Chama(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=50, choices=[
        ('investment', 'Investment'),
        ('merry_go_round', 'Merry-Go-Round'),
        ('hybrid', 'Hybrid'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
