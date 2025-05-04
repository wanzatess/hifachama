from django.db import models
from .chama import Chama

class Meeting(models.Model):
    title = models.CharField(max_length=255)
    agenda = models.TextField(default="No agenda provided")
    date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True, null=True)
    chama = models.ForeignKey(Chama, on_delete=models.CASCADE)

    def __str__(self):
        return self.title