export const BasicAccounting = () => {
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
  
    const addTransaction = () => {
      setTransactions([...transactions, {
        id: Date.now(),
        amount: amount,
        date: new Date().toLocaleDateString()
      }]);
      setAmount('');
    };
  
    return (
      <div className="simple-card">
        <h3>📒 Basic Records</h3>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <button className="simple-button" onClick={addTransaction}>
          Add Entry
        </button>
        <ul>
          {transactions.map(t => (
            <li key={t.id}>KES {t.amount} - {t.date}</li>
          ))}
        </ul>
      </div>
    );
  };
