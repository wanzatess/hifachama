import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from '../../api/axiosConfig';
import { toast } from "react-toastify";

const CreateChama = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chama_type: "hybrid", // Set default value
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Debug: Check token before request
      console.log('Current token:', localStorage.getItem('authToken'));
      
      const response = await api.post("/api/chamas/", formData); // Remove /api/ prefix since baseURL includes it
      toast.success("Chama created successfully!");
      navigate(`/chama/${response.data.id}`); // Redirect to new chama
    } catch (error) {
      console.error('Chama creation error:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });

      toast.error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Failed to create chama. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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