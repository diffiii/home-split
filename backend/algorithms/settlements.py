from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP


@dataclass
class Transaction:
    payer_id: str | int
    payee_id: str | int
    amount: float


def optimal_settlements(balances: dict[str | int, float]) -> list[Transaction]:
    decimal_balances: dict[str | int, Decimal] = {}

    for user_id, balance in balances.items():
        rounded_balance = Decimal(str(balance)).quantize(
            exp=Decimal('0.00'),
            rounding=ROUND_HALF_UP
        )

        if abs(rounded_balance) >= Decimal('0.01'):
            decimal_balances[user_id] = rounded_balance

    # Total balance should be equal to zero because all debts should
    # cancel each other out if the data is valid.
    total_balance = sum(decimal_balances.values())

    if abs(total_balance) > Decimal('0.00'):
        raise ValueError(f'Balances do not sum to zero: {total_balance}')

    if not decimal_balances:
        return []

    creditors: list[list[(str | int) | Decimal]] = []
    debtors: list[list[(str | int) | Decimal]] = []

    for user_id, balance in decimal_balances.items():
        if balance > Decimal('0.00'):
            creditors.append([user_id, balance])
        elif balance < Decimal('0.00'):
            debtors.append([user_id, -balance])

    transactions: list[Transaction] = []

    i: int = 0
    j: int = 0

    while i < len(debtors) and j < len(creditors):
        debtor_id, debtor_amount = debtors[i]
        creditor_id, creditor_amount = creditors[j]

        # The settlement amount is the minimum of the debtor's and
        # creditor's amounts to ensure we don't exceed either's balance.
        settlement_amount = min(debtor_amount, creditor_amount)

        transactions.append(Transaction(
            payer_id=debtor_id,  # type: ignore
            payee_id=creditor_id,  # type: ignore
            amount=float(settlement_amount)
        ))

        debtors[i][1] -= settlement_amount  # type: ignore
        creditors[j][1] -= settlement_amount  # type: ignore

        if debtors[i][1] == 0:
            i += 1

        if creditors[j][1] == 0:
            j += 1

    return transactions


def validate_settlement_plan(balances: dict[str | int, float],
                             transactions: list[Transaction]) -> bool:
    net_effects: dict[str | int, float] = {}

    for user_id in balances.keys():
        net_effects[user_id] = 0.0

    for transaction in transactions:
        if transaction.payer_id not in net_effects:
            net_effects[transaction.payer_id] = 0.0

        net_effects[transaction.payer_id] -= transaction.amount

        if transaction.payee_id not in net_effects:
            net_effects[transaction.payee_id] = 0.0

        net_effects[transaction.payee_id] += transaction.amount

    for user_id, original_balance in balances.items():
        net_effect = net_effects.get(user_id, 0.0)
        final_balance = original_balance - net_effect

        # Check if the final balance is close to zero to ensure that
        # the settlement plan is valid.
        if abs(final_balance) > 0.01:
            return False

    return True


if __name__ == '__main__':
    balances_example: dict[str | int, float] = {
        'user1': 0.01,
        'user2': -0.03,
        'user3': 0.02,
    }

    transactions = optimal_settlements(balances_example)

    print(validate_settlement_plan(balances_example, transactions))

    for transaction in transactions:
        print(
            f'{transaction.payer_id} pays {transaction.payee_id} '
            f'${transaction.amount:.2f}'
        )
