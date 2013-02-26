from django.contrib import admin
from sorl.thumbnail.admin import AdminImageMixin

from .models import Picture, User


class PictureAdmin(AdminImageMixin, admin.ModelAdmin):
    list_display = ('is_active', 'image_file')
    list_display_links = ('image_file',)
    list_editable = ('is_active',)
    list_filter = ('created', 'modified', 'is_active')
    change_list_filter_template = 'admin/filter_listing.html'
    date_hierarchy = 'created'
    fieldsets = (
        ('Administrative', {
            'fields': ('is_active', 'owner')
        }),
        ('Image', {
            'fields': ('image_file',)
        }),
        ('Location', {
            'fields': ('latitude', 'longitude', 'city', 'country',
                       'country_code')
        })
    )

admin.site.register(Picture, PictureAdmin)


class UserAdmin(AdminImageMixin, admin.ModelAdmin):
    list_display = ('is_active', 'username', 'email')
    list_display_links = ('username',)
    list_editable = ('is_active',)
    list_filter = ('is_active', 'date_joined', 'last_login')
    change_list_filter_template = 'admin/filter_listing.html'
    date_hierarchy = 'date_joined'
    search_fields = ['username', 'email']
    fieldsets = (
        ('About', {
            'fields': ('username', 'email', 'first_name', 'last_name')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups',
                       'user_permissions')
        }),
        ('Dates', {
            'fields': ('last_login',)
        })
    )

admin.site.register(User, UserAdmin)
