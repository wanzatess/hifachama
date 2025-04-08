import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../../styles/Dashboard.css"; // Assuming styling is in this file

const JoinChama = () => {
  const [loading, setLoading] = useState(false);
  const [chamaId, setChamaId] = useState(""); // State for Chama ID input

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setChamaId(e.target.value); // Update the Chama ID on input change
  };

  const handleJoinChama = async (e) => {
    e.preventDefault();

    if (!chamaId) {
      toast.error("Please enter a Chama ID");
      return;
    }

    setLoading(true);
    try {
      // Adjust your API base URL accordingly
      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://hifachama-backend.onrender.com";
      const response = await axios.post(`${API_BASE_URL}/api/chamas/${chamaId}/members`, {
        // Send the user ID (you can adapt it if needed)
        user_id: localStorage.getItem("user_id"), // Assuming you store user ID in local storage
      }, {
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });

      toast.success("Successfully joined Chama!");
      navigate(`/chama/${chamaId}`); // Redirect to the Chama page after joining
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to join Chama";
      toast.error(errorMessage);
      console.error("Join Chama error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chama-form-container">
      <h2>Join an Existing Chama</h2>
      <form onSubmit={handleJoinChama} className="chama-form">
        <div className="form-group">
          <label>Chama ID *</label>
          <input
            type="text"
            value={chamaId}
            onChange={handleInputChange}
            placeholder="Enter Chama ID (e.g., CH12345)"
            required
          />
        </div>
        <button type="submit" className="action-btn" disabled={loading}>
          {loading ? "Joining..." : "Join Chama"}
        </button>
      </form>

      <div className="chama-help">
        <h3>How to join a Chama</h3>
        <ol>
          <li>Get the Chama ID from the Chama administrator</li>
          <li>Enter the Chama ID in the field above</li>
          <li>Click "Join Chama"</li>
        </ol>
        <p className="note">
          Note: You'll need approval from the Chama administrator to complete the process.
        </p>
      </div>
    </div>
  );
};

export default JoinChama;
