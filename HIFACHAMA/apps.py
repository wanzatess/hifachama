from django.apps import AppConfig

class HifachamaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'HIFACHAMA'

    def ready(self):
        import HIFACHAMA.signals  # Ensure signals are loaded when the app is ready
