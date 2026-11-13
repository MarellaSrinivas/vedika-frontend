
import { useEffect, useState } from "react";
import {
    Users,
    UserCheck,
    Clock,
    Home,
    Building2,
    CalendarCheck,
     CheckCircle,
    XCircle,
    CreditCard,
    IndianRupee,
    RefreshCw,
    AlertCircle
} from "lucide-react";

import { getAdminDashboard } from "../../api/adminDashboardApi";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminDashboard();
            setDashboard(data);
        } catch (err) {
            console.error("Admin dashboard error:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load dashboard details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(Number(amount || 0));

    const statGroups = dashboard
        ? [
            {
                title: "Users",
                cards: [
                    {
                        label: "Total Customers",
                        value: dashboard.totalCustomers,
                        icon: Users,
                        color: "blue"
                    },
                    {
                        label: "Total Owners",
                        value: dashboard.totalOwners,
                        icon: UserCheck,
                        color: "purple"
                    },
                    {
                        label: "Pending Owners",
                        value: dashboard.pendingOwners,
                        icon: Clock,
                        color: "orange"
                    }
                ]
            },
            {
                title: "Farmhouses",
                cards: [
                    {
                        label: "Total Farmhouses",
                        value: dashboard.totalFarmhouses,
                        icon: Home,
                        color: "blue"
                    },
                    {
                        label: "Active Farmhouses",
                        value: dashboard.activeFarmhouses,
                        icon: Building2,
                        color: "green"
                    },
                    {
                        label: "Inactive Farmhouses",
                        value: dashboard.inactiveFarmhouses,
                        icon: AlertCircle,
                        color: "red"
                    }
                ]
            },
            {
                title: "Bookings",
                cards: [
                    {
                        label: "Total Bookings",
                        value: dashboard.totalBookings,
                        icon: CalendarCheck,
                        color: "blue"
                    },
                    {
                        label: "Pending Bookings",
                        value: dashboard.pendingBookings,
                        icon: Clock,
                        color: "orange"
                    },
                    {
                        label: "Confirmed Bookings",
                        value: dashboard.confirmedBookings,
                        icon: CheckCircle,
                        color: "green"
                    },
                    {
                        label: "Cancelled Bookings",
                        value: dashboard.cancelledBookings,
                        icon: XCircle,
                        color: "red"
                    },
                    {
                        label: "Completed Bookings",
                        value: dashboard.completedBookings,
                        icon: CheckCircle,
                        color: "purple"
                    }
                ]
            }
        ]
        : [];

    if (loading) {
        return (
            <div className="admin-dashboard-state">
                <RefreshCw className="loading-icon" size={28} />
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard-state admin-dashboard-error">
                <AlertCircle size={30} />
                <p>{error}</p>
                <button onClick={loadDashboard}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard-header">
                <div>
                    <span className="admin-eyebrow">OVERVIEW</span>
                    <h1>Admin Dashboard</h1>
                    <p>Monitor your platform's activity and performance.</p>
                </div>

                <button
                    className="admin-refresh-button"
                    onClick={loadDashboard}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {statGroups.map((group) => (
                <section className="admin-stat-section" key={group.title}>
                    <h2>{group.title}</h2>

                    <div className="admin-stat-grid">
                        {group.cards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <div className="admin-stat-card" key={card.label}>
                                    <div className={`admin-stat-icon ${card.color}`}>
                                        <Icon size={22} />
                                    </div>

                                    <div className="admin-stat-info">
                                        <p>{card.label}</p>
                                        <h3>{card.value ?? 0}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            <section className="admin-stat-section">
                <h2>Payments & Revenue</h2>

                <div className="admin-stat-grid admin-payment-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon green">
                            <CreditCard size={22} />
                        </div>
                        <div className="admin-stat-info">
                            <p>Total Payment Records</p>
                            <h3>{dashboard.totalPayments ?? 0}</h3>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon purple">
                            <IndianRupee size={22} />
                        </div>
                        <div className="admin-stat-info">
                            <p>Successful Payment Revenue</p>
                            <h3 className="revenue-value">
                                {formatCurrency(dashboard.successfulPaymentRevenue)}
                            </h3>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
