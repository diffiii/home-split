from django.contrib import admin
from django.contrib.auth.models import Group

from .models import (
    User, Household, Membership, Expense,
    ExpenseSplit, ExpenseCategory, Task, ShoppingListItem
)


class ExpenseSplitAdmin(admin.ModelAdmin):
    list_display = ('expense', 'user', 'amount', 'is_settled')
    search_fields = ('expense__description', 'user__username', 'is_settled')


admin.site.register(User)
admin.site.register(Household)
admin.site.register(Membership)
admin.site.register(Expense)
admin.site.register(ExpenseSplit, ExpenseSplitAdmin)
admin.site.register(ExpenseCategory)
admin.site.register(Task)
admin.site.register(ShoppingListItem)

# Unregistering the Group model because it's not being used
admin.site.unregister(Group)
