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
    template_name = "base.html"


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'pictures': reverse('picture-list', request=request, format=format),
        'users': reverse('user-list', request=request, format=format),
    })


class PictureList(ListCreateAPIView):
    queryset = Picture.objects.get_active()
    serializer_class = PictureSerializer

    def pre_save(self, obj):
        obj.owner = self.request.user


class PictureDetail(RetrieveUpdateDestroyAPIView):
    queryset = Picture.objects.get_active()
    serializer_class = PictureSerializer

    def pre_save(self, obj):
        obj.owner = self.request.user


class UserList(ListAPIView):
    model = User
    serializer_class = UserSerializer


class UserDetail(RetrieveAPIView):
    model = User
    serializer_class = UserSerializer
