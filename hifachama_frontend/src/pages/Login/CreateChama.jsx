import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { ChamaContext } from "../../context/ChamaContext";
import api from "../../api/axiosConfig";
import logo from "../../static/images/chama image.jpg";
import "./ChamaForm.css";

const CreateChama = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chama_type: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { fetchUserAndChamaData } = useContext(ChamaContext);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/dashboard/create-chama" } });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post("/api/chamas/", formData);
      toast.success("Chama created successfully!");

      // Extract chama details
      const chama = response.data;
      await fetchUserAndChamaData();
      navigate(`/dashboard/${chama.chama_type}/${chama.id}`);
    } catch (error) {
      toast.error("Failed to create chama.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card no-container">
      <img src={logo} alt="Chama" className="form-image" />
      <div className="form-content">
        <h2>Create a New Chama</h2>
        <form className="chama-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Chama Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="chama_type">Chama Type</label>
            <select name="chama_type" required value={formData.chama_type} onChange={handleChange}>
              <option value="">Select Type</option>
              <option value="hybrid">Hybrid</option>
              <option value="merry_go_round">Merry-go-round</option>
              <option value="investment">Investment</option>
            </select>
          </div>

          <div className="form-group description">
            <label htmlFor="description">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Chama"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateChama;
