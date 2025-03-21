from django.apps import AppConfig


class HifachamaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'HIFACHAMA'
def ready(self):
    import hifachama.signals
