import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import "../../styles/Dashboard.css";

const JoinChama = () => {
  const [loading, setLoading] = useState(false);
  const [chamaId, setChamaId] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setChamaId(e.target.value);
  };

  const handleJoinChama = async (e) => {
    e.preventDefault();

    if (!chamaId) {
      toast.error("Please enter a Chama ID");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to join a Chama");
      return;
    }

    setLoading(true);
    try {
      // First verify the chama exists and get its type
      const chamaResponse = await api.get(`/api/chamas/${chamaId}/`);
      const { type: chamaType } = chamaResponse.data;

      // Then join the chama
      const joinResponse = await api.post('/api/chama-members/', {
        chama: chamaId,
        user: user.id,
        status: 'pending' // or 'active' depending on your workflow
      });

      toast.success("Successfully joined Chama!");
      
      // Redirect based on chama type (consistent with creation flow)
      switch (chamaType) {
        case 'hybrid':
          navigate(`/dashboard/hybrid/${chamaId}`);
          break;
        case 'merry_go_round':
          navigate(`/dashboard/merry_go_round/${chamaId}`);
          break;
        case 'investment':
          navigate(`/dashboard/investment/${chamaId}`);
          break;
        default:
          navigate(`/chamas/${chamaId}`); // Fallback for unknown types
      }
    } catch (error) {
      let errorMessage = "Failed to join Chama";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.detail || "Invalid request";
        } else if (error.response.status === 404) {
          errorMessage = "Chama not found";
        } else if (error.response.status === 409) {
          errorMessage = "You're already a member of this Chama";
        }
      }
      
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
            placeholder="Enter Chama ID (e.g., 26)"
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