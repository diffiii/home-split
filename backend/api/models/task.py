from django.db import models

from .user import User
from .household import Household


class Task(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    household = models.ForeignKey(Household, on_delete=models.CASCADE,
                                  related_name='tasks')
    due_date = models.DateTimeField(blank=True, null=True)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE,
                                 related_name='added_tasks')
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f'{self.name} in {self.household.name}'
            f'(id: {self.id}, due: {self.due_date} '  # type: ignore
            f'completed: {self.is_completed})'
        )
