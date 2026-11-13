import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    CalendarDays,
    CreditCard,
    UserRound,
    LogOut,
    Menu,
    X,
    Home
} from "lucide-react";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

import "./OwnerLayout.css";

export default function OwnerLayout() {

    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/owner/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "My Farmhouses",
            path: "/owner/farmhouses",
            icon: Building2
        },
        {
            name: "Bookings",
            path: "/owner/bookings",
            icon: CalendarDays
        },
        {
            name: "Payments",
            path: "/owner/payments",
            icon: CreditCard
        },
        {
            name: "Profile",
            path: "/owner/profile",
            icon: UserRound
        }
    ];

    const handleLogout = async () => {
        try {
            if (logout) {
                await logout();
            }
        } finally {
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="owner-layout">

            {/* Mobile header */}
            <header className="owner-mobile-header">

                <button
                    className="owner-menu-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                >
                    {menuOpen ? <X /> : <Menu />}
                </button>

                <h2>TheVedika</h2>

            </header>

            {/* Sidebar */}
            <aside className={`owner-sidebar ${menuOpen ? "open" : ""}`}>

                <div className="owner-sidebar-brand">
                    <div className="owner-brand-icon">
                        <Home size={24} />
                    </div>

                    <div>
                        <h2>TheVedika</h2>
                        <span>OWNER PANEL</span>
                    </div>
                </div>

                <div className="owner-sidebar-user">
                    <div className="owner-user-avatar">
                        {user?.fullName?.charAt(0)?.toUpperCase() || "O"}
                    </div>

                    <div>
                        <h4>{user?.fullName || "Property Owner"}</h4>
                        <span>Property Owner</span>
                    </div>
                </div>

                <nav className="owner-sidebar-nav">

                    <p className="owner-nav-label">MAIN MENU</p>

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
                                onClick={() => setMenuOpen(false)}
                            >
                                <Icon size={19} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}

                </nav>

                <div className="owner-sidebar-bottom">

                    <button
                        className="owner-logout-btn"
                        onClick={handleLogout}
                    >
                        <LogOut size={19} />
                        <span>Logout</span>
                    </button>

                    <p>© 2026 TheVedika</p>

                </div>

            </aside>

            {/* Mobile overlay */}
            {menuOpen && (
                <div
                    className="owner-sidebar-overlay"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="owner-main-content">

                <div className="owner-topbar">
                    <div>
                        <span>OWNER PORTAL</span>
                        <h3>Welcome, {user?.fullName || "Owner"}</h3>
                    </div>

                    <div className="owner-topbar-profile">
                        <div className="owner-user-avatar">
                            {user?.fullName?.charAt(0)?.toUpperCase() || "O"}
                        </div>
                    </div>
                </div>

                <div className="owner-page-content">
                    <Outlet />
                </div>

            </main>

        </div>
    );
}