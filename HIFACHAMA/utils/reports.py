import pandas as pd
from HIFACHAMA.models import Transaction

def get_transaction_data():
    # Fetch transactions and convert to DataFrame for report usage
    transactions = Transaction.objects.select_related('member').values(
        'member__username', 'transaction_type', 'amount', 'timestamp'
    )
    return pd.DataFrame(list(transactions))
