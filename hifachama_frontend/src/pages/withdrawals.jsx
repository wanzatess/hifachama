import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthProvider } from "../context/AuthContext";

const Withdrawals = () => {
  const { user } = useContext(AuthContext);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    api.get("/withdrawals/")
      .then((response) => setWithdrawals(response.data))
      .catch((error) => console.error("Error fetching withdrawals:", error));
  }, []);

  const handleApprove = async (withdrawalId) => {
    if (user.role !== "treasurer") {
      alert("Only the treasurer can approve withdrawals.");
      return;
    }
    
    try {
      await api.patch(`/withdrawals/${withdrawalId}/`, { status: "approved" });
      setWithdrawals(withdrawals.map(withdrawal => 
        withdrawal.id === withdrawalId ? { ...withdrawal, status: "approved" } : withdrawal
      ));
    } catch (error) {
      console.error("Error approving withdrawal:", error);
    }
  };

  return (
    <div>
      <h2>Withdrawals</h2>
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((withdrawal) => (
            <tr key={withdrawal.id}>
              <td>{withdrawal.member}</td>
              <td>{withdrawal.amount}</td>
              <td>{withdrawal.status}</td>
              <td>
                {withdrawal.status === "pending" && (
                  <button 
                    onClick={() => handleApprove(withdrawal.id)}
                    disabled={user.role !== "treasurer"}
                  >
                    Approve Withdrawal
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Withdrawals;

  
