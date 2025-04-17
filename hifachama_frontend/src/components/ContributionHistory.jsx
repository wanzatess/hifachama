import React, { useEffect, useState } from "react";
import axios from "axios";

const ContributionHistory = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://hifachama-backend.onrender.com/api/contributions/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setContributions(response.data);
      } catch (error) {
        console.error("Failed to fetch contributions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Contribution History</h2>
      {loading ? (
        <p>Loading contributions...</p>
      ) : contributions.length > 0 ? (
        <table className="w-full border">
          <thead>
            <tr className="border-b">
              <th className="p-2">Amount</th>
              <th className="p-2">Payment Method</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((contribution) => (
              <tr key={contribution.id} className="border-b">
                <td className="p-2">{contribution.amount}</td>
                <td className="p-2">{contribution.payment_method}</td>
                <td className="p-2">{contribution.status}</td>
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
