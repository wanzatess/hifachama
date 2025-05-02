from django.contrib import admin
from .models import ChamaMember

class ChamaMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'chama', 'role', 'join_date', 'is_active')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if request.user.role == 'chairperson':
            return qs.filter(chama__admin=request.user)
        return qs.none()

    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.role == 'chairperson'

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if obj and request.user.role == 'chairperson' and obj.chama.admin == request.user:
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        return self.has_change_permission(request, obj)

admin.site.register(ChamaMember, ChamaMemberAdmin)
