from django.db import models

from .household import Household


class ExpenseCategory(models.Model):
    household = models.ForeignKey(Household, on_delete=models.CASCADE,
                                  related_name='expense_categories')
    name = models.CharField(max_length=50)
    icon = models.CharField(max_length=4)  # Unicode emoji support
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('household', 'name')
        verbose_name_plural = 'Expense Categories'

    def __str__(self):
        return f'{self.icon} {self.name} ({self.household.name})'
