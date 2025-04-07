export const SavingsTracker = () => {
    const [savings, setSavings] = useState(0);
    
    return (
      <div className="simple-card">
        <h3>💰 Group Savings</h3>
        <p>Total: KES {savings.toLocaleString()}</p>
        <input 
          type="number" 
          placeholder="Add amount"
          onChange={(e) => setSavings(prev => prev + Number(e.target.value))}
        />
        <button className="simple-button">Record</button>
      </div>
    );
  };
