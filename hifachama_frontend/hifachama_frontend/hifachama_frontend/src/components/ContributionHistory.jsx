import React, { useEffect, useState } from "react";
import axios from "axios";

const ContributionHistory = () => {
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/contributions/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContributions(response.data);
      } catch (error) {
        console.error("Failed to fetch contributions:", error);
      }
    };

    fetchContributions();
  }, []);

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Contribution History</h2>
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
    </div>
  );
};

export default ContributionHistory;
