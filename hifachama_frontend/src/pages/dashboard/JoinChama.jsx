import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import "../../styles/Dashboard.css";

const JoinChama = () => {
  const [loading, setLoading] = useState(false);
  const [chamaId, setChamaId] = useState("");
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setChamaId(e.target.value.trim());
  };

  const handleJoinChama = async (e) => {
    e.preventDefault();

    if (!chamaId) {
      toast.error("Please enter a valid Chama ID");
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to join a Chama");
      navigate('/login', { state: { from: location } });
      return;
    }

    setLoading(true);
    try {
      // Verify chama exists and get its details
      const chamaResponse = await api.get(`/api/chamas/${chamaId}/`);
      const chamaData = chamaResponse.data;

      // Prepare payload matching backend expectations
      const payload = {
        chama: chamaId,
        user: user.id,
        role: 'member',  // Default role for new members
        email: user.email,
        phone_number: user.phone_number || null,
      };

      // Submit membership request
      await api.post('/api/chama-members/', payload);

      toast.success("Successfully requested to join Chama!");
      
      // Redirect using the same pattern as auth context
      let redirectPath = `/chamas/${chamaId}`; // Default fallback
      
      if (chamaData.type) {
        switch (chamaData.type) {
          case 'hybrid':
            redirectPath = `/dashboard/hybrid/${chamaId}`;
            break;
          case 'investment':
            redirectPath = `/dashboard/investment/${chamaId}`;
            break;
          case 'merry_go_round':
            redirectPath = `/dashboard/merry_go_round/${chamaId}`;
            break;
        }
      }
      
      navigate(redirectPath);
    } catch (error) {
      let errorMessage = "Failed to join Chama";
      
      if (error.response) {
        // Handle different error statuses
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data.detail || "Invalid request data";
            break;
          case 404:
            errorMessage = "Chama not found";
            break;
          case 409:
            errorMessage = "You're already a member of this Chama";
            break;
          default:
            // Handle serializer validation errors
            if (error.response.data) {
              errorMessage = Object.entries(error.response.data)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('; ');
            }
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
            pattern="\d+"  // Ensure only numbers are entered
            title="Please enter a numeric Chama ID"
          />
        </div>
        <button 
          type="submit" 
          className="action-btn" 
          disabled={loading || !isAuthenticated}
        >
          {loading ? "Processing..." : "Join Chama"}
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
        {!isAuthenticated && (
          <p className="auth-warning">
            You must be logged in to join a Chama. <a href="/login">Login here</a>.
          </p>
        )}
      </div>
    </div>
  );
};

export default JoinChama;