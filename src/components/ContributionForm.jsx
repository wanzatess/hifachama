import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ContributionForm = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("M-Pesa");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token"); // Assuming JWT authentication
      const response = await axios.post(
        "http://localhost:8080/api/transactions/",
        {
          amount,
          payment_method: paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Contribution submitted successfully!");
      setAmount("");
    } catch (error) {
      toast.error("Failed to submit contribution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Make a Contribution</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="M-Pesa">M-Pesa</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Contribution"}
        </button>
      </form>
    </div>
  );
};

export default ContributionForm;
