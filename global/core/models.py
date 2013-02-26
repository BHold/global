from django.db import models


class CreatedModifiedMixin(models.Model):
    """
    Provides generic created and modified fields.
    """
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ActiveMixin(models.Model):
    """
    Provides a boolean field to determine if an object is live to the world.
    """
    is_active = models.BooleanField(default=True,
               help_text="Controls whether or not object is live to the world")

    class Meta:
        abstract = True


class LocationMixin(models.Model):
    """
    Provides location related fields
    """
    latitude = models.FloatField()
    longitude = models.FloatField()
    city = models.CharField(max_length=40)
    country = models.CharField(max_length=40)
    country_code = models.CharField(max_length=3)

    class Meta:
        abstract = True


class ActiveManager(models.Manager):
    """
    Provides function to generate queryset of all active objects.
    """
    def get_active(self):
        return self.get_query_set().filter(is_active=True)
