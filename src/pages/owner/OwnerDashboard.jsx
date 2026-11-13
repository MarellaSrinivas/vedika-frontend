import { useEffect, useState } from "react";
import {
    Building2,
    CalendarCheck,
    CalendarClock,
    CheckCircle,
    IndianRupee,
    CreditCard,
    XCircle,
    Home
} from "lucide-react";

import { getOwnerDashboard } from "../../api/ownerDashboardApi";

import "./OwnerDashboard.css";

export default function OwnerDashboard() {

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getOwnerDashboard();
            setDashboard(data);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const stats = dashboard ? [
        {
            title: "Total Farmhouses",
            value: dashboard.totalFarmhouses,
            icon: Building2,
            color: "blue"
        },
        {
            title: "Active Properties",
            value: dashboard.activeFarmhouses,
            icon: Home,
            color: "green"
        },
        {
            title: "Total Bookings",
            value: dashboard.totalBookings,
            icon: CalendarCheck,
            color: "purple"
        },
        {
            title: "Pending Bookings",
            value: dashboard.pendingBookings,
            icon: CalendarClock,
            color: "orange"
        },
        {
            title: "Confirmed Bookings",
            value: dashboard.confirmedBookings,
            icon: CheckCircle,
            color: "green"
        },
        {
            title: "Completed Bookings",
            value: dashboard.completedBookings,
            icon: CheckCircle,
            color: "blue"
        },
        {
            title: "Cancelled Bookings",
            value: dashboard.cancelledBookings,
            icon: XCircle,
            color: "red"
        },
        {
            title: "Total Revenue",
            value: formatCurrency(dashboard.totalRevenue),
            icon: IndianRupee,
            color: "gold"
        }
    ] : [];

    if (loading) {
        return (
            <div className="owner-dashboard-loading">
                Loading your dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="owner-dashboard-error">
                <p>{error}</p>
                <button onClick={loadDashboard}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="owner-dashboard">

            <div className="owner-dashboard-header">
                <div>
                    <span className="owner-eyebrow">
                        OWNER PANEL
                    </span>

                    <h1>Dashboard Overview</h1>

                    <p>
                        Manage your properties and track your bookings.
                    </p>
                </div>

                <button
                    className="owner-refresh-btn"
                    onClick={loadDashboard}
                >
                    Refresh Dashboard
                </button>
            </div>

            <div className="owner-stats-grid">

                {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div className="owner-stat-card" key={item.title}>

                            <div className={`owner-stat-icon ${item.color}`}>
                                <Icon size={23} />
                            </div>

                            <div>
                                <p>{item.title}</p>
                                <h2>{item.value ?? 0}</h2>
                            </div>

                        </div>
                    );
                })}

            </div>

            <div className="owner-dashboard-bottom">

                <div className="owner-summary-card">
                    <CreditCard size={25} />

                    <div>
                        <p>Successful Payments</p>
                        <h2>{dashboard.successfulPayments}</h2>
                    </div>
                </div>

                <div className="owner-summary-card">
                    <IndianRupee size={25} />

                    <div>
                        <p>Total Payment Records</p>
                        <h2>{dashboard.totalPaymentRecords}</h2>
                    </div>
                </div>

                <div className="owner-summary-card">
                    <Home size={25} />

                    <div>
                        <p>Inactive Properties</p>
                        <h2>{dashboard.inactiveFarmhouses}</h2>
                    </div>
                </div>

            </div>

        </div>
    );
}