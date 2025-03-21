import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div style={{ width: "200px", padding: "20px", background: "#f4f4f4", height: "100vh" }}>
      <h3>Menu</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/loans">Loans</Link></li>
        <li><Link to="/contributions">Contributions</Link></li>
        <li><Link to="/withdrawals">Withdrawals</Link></li>
        <li><Link to="/meetings">Meetings</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
