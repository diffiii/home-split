from django.db import models

from .user import User


class Household(models.Model):
    name = models.CharField(max_length=100, unique=False)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE,
                              related_name='owned_households')
    members = models.ManyToManyField(User, through='Membership',
                                     related_name='households')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('name', 'owner')

    def __str__(self):
        return f'{self.name} (id: {self.id})'  # type: ignore
