from urlparse import urlparse

from django.conf import settings

from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        HyperlinkedRelatedField,
                                        WritableField)

from .models import Picture, User


class StaticDomainAwareField(WritableField):
    """
    Serializer field that handles STATIC_URL issues with file fields.

    When API outputs a file path, it should display the full url.
    However, when user PUT/POSTs a new url, it should be stripped of its
    domain/STATIC_URL before being saved.
    """
    def to_native(self, value):
        path = str(value)
        if path.startswith('/'):
            # To avoid a double slash when adding STATIC_URL
            path = path.replace('/', '', 1)
        return settings.STATIC_URL + path

    def from_native(self, value):
        path = urlparse(value).path
        if path.startswith(settings.STATIC_URL):
            path = path.replace(settings.STATIC_URL, '/')
        return path


class PictureSerializer(HyperlinkedModelSerializer):
    """
    Serializer for Picture model.

    Owner of picture is returned as a link, and the image_file path is
    returned as the full url to the image.
    """
    owner = HyperlinkedRelatedField(view_name='user-detail', read_only=True)
    image_file = StaticDomainAwareField(source='image_file')

    class Meta:
        model = Picture
        fields = ('url', 'image_file', 'owner', 'latitude', 'longitude',
                  'country', 'city', 'country_code')


class UserSerializer(HyperlinkedModelSerializer):
    """
    Serializer for User model which is read only.

    User's pictures are returned as list of links.
    """
    pictures = HyperlinkedRelatedField(many=True, view_name='picture-detail')

    class Meta:
        model = User
        fields = ('url', 'username', 'pictures')
