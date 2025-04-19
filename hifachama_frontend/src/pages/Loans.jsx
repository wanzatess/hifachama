import { useState, useEffect, useContext } from "react";
import api from '../api/axiosConfig';
import { AuthProvider } from "../context/AuthContext";  // ✅ Add this

const Loans = () => {
  const { user } = useContext(AuthContext);  // ✅ Get the logged-in user's role
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    api.get("/loans/")
      .then((response) => setLoans(response.data))
      .catch((error) => console.error("Error fetching loans:", error));
  }, []);

  const handleApprove = async (loanId) => {
    if (user.role !== "chairperson") {  // ✅ Restrict approval to chairperson
      alert("Only the chairperson can approve loans.");
      return;
    }
    
    try {
      await api.patch(`/loans/${loanId}/`, { status: "approved" });
      setLoans(loans.map(loan => loan.id === loanId ? { ...loan, status: "approved" } : loan));
    } catch (error) {
      console.error("Error approving loan:", error);
    }
  };

  return (
    <div>
      <h2>Loans</h2>
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
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.member}</td>
              <td>{loan.amount}</td>
              <td>{loan.status}</td>
              <td>
                {loan.status === "pending" && (
                  <button 
                    onClick={() => handleApprove(loan.id)}
                    disabled={user.role !== "chairperson"}  // ✅ Disable for non-chairpersons
                  >
                    Approve Loan
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

export default Loans;
