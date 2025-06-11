from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from api.models import Household, Expense, ExpenseSplit, User
from algorithms.settlements import optimal_settlements, Transaction
from algorithms.statistics import calculate_user_net_balance


@extend_schema(tags=['9. Settlements'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def household_balances(request, household_id):
    """
    Get user balances for a specific household.
    """
    user = request.user

    # Check if user is a member of the household
    try:
        household = Household.objects.get(
            id=household_id,
            members=user
        )
    except Household.DoesNotExist:
        return Response(
            {'error': 'Household not found or you do not have access'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Calculate balances for each member
    balances = {}

    for member in household.members.all():
        balance = calculate_user_net_balance(member, household)
        balances[member.id] = float(balance)

    return Response({
        'household_id': household_id,
        'household_name': household.name,
        'balances': [
            {
                'user_id': user_id,
                'username': household.members.get(id=user_id).username,
                'balance': balance
            }
            for user_id, balance in balances.items()
        ]
    })


@extend_schema(tags=['9. Settlements'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def household_settlement_plan(request, household_id):
    """
    Get optimal settlement plan for a specific household.
    """
    user = request.user

    # Check if user is a member of the household
    try:
        household = Household.objects.get(
            id=household_id,
            members=user
        )
    except Household.DoesNotExist:
        return Response(
            {'error': 'Household not found or you do not have access'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Calculate balances (same logic as above)
    balances = {}

    for member in household.members.all():
        balance = calculate_user_net_balance(member, household)
        balances[member.id] = float(balance)

    try:
        # Generate optimal settlement plan
        transactions = optimal_settlements(balances)

        # Convert to response format
        settlement_plan = []
        for transaction in transactions:
            payer = household.members.get(id=transaction.payer_id)
            payee = household.members.get(id=transaction.payee_id)

            settlement_plan.append({
                'payer_id': transaction.payer_id,
                'payer_username': payer.username,
                'payee_id': transaction.payee_id,
                'payee_username': payee.username,
                'amount': Decimal(round(transaction.amount, 2))
            })

        return Response({
            'household_id': household_id,
            'household_name': household.name,
            'settlement_plan': settlement_plan,
            'total_transactions': len(settlement_plan)
        })

    except ValueError as e:
        return Response(
            {'error': f'Settlement calculation failed: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@extend_schema(
    tags=['9. Settlements'],
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'payer_id': {
                    'type': 'integer',
                    'description': 'ID of the user making the payment'
                },
                'payee_id': {
                    'type': 'integer',
                    'description': 'ID of the user receiving the payment'
                },
                'amount': {
                    'type': 'number',
                    'format': 'float',
                    'minimum': 0.01,
                    'description': 'Payment amount (must be positive)'
                }
            },
            'required': ['payer_id', 'payee_id', 'amount'],
            'example': {
                'payer_id': 2,
                'payee_id': 3,
                'amount': 25.50
            }
        }
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_settlement(request, household_id):
    """
    Process a settlement payment between two household members.
    Handles three cases:
    1) Exact optimal payment -> settle all splits between users
    2) Less than optimal -> create compensating expense
    3) More than optimal -> settle all splits + create compensating expense
    """
    user = request.user

    # Check if user is a member of the household
    try:
        household = Household.objects.get(
            id=household_id,
            members=user
        )
    except Household.DoesNotExist:
        return Response(
            {'error': 'Household not found or you do not have access'},
            status=status.HTTP_404_NOT_FOUND
        )

    payer_id = request.data.get('payer_id')
    payee_id = request.data.get('payee_id')
    amount = request.data.get('amount')

    if not all([payer_id, payee_id, amount]):
        return Response(
            {'error': 'payer_id, payee_id, and amount are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError("Amount must be positive")
    except (ValueError, TypeError):
        return Response(
            {'error': 'Amount must be a positive number'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify both users are household members
    try:
        payer = household.members.get(id=payer_id)
        payee = household.members.get(id=payee_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Both users must be household members'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if payer_id == payee_id:
        return Response(
            {'error': 'Payer and payee cannot be the same user'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Calculate current balances
    balances = {}
    for member in household.members.all():
        balance = calculate_user_net_balance(member, household)
        balances[member.id] = balance

    try:
        # Get optimal settlement plan
        optimal_transactions = optimal_settlements(balances)

        # Find the optimal transaction between payer and payee
        optimal_amount = 0.0
        for txn in optimal_transactions:
            if txn.payer_id == payer_id and txn.payee_id == payee_id:
                optimal_amount = txn.amount
                break

        # Use database transaction to ensure atomicity
        with transaction.atomic():
            result = {
                'household_id': household_id,
                'payer_id': payer_id,
                'payer_username': payer.username,
                'payee_id': payee_id,
                'payee_username': payee.username,
                'payment_amount': amount,
                'optimal_amount': optimal_amount,
                'actions_taken': []
            }

            tolerance = 0.01  # 1 cent tolerance for floating point comparison

            if abs(amount - optimal_amount) <= tolerance:
                # Case 1: Exact optimal payment
                # Settle all unsettled splits between these two users
                settled_splits_1 = ExpenseSplit.objects.filter(
                    expense__household=household,
                    user=payer,
                    is_settled=False,
                    expense__payer=payee
                )

                settled_splits_2 = ExpenseSplit.objects.filter(
                    expense__household=household,
                    user=payee,
                    is_settled=False,
                    expense__payer=payer
                )

                settled_count_1 = settled_splits_1.update(is_settled=True)
                settled_count_2 = settled_splits_2.update(is_settled=True)
                total_settled = settled_count_1 + settled_count_2

                result['case'] = 1
                result['actions_taken'].append(
                    f'Settled {total_settled} expense splits between users')

            elif amount < optimal_amount:
                # Case 2: Less than optimal payment

                # Create compensating expense
                compensating_expense = Expense.objects.create(
                    name='<<<SETTLEMENT ADJUSTMENT>>>',
                    household=household,
                    payer=payer,  # Payee "pays" to reduce what payer owes
                    description=f'Settlement adjustment: {payer.username} paid " \
                        f"{payee.username} ${amount:.2f} (${amount:.2f} less than optimal)',
                    amount=amount,
                    author=payer
                )

                # Create split for the payer
                ExpenseSplit.objects.create(
                    expense=compensating_expense,
                    user=payee,
                    amount=amount,
                    is_settled=False
                )

                result['case'] = 2
                result['actions_taken'].append(
                    f'Created compensating expense for ${amount:.2f}')

            else:
                # Case 3: More than optimal payment
                excess = amount - optimal_amount

                # First, settle all splits between these users (like Case 1)
                settled_splits_1 = ExpenseSplit.objects.filter(
                    expense__household=household,
                    user=payer,
                    is_settled=False,
                    expense__payer=payee
                )

                settled_splits_2 = ExpenseSplit.objects.filter(
                    expense__household=household,
                    user=payee,
                    is_settled=False,
                    expense__payer=payer
                )

                settled_count_1 = settled_splits_1.update(is_settled=True)
                settled_count_2 = settled_splits_2.update(is_settled=True)
                total_settled = settled_count_1 + settled_count_2

                compensating_expense = Expense.objects.create(
                    name='<<<SETTLEMENT ADJUSTMENT>>>',
                    household=household,
                    payer=payer,  # Payer "pays" the excess
                    description=f'Settlement adjustment: {payer.username} paid {payee.username} ${amount:.2f} (${excess:.2f} more than optimal)',
                    amount=excess,
                    author=payer
                )

                ExpenseSplit.objects.create(
                    expense=compensating_expense,
                    user=payee,
                    amount=excess,
                    is_settled=False
                )

                result['case'] = 3
                result['actions_taken'].append(
                    f'Settled {total_settled} expense splits between users')
                result['actions_taken'].append(
                    f'Created compensating expense for excess ${excess:.2f}')

            return Response(result, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response(
            {'error': f'Settlement calculation failed: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Settlement processing failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
