import React, { useEffect, useState } from "react";
import api from "../services/api";

const Members = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    api.get("https://hifachama-backend.onrender.com/api/members/")
      .then(response => setMembers(response.data))
      .then((data) => console.log(data))
      .catch(error => console.error("Error fetching members:", error));
  }, []);

  return (
    <div>
      <h2>Chama Members</h2>
      <ul>
        {members.map(member => (
          <li key={member.id}>{member.name} - {member.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default Members;
