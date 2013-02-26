from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        HyperlinkedRelatedField)

from .models import Picture, User


class PictureSerializer(HyperlinkedModelSerializer):
    owner = HyperlinkedRelatedField(view_name='user-detail', read_only=True)

    class Meta:
        model = Picture
        fields = ('url', 'image_file', 'owner', 'latitude', 'longitude',
                  'country', 'city', 'country_code')


class UserSerializer(HyperlinkedModelSerializer):
    pictures = HyperlinkedRelatedField(many=True, view_name='picture-detail')

    class Meta:
        model = User
        fields = ('url', 'username', 'pictures')
