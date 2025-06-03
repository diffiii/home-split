from django.db import models

from .expense import Expense


class ExpenseSplit(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE,
                                related_name='splits')
    user = models.ForeignKey('User', on_delete=models.CASCADE,
                             related_name='expense_splits')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_settled = models.BooleanField(default=False)

    class Meta:
        unique_together = ('expense', 'user')

    def __str__(self):
        return (
            f'Split of {self.amount} for {self.user.username} '
            f'in {self.expense.name} (id: {self.id})'  # type: ignore
        )
