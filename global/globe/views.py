from django.views.generic import TemplateView

from rest_framework.decorators import api_view
from rest_framework.generics import (RetrieveUpdateDestroyAPIView,
                                     ListCreateAPIView, ListAPIView,
                                     RetrieveAPIView)
from rest_framework.response import Response
from rest_framework.reverse import reverse

from .models import Picture, User
from .serializers import PictureSerializer, UserSerializer


class HomeView(TemplateView):
    """
    Returns initial HTML file that will load JS frontend.
    """
    template_name = "base.html"


@api_view(('GET',))
def api_root(request, format=None):
    """
    Offers navigation hints/links to API users.
    """
    return Response({
        'pictures': reverse('picture-list', request=request, format=format),
        'users': reverse('user-list', request=request, format=format),
    })


class PictureList(ListCreateAPIView):
    """
    Base API endpoint for Pictures.

    Provides HEAD, GET, OPTIONS, and POST.
    """
    queryset = Picture.objects.get_active()
    serializer_class = PictureSerializer

    def pre_save(self, obj):
        obj.owner = self.request.user


class PictureDetail(RetrieveUpdateDestroyAPIView):
    """
    Details of a Picture.

    Provides HEAD, GET, PUT, OPTIONS, DELETE.
    """
    queryset = Picture.objects.get_active()
    serializer_class = PictureSerializer

    def pre_save(self, obj):
        obj.owner = self.request.user


class UserList(ListAPIView):
    """
    Base API endpoint for Users.

    Provides HEAD, GET, OPTIONS.
    """
    model = User
    serializer_class = UserSerializer


class UserDetail(RetrieveAPIView):
    """
    Details of a User.

    Provides HEAD, GET, OPTIONS.
    """
    model = User
    serializer_class = UserSerializer
