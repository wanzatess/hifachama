import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import AuthContext from "../context/AuthContext";

const Contributions = () => {
  const { user } = useContext(AuthContext);
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    api.get("/contributions/")
      .then((response) => setContributions(response.data))
      .catch((error) => console.error("Error fetching contributions:", error));
  }, []);

  const handleApprove = async (contributionId) => {
    if (user.role !== "treasurer") {
      alert("Only the treasurer can approve contributions.");
      return;
    }
    
    try {
      await api.patch(`/contributions/${contributionId}/`, { status: "approved" });
      setContributions(contributions.map(contribution => 
        contribution.id === contributionId ? { ...contribution, status: "approved" } : contribution
      ));
    } catch (error) {
      console.error("Error approving contribution:", error);
    }
  };

  return (
    <div>
      <h2>Contributions</h2>
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
          {contributions.map((contribution) => (
            <tr key={contribution.id}>
              <td>{contribution.member}</td>
              <td>{contribution.amount}</td>
              <td>{contribution.status}</td>
              <td>
                {contribution.status === "pending" && (
                  <button 
                    onClick={() => handleApprove(contribution.id)}
                    disabled={user.role !== "treasurer"}
                  >
                    Approve Contribution
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

export default Contributions;
