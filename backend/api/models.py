from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    username = models.CharField(max_length=100, unique=False)
    email = models.EmailField(max_length=254, unique=True)
    profile_image = models.ImageField(
        upload_to='profile_images/',
        blank=True,
        null=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f'{self.email} ({self.id})'


class Household(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    members = models.ManyToManyField(
        User, through='Membership', related_name='households'
    )

    class Meta:
        unique_together = ('name', 'owner')

    def __str__(self):
        return f'{self.name} ({self.id})'  # type: ignore


class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    household = models.ForeignKey(Household, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'household')

    def __str__(self):
        return (
            f'{self.user.email} in '  # type: ignore
            f'{self.household.name} ({self.id})'  # type: ignore
        )
