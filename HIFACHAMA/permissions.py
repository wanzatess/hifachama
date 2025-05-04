from rest_framework.permissions import BasePermission
from .models import Chama, ChamaMember
from .models.transactions import Rotation
from django.utils import timezone

class IsChairperson(BasePermission):
    """Allows access only to users with Chairperson role"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Chairperson"

class IsTreasurer(BasePermission):
    """Allows access only to users with Treasurer role"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Treasurer"

class IsSecretary(BasePermission):
    """Allows access only to users with Secretary role"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Secretary"

class IsMember(BasePermission):
    """Allows access only to users with Member role"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Member"

class IsChamaAdmin(BasePermission):
    """Allows access to chama admin (chairperson)"""
    def has_permission(self, request, view):
        chama_id = view.kwargs.get('chama_id') or request.data.get('chama')
        if not chama_id:
            return False
        return Chama.objects.filter(id=chama_id, admin=request.user).exists()

class IsChamaMember(BasePermission):
    """Allows access to active chama members"""
    def has_permission(self, request, view):
        chama_id = view.kwargs.get('chama_id') or request.data.get('chama')
        if not chama_id:
            return False
        return ChamaMember.objects.filter(
            chama_id=chama_id, 
            user=request.user, 
            is_active=True
        ).exists()

class IsChamaTreasurer(BasePermission):
    """Allows access to active chama members with Treasurer role"""
    def has_permission(self, request, view):
        chama_id = view.kwargs.get('chama_id') or request.data.get('chama')
        if not chama_id:
            return False
        return ChamaMember.objects.filter(
            chama_id=chama_id, 
            user=request.user, 
            user__role='Treasurer',
            is_active=True
        ).exists()

class IsCurrentRotationMember(BasePermission):
    """Allows access only to the member whose turn it is in the current rotation"""
    def has_permission(self, request, view):
        chama_id = view.kwargs.get('chama_id') or request.data.get('chama')
        if not chama_id:
            return False
        try:
            chama_member = ChamaMember.objects.get(user=request.user, chama_id=chama_id, is_active=True)
            current_date = timezone.now().date()
            rotation = Rotation.objects.filter(
                chama_id=chama_id,
                cycle_date__lte=current_date,
                completed=False
            ).order_by('position').first()
            return rotation and rotation.member_id == chama_member.id
        except ChamaMember.DoesNotExist:
            return False