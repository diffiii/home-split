from django.db import models

from .user import User
from .household import Household


class Expense(models.Model):
    household = models.ForeignKey(Household, on_delete=models.CASCADE,
                                  related_name='expenses')
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=300, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    author = models.ForeignKey(User, on_delete=models.CASCADE,
                               related_name='created_expenses')
    payer = models.ForeignKey(User, on_delete=models.CASCADE,
                              related_name='paid_expenses')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f'{self.name} in {self.household.name} '
            f'(id: {self.id}, amount: {self.amount})'  # type: ignore
        )
