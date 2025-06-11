from django.contrib import admin
from django.contrib.auth.models import Group

from .models import (
    User, Household, Membership, Expense,
    ExpenseSplit, ExpenseCategory, Task, ShoppingListItem
)


admin.site.register(User)
admin.site.register(Household)
admin.site.register(Membership)
admin.site.register(Expense)
admin.site.register(ExpenseSplit)
admin.site.register(ExpenseCategory)
admin.site.register(Task)
admin.site.register(ShoppingListItem)

# Unregistering the Group model because it's not being used
admin.site.unregister(Group)
