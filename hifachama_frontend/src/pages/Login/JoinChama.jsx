import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import '../Dashboards/Dashboard.css';

const JoinChama = () => {
  const [loading, setLoading] = useState(false);
  const [chamaId, setChamaId] = useState("");
  const { user, isAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    console.log("Input changed:", e.target.value);
    setChamaId(e.target.value.trim());
  };

  const handleJoinChama = async (e) => {
    e.preventDefault();
    console.log("1. handleJoinChama started with chamaId:", chamaId);

    // Validate chamaId
    if (!chamaId || !/^\d+$/.test(chamaId)) {
      console.log("2. Validation failed: Invalid chamaId:", chamaId);
      toast.error("Please enter a valid numeric Chama ID");
      return;
    }
    const parsedChamaId = parseInt(chamaId);
    if (isNaN(parsedChamaId) || parsedChamaId <= 0) {
      console.log("2. Validation failed: Parsed chamaId invalid:", parsedChamaId);
      toast.error("Chama ID must be a positive number");
      return;
    }

    // Check authentication
    console.log("3. Auth check:", { isAuthenticated, user });
    if (!isAuthenticated || !user) {
      console.log("4. Not authenticated, redirecting to login");
      toast.error("You must be logged in to join a Chama");
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    console.log("5. Sending POST to /api/join-chama/ with payload:", { chama: parsedChamaId });

    try {
      // Step 1: Attempt to join the chama
      const joinResponse = await api.post("/api/join-chama/", {
        chama: parsedChamaId,
      });
      console.log("6. Join Chama response:", joinResponse.status, joinResponse.data);

      toast.success("Successfully joined Chama!");

      // Step 2: Refresh user info (optional)
      try {
        console.log("7. Fetching user info from /api/users/me/");
        const userResponse = await api.get("/api/users/me/");
        console.log("8. User info response:", userResponse.status, userResponse.data);
        setUser(userResponse.data);
      } catch (userError) {
        console.warn("9. Failed to refresh user info:", userError.response?.status, userError.response?.data);
        // Continue without user refresh
      }

      // Step 3: Fetch chama details
      console.log(`10. Preparing to fetch chama details with chamaId: ${chamaId}`);
      const chamaUrl = `/api/chamas/${chamaId}/`;
      console.log(`11. Chama API URL: ${chamaUrl}`);
      try {
        console.log("12. Sending GET request to", chamaUrl);
        const chamaResponse = await api.get(chamaUrl);
        console.log("13. Chama details response:", chamaResponse.status, chamaResponse.data);
        const chamaData = chamaResponse.data;

        // Step 4: Verify chama_type and redirect
        const chamaType = chamaData.chama_type;
        if (!chamaType) {
          console.error("14. Chama type is missing in response:", chamaData);
          toast.error("Failed to determine Chama type");
          return;
        }
        const dashboardPath = getDashboardPath(chamaType, chamaId);
        console.log("15. Redirecting to:", dashboardPath);
        navigate(dashboardPath, { replace: true });
      } catch (chamaError) {
        console.error("16. Chama fetch error:", {
          message: chamaError.message,
          status: chamaError.response?.status,
          data: chamaError.response?.data,
        });
        toast.error("Failed to fetch Chama details: " + (chamaError.message || "Unknown error"));
        return;
      }
    } catch (error) {
      console.error("17. Error in handleJoinChama:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.response?.status === 409) {
        toast.info("You are already a member of this Chama.");
        try {
          console.log(`18. Fetching chama details (409) with chamaId: ${chamaId}`);
          const chamaUrl = `/api/chamas/${chamaId}/`;
          console.log(`19. Chama API URL (409): ${chamaUrl}`);
          console.log("20. Sending GET request to (409)", chamaUrl);
          const chamaResponse = await api.get(chamaUrl);
          console.log("21. Chama details (409) response:", chamaResponse.status, chamaResponse.data);
          const chamaType = chamaResponse.data.chama_type;
          if (!chamaType) {
            console.error("22. Chama type is missing in 409 response:", chamaResponse.data);
            toast.error("Failed to determine Chama type");
            return;
          }
          const dashboardPath = getDashboardPath(chamaType, chamaId);
          console.log("23. Redirecting to (409):", dashboardPath);
          navigate(dashboardPath, { replace: true });
        } catch (err) {
          console.error("24. Error fetching Chama details (409):", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });
          toast.error("Failed to fetch Chama details (409): " + (err.message || "Unknown error"));
        }
      } else {
        let errorMessage = "Failed to join Chama";
        if (error.response?.status === 400) {
          const errorData = error.response.data;
          errorMessage = errorData.chama
            ? `Chama ID: ${errorData.chama.join(", ")}`
            : errorData.detail || JSON.stringify(errorData);
        } else if (error.response?.status === 404) {
          errorMessage = "Chama not found";
        } else if (error.response?.status === 401) {
          errorMessage = "Unauthorized: Please log in again";
          navigate("/login", { replace: true });
        }
        console.log("25. Displaying error:", errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      console.log("26. handleJoinChama completed");
    }
  };

  const getDashboardPath = (chamaType, chamaId) => {
    console.log("27. getDashboardPath called with chamaType:", chamaType, "chamaId:", chamaId);
    const validTypes = ["hybrid", "investment", "merry_go_round"];
    const normalizedType = validTypes.includes(chamaType) ? chamaType : "default";
    console.log("28. Normalized type:", normalizedType);

    const paths = {
      hybrid: `/dashboard/hybrid/${chamaId}`,
      investment: `/dashboard/investment/${chamaId}`,
      merry_go_round: `/dashboard/merry_go_round/${chamaId}`,
      default: `/dashboard/chamas/${chamaId}`,
    };

    const path = paths[normalizedType];
    console.log("29. Generated dashboard path:", path);
    return path;
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
            inputMode="numeric"
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