import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const ChamaList = () => {
    const [chamas, setChamas] = useState([]);

    useEffect(() => {
        api.get('/chamas/')  // Assuming your Django API has a `/api/chamas/` endpoint
            .then((response) => setChamas(response.data))
            .catch((error) => console.error('Error fetching chamas:', error));
    }, []);

    return (
        <div>
            <h2>Chama List</h2>
            <ul>
                {chamas.map((chama) => (
                    <li key={chama.id}>{chama.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default ChamaList;
