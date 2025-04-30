import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

const LoanRequestForm = ({ onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [amount, setAmount] = useState("");
  const [repaymentPeriod, setRepaymentPeriod] = useState("3 months");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [chamas, setChamas] = useState([]);
  const [selectedChama, setSelectedChama] = useState("");

  useEffect(() => {
    const fetchUserChamas = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await api.get("/api/chamas/");
          setChamas(response.data);
        } catch (error) {
          console.error("Error fetching chamas:", error);
          toast.error("Failed to load your chamas");
        }
      }
    };
    fetchUserChamas();
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to request a loan.");
      return;
    }

    if (!amount || !purpose || !selectedChama) {
      toast.error("Amount, purpose and chama selection are required!");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/loans/", {
        amount: parseFloat(amount),
        repayment_period: repaymentPeriod,
        purpose,
        chama_id: selectedChama
      });

      toast.success("Loan request submitted!");
      setAmount("");
      setPurpose("");
      setSelectedChama("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Loan request error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to request loan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <p className="text-red-600">Please log in to request a loan.</p>;
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Request a Loan</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Select Chama</label>
          <select
            value={selectedChama}
            onChange={(e) => setSelectedChama(e.target.value)}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select a Chama</option>
            {chamas.map((chama) => (
              <option key={chama.id} value={chama.id}>
                {chama.name} ({chama.chama_type})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded p-2"
            required
            min="1"
            step="0.01"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Repayment Period</label>
          <select
            value={repaymentPeriod}
            onChange={(e) => setRepaymentPeriod(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="3 months">3 months</option>
            <option value="6 months">6 months</option>
            <option value="12 months">12 months</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Purpose</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full border rounded p-2"
            rows="3"
            placeholder="What is the loan for?"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Processing..." : "Request Loan"}
        </button>
      </form>
    </div>
  );
};

export default LoanRequestForm;