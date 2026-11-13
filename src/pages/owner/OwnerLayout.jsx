
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    PlusCircle,
    CalendarDays,
    CreditCard,
    UserRound,
    Home,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";

import "./OwnerLayout.css";

const menuItems = [
    {
        label: "Dashboard",
        path: "/owner/dashboard",
        icon: LayoutDashboard
    },
    {
        label: "My Farmhouses",
        path: "/owner/farmhouses",
        icon: Building2
    },
    {
        label: "Add Farmhouse",
        path: "/owner/farmhouses/add",
        icon: PlusCircle
    },
    {
        label: "Bookings",
        path: "/owner/bookings",
        icon: CalendarDays
    },
    {
        label: "Payments",
        path: "/owner/payments",
        icon: CreditCard
    },
    {
        label: "My Profile",
        path: "/owner/profile",
        icon: UserRound
    }
];

export default function OwnerLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    const closeSidebar = () => setMobileOpen(false);

    return (
        <div className="owner-layout">

            {mobileOpen && (
                <div
                    className="owner-sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            <aside className={`owner-sidebar ${mobileOpen ? "open" : ""}`}>

                <div className="owner-sidebar-brand">
                    <div className="owner-brand-icon">
                        <Home size={23} />
                    </div>

                    <div>
                        <h2>TheVedika</h2>
                        <span>OWNER PANEL</span>
                    </div>

                    <button
                        className="owner-mobile-close"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="owner-sidebar-label">
                    MANAGEMENT
                </div>

                <nav className="owner-sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/owner/dashboard"}
                                className={({ isActive }) =>
                                    `owner-nav-link ${isActive ? "active" : ""}`
                                }
                                onClick={closeSidebar}
                            >
                                <Icon size={19} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="owner-sidebar-bottom">
                    <div className="owner-help-card">
                        <h4>Need assistance?</h4>
                        <p>Contact TheVedika support team for help.</p>
                        <button
                            onClick={() => navigate("/")}
                        >
                            Visit Website
                        </button>
                    </div>
                </div>

            </aside>

            <main className="owner-main">

                <header className="owner-topbar">
                    <button
                        className="owner-mobile-menu"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={23} />
                    </button>

                    <div className="owner-topbar-title">
                        <span>THEVEDIKA</span>
                        <h3>Owner Workspace</h3>
                    </div>

                    <button
                        className="owner-website-btn"
                        onClick={() => navigate("/")}
                    >
                        Visit Website
                    </button>
                </header>

                <div className="owner-page-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}
