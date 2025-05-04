import React, { useEffect, useState } from "react";
import axios from "axios";

const ContributionHistory = ({ refreshFlag }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContributions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "http://127.0.0.1:8080/api/contributions/",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setContributions(response.data);
    } catch (error) {
      console.error("Failed to fetch contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [refreshFlag]); // re-run fetch on change

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Contribution History</h2>
      {loading ? (
        <p>Loading contributions...</p>
      ) : contributions.length > 0 ? (
        <table className="w-full border">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((contribution) => (
              <tr key={contribution.id} className="border-b">
                <td className="p-2">{contribution.amount}</td>
                <td className="p-2">{contribution.status}</td>
                <td className="p-2">{new Date(contribution.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No contributions found.</p>
      )}
    </div>
  );
};

export default ContributionHistory;