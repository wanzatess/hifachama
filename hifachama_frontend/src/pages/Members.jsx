import React, { useEffect, useState } from "react";
import api from '../api/axiosConfig';

const Members = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    api.get("http://127.0.0.1:8080/api/members/")
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
