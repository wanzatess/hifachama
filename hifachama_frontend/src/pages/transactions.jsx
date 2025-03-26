import React, { useEffect, useState } from "react";
import axios from "axios";

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        axios.get("http://127.0.0.1:8080/api/transactions/")
            .then(response => {
                setTransactions(response.data);
            })
            .catch(error => {
                console.error("Error fetching transactions:", error);
            });
    }, []);

    return (
        <div>
            <h2>Transaction History</h2>
            {transactions.length === 0 ? (
                <p>No transactions found.</p>
            ) : (
                <ul>
                    {transactions.map((transaction) => (
                        <li key={transaction.id}>
                            {transaction.transaction_type}: KES {transaction.amount} ({transaction.status})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TransactionList;
