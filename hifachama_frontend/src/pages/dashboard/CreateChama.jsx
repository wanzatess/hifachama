import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api/axiosConfig';  // Going two levels up from 'src/pages/dashboard'
import { toast } from "react-toastify";
import { isLoggedIn } from "../../utils/auth.jsx";

const CreateChama = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chama_type: "",
  });
  const navigate = useNavigate();

  const chamaTypes = [
    { value: "", label: "Select Chama Type", disabled: true },
    { value: "hybrid", label: "Hybrid" },
    { value: "merry_go_round", label: "Merry-go-round" },
    { value: "investment", label: "Investment" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/chamas/", formData);
      toast.success("Chama created!");
      navigate(`/dashboard/${formData.chama_type}`); // Dynamic redirect
    } catch (error) {
      toast.error(error.response?.data?.message || "Creation failed");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="chama-form">
      <h2>Create New Chama</h2>
      <form onSubmit={handleSubmit} className="chama-form">
        <div className="form-group">
          <label>Chama Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Chama Type *</label>
          <select
            name="chama_type"
            value={formData.chama_type}
            onChange={handleInputChange}
            required
            className="chama-type-select"
          >
            {chamaTypes.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled || false}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="action-btn">
          Create Chama
        </button>
      </form>
    </div>
  );
};

export default CreateChama;
