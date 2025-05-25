from django.contrib import admin
from django.contrib.auth.models import Group
from .models import User


class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_staff', 'is_active')
    search_fields = ('email', 'username')
    ordering = ('email',)
    list_filter = ('is_staff', 'is_active')


admin.site.register(User, UserAdmin)
admin.site.unregister(Group)
