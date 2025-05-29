from django.db import models

from .user import User
from .household import Household


class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    household = models.ForeignKey(Household, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'household')

    def __str__(self):
        return (
            f'{self.user.email} in {self.household.name} '
            f'(id: {self.user.id})'  # type: ignore
        )
