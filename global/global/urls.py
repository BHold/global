from django.conf import settings
from django.conf.urls import patterns, include, url
from django.contrib import admin

from globe.views import (HomeView, PictureDetail, PictureList, api_root,
                         UserList, UserDetail)

admin.autodiscover()

api_patterns = patterns('',
    url(r'^$', api_root, name='api-root'),
    url(r'^auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^pictures/$', PictureList.as_view(), name="picture-list"),
    url(r'^pictures/(?P<pk>\d+)$', PictureDetail.as_view(), name="picture-detail"),
    url(r'^users/$', UserList.as_view(), name="user-list"),
    url(r'^users/(?P<pk>\d+)$', UserDetail.as_view(), name="user-detail"),
)

urlpatterns = patterns('',
    # Admin
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^grappelli/', include('grappelli.urls')),
    # Media
    (r'media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),
    # Static Media
    (r'static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),

    # API
    url(r'^api/', include(api_patterns)),

    # Main
    url(r'^$', HomeView.as_view(), name="home"),
)
