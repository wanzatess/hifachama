from rest_framework.permissions import BasePermission

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
