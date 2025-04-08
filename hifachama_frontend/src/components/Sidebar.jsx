import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Sidebar.css"; // Create this file

const Sidebar = () => {
  const { chamaId } = useParams();
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Determine if we're on a chama-specific route
  const isChamaRoute = pathname.includes(`/chama/${chamaId}`);

  // Common links for all routes
  const commonLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/loans", label: "Loans" },
    { path: "/contributions", label: "Contributions" },
    { path: "/withdrawals", label: "Withdrawals" }
  ];

  // Chama-specific links
  const chamaLinks = [
    { path: `/chama/${chamaId}/overview`, label: "Overview" },
    { path: `/chama/${chamaId}/transactions`, label: "Transactions" },
    { path: `/chama/${chamaId}/members`, label: "Members" }
  ];

  // Admin-only links
  const adminLinks = user?.role === "chairperson" ? [
    { path: `/chama/${chamaId}/admin`, label: "Admin Tools" }
  ] : [];

  return (
    <div className="sidebar-container">
      <h3 className="sidebar-title">
        {isChamaRoute ? "Chama Menu" : "Main Menu"}
      </h3>
      
      <ul className="sidebar-list">
        {/* Render appropriate links based on route */}
        {(isChamaRoute ? [...chamaLinks, ...adminLinks] : commonLinks).map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`sidebar-link ${
                pathname === link.path ? "active" : ""
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Additional chama-type specific tools */}
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