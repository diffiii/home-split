from api.models import Household, Expense, ExpenseSplit, User
from decimal import Decimal


def calculate_user_amount_paid(
    user: User, household: Household | None = None
) -> Decimal:
    """
    Calculate the total amount paid by a user in a household or globally
    """
    if household is not None:
        expenses = Expense.objects.filter(
            household=household,
            payer=user
        )
        return Decimal(sum(expense.amount for expense in expenses))

    expenses = Expense.objects.filter(payer=user)
    return Decimal(sum(expense.amount for expense in expenses))


def calculate_user_amount_paid_self(
    user: User, household: Household | None = None
) -> Decimal:
    """
    Calculate the total amount paid by a user for their own expenses
    in a household or globally
    """
    if household is not None:
        expenses = Expense.objects.filter(
            household=household,
            payer=user
        )
        expense_splits = ExpenseSplit.objects.filter(
            user=user,
            expense__in=expenses,
            is_settled=True
        )
        return Decimal(sum(split.amount for split in expense_splits))

    expenses = Expense.objects.filter(payer=user)
    expense_splits = ExpenseSplit.objects.filter(
        user=user,
        expense__in=expenses,
        is_settled=True
    )
    return Decimal(sum(split.amount for split in expense_splits))


def calculate_user_amount_owed(
    user: User, household: Household | None = None
) -> Decimal:
    """
    Calculate the total amount owed by a user in a household or globally
    """
    if household is not None:
        expense_splits = ExpenseSplit.objects.filter(
            user=user,
            expense__household=household
        )
        return Decimal(sum(split.amount for split in expense_splits)) \
            - calculate_user_amount_paid_self(user, household)

    expense_splits = ExpenseSplit.objects.filter(
        user=user
    )
    return Decimal(sum(split.amount for split in expense_splits)) \
        - calculate_user_amount_paid_self(user)


def calculate_user_amount_owed_settled(
    user: User, household: Household | None = None
) -> Decimal:
    """
    Calculate the total amount owed by a user that has been settled
    in a household or globally
    """
    if household is not None:
        expenses = Expense.objects.filter(
            household=household,
            payer__isnull=False
        ).exclude(payer=user)
        expense_splits = ExpenseSplit.objects.filter(
            user=user,
            expense__in=expenses,
            is_settled=True
        )
        return Decimal(sum(split.amount for split in expense_splits))

    expenses = Expense.objects.filter(payer__isnull=False).exclude(payer=user)
    expense_splits = ExpenseSplit.objects.filter(
        user=user,
        expense__in=expenses,
        is_settled=True
    )
    return Decimal(sum(split.amount for split in expense_splits))


def calculate_user_amount_owed_by_others(
    user: User, household: Household | None = None
) -> Decimal:
    """
    Calculate the total amount owed to a user by others in a household 
    or globally
    """
    if household is not None:
        expenses = Expense.objects.filter(
            household=household,
            payer=user
        )
        expense_splits = ExpenseSplit.objects.filter(
            expense__in=expenses
        ).exclude(user=user)
        return Decimal(sum(split.amount for split in expense_splits))

    expenses = Expense.objects.filter(payer=user)
    expense_splits = ExpenseSplit.objects.filter(
        expense__in=expenses
    ).exclude(user=user)
    return Decimal(sum(split.amount for split in expense_splits))


def calculate_user_amount_owed_by_others_settled(
    user: User, household: Household | None = None
) -> Decimal:
    """
    Calculate the total amount owed to a user by others that has been settled
    in a household or globally
    """
    if household is not None:
        expenses = Expense.objects.filter(
            household=household,
            payer=user
        )
        expense_splits = ExpenseSplit.objects.filter(
            expense__in=expenses,
            is_settled=True
        )
        return Decimal(sum(split.amount for split in expense_splits)) \
            - calculate_user_amount_paid_self(user, household)

    expenses = Expense.objects.filter(payer=user)
    expense_splits = ExpenseSplit.objects.filter(
        expense__in=expenses,
        is_settled=True
    )
    return Decimal(sum(split.amount for split in expense_splits)) \
        - calculate_user_amount_paid_self(user)


def calculate_user_net_balance(
    user: User, household: Household | None = None
) -> Decimal:
    """
    Calculate the net balance of a user in a household or globally
    """
    amount_paid = calculate_user_amount_paid(user, household)
    amount_paid_self = calculate_user_amount_paid_self(user, household)
    amount_owed = calculate_user_amount_owed(user, household)
    amount_owed_settled = calculate_user_amount_owed_settled(user, household)
    amount_owed_by_others = calculate_user_amount_owed_by_others(
        user, household)
    amount_owed_by_others_settled = calculate_user_amount_owed_by_others_settled(
        user, household)

    net_balance = (
        - amount_owed
        + amount_owed_settled
        + amount_owed_by_others
        - amount_owed_by_others_settled
    )

    return net_balance if net_balance else Decimal(0.0)
