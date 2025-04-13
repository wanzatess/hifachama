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
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // 1. First get chama details to determine its type
      const chamaResponse = await api.get(`/api/chamas/${chamaId}/`);
      const chamaType = chamaResponse.data.type;

      // 2. Join the chama
      await api.post('/api/chama-members/', {
        chama: chamaId,
        role: 'member'
      });

      toast.success("Successfully joined Chama!");
      
      // 3. Redirect based on chama type
      const dashboardPath = getDashboardPath(chamaType, chamaId);
      navigate(dashboardPath);
      
    } catch (error) {
      let errorMessage = "Failed to join Chama";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.detail || "Invalid request data";
        } else if (error.response.status === 404) {
          errorMessage = "Chama not found";
        } else if (error.response.status === 409) {
          errorMessage = "You're already a member of this Chama";
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine dashboard path
  const getDashboardPath = (chamaType, chamaId) => {
    const validTypes = ['hybrid', 'investment', 'merry_go_round'];
    const normalizedType = validTypes.includes(chamaType) ? chamaType : 'default';
    
    const paths = {
      hybrid: `/dashboard/hybrid/${chamaId}`,
      investment: `/dashboard/investment/${chamaId}`,
      merry_go_round: `/dashboard/merry_go_round/${chamaId}`,
      default: `/chamas/${chamaId}`
    };
    
    return paths[normalizedType];
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
            pattern="\d+"
            title="Please enter a numeric ID"
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
          <li>Get the Chama ID from the administrator</li>
          <li>Enter the Chama ID above</li>
          <li>Click "Join Chama"</li>
        </ol>
        {!isAuthenticated && (
          <p className="auth-warning">You must be logged in to join a Chama.</p>
        )}
      </div>
    </div>
  );
};

export default JoinChama;