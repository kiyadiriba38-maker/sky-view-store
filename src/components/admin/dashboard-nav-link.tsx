import { Link } from "@payloadcms/ui";

import adminHe from "@/lib/intl/admin.he.json";

import "./dashboard-nav-link.scss";

export const DashboardNavLink = () => (
  <div className="dashboard-nav-link">
    <Link className="nav__link" href="/admin">
      <span className="nav__link-label">
        {adminHe.navigationLinks.dashboard.en}
      </span>
    </Link>
  </div>
);
