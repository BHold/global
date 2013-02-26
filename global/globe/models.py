import re

from django.conf import settings
from django.contrib.auth.models import (AbstractBaseUser, PermissionsMixin,
                                        UserManager)
from django.core import validators
from django.db import models

from sorl.thumbnail import ImageField

from core.models import (CreatedModifiedMixin, ActiveMixin, ActiveManager,
                         LocationMixin)


class ActiveUserManager(UserManager, ActiveManager):
    pass


class Picture(CreatedModifiedMixin, ActiveMixin, LocationMixin):
    image_file = ImageField(upload_to="pics")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL,
                              related_name='pictures')

    objects = ActiveManager()


class User(AbstractBaseUser, PermissionsMixin, ActiveMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True,
        help_text='30 characters or fewer. Letters, numbers and '
                   '-/./_ characters.',
        validators=[
            validators.RegexValidator(re.compile('^[\w-]+$'),
                'Usernames can only contain letters, numbers, and '
                '-/./_ characters.',
                'invalid')
        ])
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_staff = models.BooleanField(default=False,
        help_text='Designates whether the user can log into admin site.')
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = ActiveUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
