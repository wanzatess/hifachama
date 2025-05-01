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
      // Try joining the chama directly
      await api.post('/api/chama-members/', {
        chama: chamaId,
        role: 'member'
      });
  
      toast.success("Successfully joined Chama!");
  
      // Now fetch the Chama details (including the type)
      const chamaResponse = await api.get(`/api/chamas/${chamaId}/`);
      const chamaType = chamaResponse.data.chama_type;
      console.log("Chama Type:", chamaType);
  
      // Based on the type, redirect to the corresponding dashboard
      const dashboardPath = getDashboardPath(chamaType, chamaId);
      console.log('Redirecting to:', dashboardPath);
      navigate(dashboardPath);
  
    } catch (error) {
      // If user is already a member, proceed to redirect
      if (error.response?.status === 409) {
        toast.info("You are already a member of this Chama.");
      } else {
        let errorMessage = "Failed to join Chama";
  
        if (error.response?.status === 400) {
          errorMessage = error.response.data.detail || "Invalid request data";
        } else if (error.response?.status === 404) {
          errorMessage = "Chama not found";
        }
  
        toast.error(errorMessage);
        setLoading(false);
        return; // Stop here for actual errors
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to determine dashboard path based on Chama type
  const getDashboardPath = (chamaType, chamaId) => {
    const validTypes = ['hybrid', 'investment', 'merry_go_round'];
    const normalizedType = validTypes.includes(chamaType) ? chamaType : 'default';
  
    const paths = {
      hybrid: `/dashboard/hybrid/${chamaId}`,
      investment: `/dashboard/investment/${chamaId}`,
      merry_go_round: `/dashboard/merry_go_round/${chamaId}`,
      default: `/dashboard/chamas/${chamaId}` // fallback to a default page if the type is unknown
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