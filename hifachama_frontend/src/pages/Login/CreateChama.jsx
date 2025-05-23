import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from '../../api/axiosConfig';
import { toast } from "react-toastify";

const CreateChama = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chama_type: "", // Default value for chama type
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const chamaTypes = [
    { value: "hybrid", label: "Hybrid" },
    { value: "merry_go_round", label: "Merry-go-round" },
    { value: "investment", label: "Investment" }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard/create-chama' } });
    }
  }, [isAuthenticated, navigate]);

  // Handle form data change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send API request to create a new chama
      const response = await api.post("/api/chamas/", formData);
      toast.success("Chama created successfully!");

      const { chama_type, id } = response.data; // Get chama_type from the response

      // Redirect based on chama_type
      if (chama_type === 'hybrid') {
        navigate(`/dashboard/hybrid/${id}`);
      } else if (chama_type === 'merry_go_round') {
        navigate(`/dashboard/merry_go_round/${id}`);
      } else if (chama_type === 'investment') {
        navigate(`/dashboard/investment/${id}`);
      }
    } catch (error) {
      console.error('Chama creation error:', error);
      toast.error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Failed to create chama. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="chama-form-container">
      <h2>Create New Chama</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Chama Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            minLength={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="chama_type">Chama Type *</label>
          <select
            id="chama_type"
            name="chama_type"
            value={formData.chama_type}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled hidden>
              Pick a chama
            </option>
            {chamaTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
        >
          {isSubmitting ? 'Creating...' : 'Create Chama'}
        </button>
      </form>
    </div>
  );
};

export default CreateChama;
