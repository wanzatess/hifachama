// src/pages/ChamaDetails.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ChamaDetails = () => {
  const { id } = useParams();
  const [chama, setChama] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChama = async () => {
      try {
        const response = await axios.get(`/api/chamas/${id}`, {
          headers: { Authorization: `Token ${localStorage.getItem('authToken')}` }
        });
        setChama(response.data);
      } catch (error) {
        console.error("Error fetching chama:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChama();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!chama) return <div>Chama not found</div>;

  return (
    <div className="chama-details">
      <h1>{chama.name}</h1>
      <p>Type: {chama.chama_type}</p>
      <p>{chama.description}</p>
      {/* Add more details and functionality here */}
    </div>
  );
};

export default ChamaDetails;
