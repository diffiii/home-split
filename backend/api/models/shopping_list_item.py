from django.db import models

from .user import User
from .household import Household


class ShoppingListItem(models.Model):
    name = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField(default=1)
    unit = models.CharField(
        max_length=10, blank=True, null=True,
        help_text='Optional unit of measurement (e.g., kg, pcs)'
    )
    household = models.ForeignKey(
        Household, on_delete=models.CASCADE,
        related_name='shopping_list_items'
    )
    is_purchased = models.BooleanField(default=False)
    added_at = models.DateTimeField(auto_now_add=True)
    purchased_at = models.DateTimeField(blank=True, null=True)
    added_by = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='added_shopping_list_items'
    )
    purchased_by = models.ForeignKey(
        User, on_delete=models.CASCADE, blank=True, null=True,
        related_name='purchased_shopping_list_items'
    )

    def __str__(self):
        return (
            f'{self.name} in {self.household.name}'
            f'(id: {self.id}, quantity: {self.quantity}, '  # type: ignore
            f'purchased: {self.is_purchased})'
        )
