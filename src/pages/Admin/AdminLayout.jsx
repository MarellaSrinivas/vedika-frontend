
import { useState } from "react";
import {
    NavLink,
    Outlet,
    useNavigate
} from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    UserCheck,
    Home,
    CalendarDays,
    CreditCard,
    Menu,
    X,
    LogOut,
    ShieldCheck,
    ChevronRight
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const menuItems = [
    {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard
    },
    {
        label: "Owners",
        path: "/admin/owners",
        icon: UserCheck
    },
    {
        label: "Farmhouses",
        path: "/admin/farmhouses",
        icon: Home
    },
    {
        label: "Bookings",
        path: "/admin/bookings",
        icon: CalendarDays
    },
    {
        label: "Payments",
        path: "/admin/payments",
        icon: CreditCard
    },
    {
        label: "Customers",
        path: "/admin/customers",
        icon: Users
    }
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            if (logout) {
                await logout();
            }

            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Admin logout failed:", error);
        }
    };

    const adminName = user?.fullName || user?.name || "Administrator";

    const initials = adminName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    return (
        <div className="admin-layout">

            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>

                <div className="admin-sidebar-brand">
                    <div className="admin-brand-icon">
                        <ShieldCheck size={25} />
                    </div>

                    <div>
                        <h2>TheVedika</h2>
                        <span>ADMIN PANEL</span>
                    </div>

                    <button
                        className="admin-mobile-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={21} />
                    </button>
                </div>

                <div className="admin-sidebar-section">
                    <span className="admin-menu-heading">
                        MAIN MENU
                    </span>

                    <nav className="admin-navigation">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `admin-nav-link ${isActive ? "active" : ""}`
                                    }
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon size={19} />
                                    <span>{item.label}</span>
                                    <ChevronRight
                                        className="admin-nav-arrow"
                                        size={15}
                                    />
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="admin-sidebar-bottom">
                    <div className="admin-sidebar-user">
                        <div className="admin-user-avatar">
                            {initials || "AD"}
                        </div>

                        <div className="admin-user-details">
                            <strong>{adminName}</strong>
                            <span>Administrator</span>
                        </div>
                    </div>

                    <button
                        className="admin-logout-button"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>

            </aside>

            <main className="admin-main">

                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button
                            className="admin-mobile-menu"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={23} />
                        </button>

                        <div>
                            <span className="admin-topbar-label">
                                THEVEDIKA MANAGEMENT
                            </span>
                            <h3>Admin Portal</h3>
                        </div>
                    </div>

                    <div className="admin-topbar-profile">
                        <div className="admin-topbar-avatar">
                            {initials || "AD"}
                        </div>

                        <div>
                            <strong>{adminName}</strong>
                            <span>Super Admin</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}
