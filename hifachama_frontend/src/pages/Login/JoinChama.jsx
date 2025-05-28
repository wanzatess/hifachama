import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";
import logo from "../../static/images/chama image.jpg";
import "./ChamaForm.css";

const JoinChama = () => {
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("JoinChama useEffect - isAuthenticated:", isAuthenticated);
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login...");
      navigate("/login", { state: { from: "/dashboard/join-chama" } });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsJoining(true);
    console.log("Attempting to join chama with code:", code);

    try {
      const response = await api.post("/api/join-chama/", { chama: code });
      console.log("Join chama response:", response.data);

      const chamaData = response.data.data;  // {user, chama, role}
      console.log("Chama data extracted:", chamaData);

      // Now fetch full chama details including chama_type
      const chamaResponse = await api.get(`/api/chamas/${chamaData.chama}/`);
      console.log("Fetched chama details:", chamaResponse.data);

      const chama = chamaResponse.data;

      toast.success("Joined Chama successfully!");
      console.log("Redirecting to chama dashboard...");

      navigate(`/dashboard/${chama.chama_type}/${chama.id}`);
    } catch (error) {
      console.error("Error joining chama:", error);
      const errorMessage = error.response?.data?.message || "Invalid code or already joined.";
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="form-card no-container">
      <img src={logo} alt="Join Chama" className="form-image" />
      <div className="form-content">
        <h2>Join a Chama</h2>
        <form className="chama-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Enter Chama Code</label>
            <input
              type="text"
              name="code"
              id="code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <button type="submit" className="action-btn" disabled={isJoining}>
            {isJoining ? "Joining..." : "Join Chama"}
          </button>
        </form>

        <div className="chama-help">
          <h3>Need Help Joining?</h3>
          <ol>
            <li>Ask the chairperson for the Chama code.</li>
            <li>Ensure you’re registered and logged in.</li>
            <li>Paste the correct code here and click Join.</li>
          </ol>
          {!isAuthenticated && (
            <p className="auth-warning">You must be logged in to join a chama.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinChama;
