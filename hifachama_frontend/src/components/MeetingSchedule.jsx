export const MeetingSchedule = () => {
    return (
      <div className="simple-card">
        <h3>📅 Next Meeting</h3>
        <p>Date: {new Date().toLocaleDateString()}</p>
        <p>Location: Virtual</p>
        <button className="simple-button">
          Notify Members
        </button>
      </div>
    );
  };
