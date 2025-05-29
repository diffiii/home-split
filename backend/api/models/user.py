from django.contrib.auth.models import AbstractUser
from django.db import models


def user_directory_path(instance, filename):
    return f"profile_pictures/{instance.email}/{filename}"


class User(AbstractUser):
    # Use email as the unique identifier for authentication.
    username = models.CharField(max_length=50, unique=False)
    email = models.EmailField(max_length=254, unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    profile_picture = models.ImageField(
        upload_to=user_directory_path,
        blank=True,
        null=True
    )

    def __str__(self):
        return f'{self.email} (id: {self.id})'  # type: ignore
