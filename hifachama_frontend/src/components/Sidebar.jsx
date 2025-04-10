import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../static/images/logo.png"; // Path to your logo
import "../styles/Sidebar.css";

const Sidebar = () => {
  const { chamaId } = useParams();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isChamaRoute = pathname.includes(`/chama/${chamaId}`);

  const commonLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/loans", label: "Loans" },
    { path: "/contributions", label: "Contributions" },
    { path: "/withdrawals", label: "Withdrawals" }
  ];

  const chamaLinks = [
    { path: `/chama/${chamaId}/overview`, label: "Overview" },
    { path: `/chama/${chamaId}/transactions`, label: "Transactions" },
    { path: `/chama/${chamaId}/members`, label: "Members" }
  ];

  const adminLinks = user?.role === "chairperson" ? [
    { path: `/chama/${chamaId}/admin`, label: "Admin Tools" }
  ] : [];

  return (
    <div className="sidebar-container">
      {/* Logo and Brand */}
      <div className="sidebar-header">
        <img src={logo} alt="HIFACHAMA Logo" className="sidebar-logo" />
        <h2 className="sidebar-brand">HIFACHAMA</h2>
      </div>

      {/* Title */}
      <h3 className="sidebar-title">
        {isChamaRoute ? "Chama Menu" : "Main Menu"}
      </h3>

      {/* Navigation Links */}
      <ul className="sidebar-list">
        {(isChamaRoute ? [...chamaLinks, ...adminLinks] : commonLinks).map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`sidebar-link ${pathname === link.path ? "active" : ""}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Tools Section */}
      {isChamaRoute && (
        <div className="sidebar-tools">
          <h4>Quick Tools</h4>
          <button className="sidebar-tool-btn">
            {user?.role === "chairperson" ? "Record Transaction" : "View History"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
