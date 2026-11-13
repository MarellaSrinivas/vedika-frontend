
import { useEffect, useMemo, useState } from "react";
import {
    Users,
    Search,
    RefreshCw,
    Eye,
    X,
    UserCheck,
    UserX,
    Phone,
    Mail,
    CalendarDays
} from "lucide-react";

import { getAdminCustomers, activateAdminCustomer,
    deactivateAdminCustomer } from "../../api/adminCustomerApi";
import "./AdminCustomers.css";

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [actionLoading, setActionLoading] = useState(false);


    const loadCustomers = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminCustomers();
            setCustomers(
                Array.isArray(data) ? data : data?.content || []
            );
        } catch (err) {
            console.error("Failed to load customers:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load customers."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const handleCustomerStatus = async (customer) => {
    const currentlyActive = customer.active;

    const action = currentlyActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
        `Are you sure you want to ${action} ${customer.fullName || customer.name}?`
    );

    if (!confirmed) return;

    try {
        setActionLoading(true);

        if (currentlyActive) {
            await deactivateAdminCustomer(customer.id);
        } else {
            await activateAdminCustomer(customer.id);
        }

        alert(`Customer ${action}d successfully.`);

        await loadCustomers();
    } catch (error) {
        alert(
            error.response?.data?.message ||
            error.response?.data?.detail ||
            `Unable to ${action} customer`
        );
    } finally {
        setActionLoading(false);
    }
};

    const filteredCustomers = useMemo(() => {
        return customers.filter((customer) => {
            const searchText = search.toLowerCase();

            const matchesSearch = [
                customer.fullName,
                customer.phone,
                customer.email
            ].some((value) =>
                String(value || "").toLowerCase().includes(searchText)
            );

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && customer.active) ||
                (statusFilter === "INACTIVE" && !customer.active);

            return matchesSearch && matchesStatus;
        });
    }, [customers, search, statusFilter]);

    const activeCount = customers.filter((c) => c.active).length;
    const inactiveCount = customers.length - activeCount;

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const initials = (name) =>
        String(name || "C")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();

    return (
        <div className="admin-customers-page">

            <div className="admin-page-heading">
                <div>
                    <span className="admin-eyebrow">CUSTOMER MANAGEMENT</span>
                    <h1>Customers</h1>
                    <p>View and manage customers registered on The Vedika.</p>
                </div>

                <button
                    className="admin-refresh-btn"
                    onClick={loadCustomers}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="admin-customer-stats">

                <div className="admin-customer-stat">
                    <div className="admin-customer-stat-icon blue">
                        <Users />
                    </div>
                    <div>
                        <span>Total Customers</span>
                        <h2>{customers.length}</h2>
                    </div>
                </div>

                <div className="admin-customer-stat">
                    <div className="admin-customer-stat-icon green">
                        <UserCheck />
                    </div>
                    <div>
                        <span>Active Customers</span>
                        <h2>{activeCount}</h2>
                    </div>
                </div>

                <div className="admin-customer-stat">
                    <div className="admin-customer-stat-icon orange">
                        <UserX />
                    </div>
                    <div>
                        <span>Inactive Customers</span>
                        <h2>{inactiveCount}</h2>
                    </div>
                </div>

            </div>

            <div className="admin-customer-toolbar">

                <div className="admin-customer-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search customer by name, phone or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Customers</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>

            </div>

            {error && (
                <div className="admin-customer-error">
                    {error}
                    <button onClick={loadCustomers}>Try again</button>
                </div>
            )}

            <div className="admin-customer-table-card">

                <div className="admin-customer-table-heading">
                    <h3>Customer Directory</h3>
                    <span>{filteredCustomers.length} customers</span>
                </div>

                {loading ? (
                    <div className="admin-customer-loading">
                        Loading customers...
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="admin-customer-empty">
                        <Users size={38} />
                        <h3>No customers found</h3>
                        <p>Try changing your search or filters.</p>
                    </div>
                ) : (
                    <div className="admin-customer-table-scroll">
                        <table className="admin-customer-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Joined Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>
                                            <div className="admin-customer-identity">
                                                <div className="admin-customer-avatar">
                                                    {initials(customer.fullName)}
                                                </div>
                                                <div>
                                                    <strong>
                                                        {customer.fullName || "Unnamed Customer"}
                                                    </strong>
                                                    <small>Customer #{customer.id}</small>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{customer.phone || "—"}</td>
                                        <td>{customer.email || "—"}</td>
                                        <td>{formatDate(customer.createdAt)}</td>

                                        <td>
                                            <span className={`admin-customer-status ${customer.active ? "active" : "inactive"}`}>
                                                {customer.active ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="admin-customer-view-btn"
                                                onClick={() => setSelectedCustomer(customer)}
                                                title="View customer"
                                            >
                                                <Eye size={17} />
                                            </button>

                                            <button
    type="button"
    className={
        customer.active
            ? "admin-customer-deactivate-btn"
            : "admin-customer-activate-btn"
    }
    disabled={actionLoading}
    onClick={() => handleCustomerStatus(customer)}
>
    {customer.active ? "Deactivate" : "Activate"}
</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

            {selectedCustomer && (
                <div
                    className="admin-customer-modal-overlay"
                    onClick={() => setSelectedCustomer(null)}
                >
                    <div
                        className="admin-customer-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-customer-modal-header">
                            <div>
                                <span>CUSTOMER PROFILE</span>
                                <h2>Customer #{selectedCustomer.id}</h2>
                            </div>

                            <button onClick={() => setSelectedCustomer(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="admin-customer-modal-body">

                            <div className="admin-customer-profile">
                                <div className="admin-customer-avatar large">
                                    {initials(selectedCustomer.fullName)}
                                </div>
                                <h3>{selectedCustomer.fullName || "Unnamed Customer"}</h3>
                                <span className={`admin-customer-status ${selectedCustomer.active ? "active" : "inactive"}`}>
                                    {selectedCustomer.active ? "Active Account" : "Inactive Account"}
                                </span>
                            </div>

                            <div className="admin-customer-detail-list">
                                <div>
                                    <Phone size={17} />
                                    <section>
                                        <span>Phone Number</span>
                                        <strong>{selectedCustomer.phone || "—"}</strong>
                                    </section>
                                </div>

                                <div>
                                    <Mail size={17} />
                                    <section>
                                        <span>Email Address</span>
                                        <strong>{selectedCustomer.email || "—"}</strong>
                                    </section>
                                </div>

                                <div>
                                    <CalendarDays size={17} />
                                    <section>
                                        <span>Registration Date</span>
                                        <strong>{formatDate(selectedCustomer.createdAt)}</strong>
                                    </section>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
