from rest_framework.permissions import BasePermission
from .models import Chama, ChamaMember

class IsChairperson(BasePermission):
    """Allows access only to chairperson"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "chairperson"

class IsTreasurer(BasePermission):
    """Allows access only to treasurer"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "treasurer"

class IsSecretary(BasePermission):
    """Allows access only to secretary"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "secretary"

class IsMember(BasePermission):
    """Allows access only to members"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "member"

class IsChamaAdmin(BasePermission):
    """Allows access to chama admin (chairperson)"""
    def has_permission(self, request, view):
        chama_id = view.kwargs.get('chama_id') or request.data.get('chama')
        if not chama_id:
            return False
        return Chama.objects.filter(id=chama_id, admin=request.user).exists()

class IsChamaMember(BasePermission):
    """Allows access to chama members"""
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
    """Allows access to chama treasurer"""
    def has_permission(self, request, view):
        chama_id = view.kwargs.get('chama_id') or request.data.get('chama')
        if not chama_id:
            return False
        return ChamaMember.objects.filter(
            chama_id=chama_id, 
            user=request.user, 
            role='treasurer',
            is_active=True
        ).exists()