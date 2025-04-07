import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthProvider } from "../context/AuthContext";

const Meetings = () => {
  const { user } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [newMeeting, setNewMeeting] = useState({ title: "", date: "", time: "" });

  useEffect(() => {
    api.get("/meetings/")
      .then((response) => setMeetings(response.data))
      .catch((error) => console.error("Error fetching meetings:", error));
  }, []);

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (user.role !== "secretary") {
      alert("Only the secretary can schedule meetings.");
      return;
    }
    
    try {
      const response = await api.post("/meetings/", newMeeting);
      setMeetings([...meetings, response.data]);
      setNewMeeting({ title: "", date: "", time: "" }); // Clear form
    } catch (error) {
      console.error("Error scheduling meeting:", error);
    }
  };

  return (
    <div>
      <h2>Meetings</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((meeting) => (
            <tr key={meeting.id}>
              <td>{meeting.title}</td>
              <td>{meeting.date}</td>
              <td>{meeting.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form for scheduling meetings (Only for secretary) */}
      {user.role === "secretary" && (
        <form onSubmit={handleScheduleMeeting}>
          <input 
            type="text" 
            placeholder="Meeting Title" 
            value={newMeeting.title} 
            onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} 
            required 
          />
          <input 
            type="date" 
            value={newMeeting.date} 
            onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })} 
            required 
          />
          <input 
            type="time" 
            value={newMeeting.time} 
            onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })} 
            required 
          />
          <button type="submit">Schedule Meeting</button>
        </form>
      )}
    </div>
  );
};

export default Meetings;
