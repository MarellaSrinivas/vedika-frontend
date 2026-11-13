
import { useEffect, useMemo, useState } from "react";
import {
    Users,
    UserCheck,
    Clock,
    Search,
    RefreshCw,
    CheckCircle,
    XCircle,
    Eye,
    X,
    Mail,
    Phone,
    CalendarDays,
    AlertCircle
} from "lucide-react";

import {
    getAllOwners,
    getPendingOwners,
    approveOwner,
    rejectOwner
} from "../../api/adminOwnerApi";

import "./AdminOwners.css";

export default function AdminOwners() {
    const [owners, setOwners] = useState([]);
    const [activeTab, setActiveTab] = useState("ALL");
    const [search, setSearch] = useState("");
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadOwners = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                activeTab === "PENDING"
                    ? await getPendingOwners()
                    : await getAllOwners();

            const list = Array.isArray(data)
                ? data
                : data?.content || data?.owners || [];

            setOwners(list);
        } catch (err) {
            console.error("Loading owners failed:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load owner registrations."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOwners();
    }, [activeTab]);

    const filteredOwners = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return owners;

        return owners.filter((owner) =>
            [
                owner.fullName,
                owner.name,
                owner.phone,
                owner.email,
                owner.id
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(keyword)
                )
        );
    }, [owners, search]);

    const pendingCount = owners.filter(
        (owner) => owner.approved === false || owner.approved === null
    ).length;

    const handleOwnerAction = async (owner, action) => {
        const ownerId = owner.id;

        if (!ownerId) {
            setError("Owner ID is missing. Cannot update this application.");
            return;
        }

        const ownerName = owner.fullName || owner.name || "this owner";

        const confirmed = window.confirm(
            action === "APPROVE"
                ? `Approve ${ownerName}'s registration?`
                : `Reject ${ownerName}'s registration?`
        );

        if (!confirmed) return;

        try {
            setActionLoading(ownerId);
            setError("");
            setSuccess("");

            if (action === "APPROVE") {
                await approveOwner(ownerId);
                setSuccess(`${ownerName} has been approved successfully.`);
            } else {
                await rejectOwner(ownerId);
                setSuccess(`${ownerName}'s application has been rejected.`);
            }

            setSelectedOwner(null);
            await loadOwners();
        } catch (err) {
            console.error("Owner action failed:", err);
            setError(
                err.response?.data?.message ||
                `Unable to ${action.toLowerCase()} this owner.`
            );
        } finally {
            setActionLoading(null);
        }
    };

    const getOwnerStatus = (owner) => {
        if (owner.active === false) return "REJECTED";
        if (owner.approved === true) return "APPROVED";
        return "PENDING";
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) return "—";

        return parsed.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="admin-owners-page">

            <div className="admin-owners-header">
                <div>
                    <span className="admin-owners-eyebrow">
                        USER MANAGEMENT
                    </span>
                    <h1>Owners Management</h1>
                    <p>Review and manage farmhouse owner registrations.</p>
                </div>

                <button
                    className="owners-refresh-btn"
                    onClick={loadOwners}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="owners-summary-grid">
                <div className="owners-summary-card">
                    <div className="owners-summary-icon blue">
                        <Users size={22} />
                    </div>
                    <div>
                        <span>Owners displayed</span>
                        <h3>{owners.length}</h3>
                    </div>
                </div>

                <div className="owners-summary-card">
                    <div className="owners-summary-icon orange">
                        <Clock size={22} />
                    </div>
                    <div>
                        <span>Pending in current list</span>
                        <h3>{pendingCount}</h3>
                    </div>
                </div>

                <div className="owners-summary-card">
                    <div className="owners-summary-icon green">
                        <UserCheck size={22} />
                    </div>
                    <div>
                        <span>Approved in current list</span>
                        <h3>
                            {owners.filter((owner) => owner.approved === true).length}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="owners-toolbar">
                <div className="owners-tabs">
                    <button
                        className={activeTab === "ALL" ? "active" : ""}
                        onClick={() => setActiveTab("ALL")}
                    >
                        All Owners
                    </button>

                    <button
                        className={activeTab === "PENDING" ? "active" : ""}
                        onClick={() => setActiveTab("PENDING")}
                    >
                        Pending Applications
                    </button>
                </div>

                <div className="owners-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search name, phone or email..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="owners-alert error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button onClick={() => setError("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {success && (
                <div className="owners-alert success">
                    <CheckCircle size={18} />
                    <span>{success}</span>
                    <button onClick={() => setSuccess("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="owners-table-container">
                {loading ? (
                    <div className="owners-state">
                        <RefreshCw className="owners-loading-icon" size={25} />
                        <p>Loading owners...</p>
                    </div>
                ) : filteredOwners.length === 0 ? (
                    <div className="owners-state">
                        <Users size={35} />
                        <h3>No owners found</h3>
                        <p>
                            {search
                                ? "Try another search term."
                                : "There are no owner registrations in this section."}
                        </p>
                    </div>
                ) : (
                    <div className="owners-table-scroll">
                        <table className="owners-table">
                            <thead>
                                <tr>
                                    <th>OWNER</th>
                                    <th>PHONE</th>
                                    <th>EMAIL</th>
                                    <th>REGISTERED</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredOwners.map((owner) => {
                                    const status = getOwnerStatus(owner);
                                    const busy = actionLoading === owner.id;

                                    return (
                                        <tr key={owner.id}>
                                            <td>
                                                <div className="owner-table-name">
                                                    <div className="owner-table-avatar">
                                                        {(owner.fullName || owner.name || "O")
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <strong>
                                                            {owner.fullName || owner.name || "Unnamed owner"}
                                                        </strong>
                                                        <span>#{owner.id}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>{owner.phone || "—"}</td>
                                            <td>{owner.email || "—"}</td>
                                            <td>{formatDate(owner.createdAt)}</td>

                                            <td>
                                                <span className={`owner-status-badge ${status.toLowerCase()}`}>
                                                    {status}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="owner-actions">
                                                    <button
                                                        className="owner-view-btn"
                                                        title="View details"
                                                        onClick={() => setSelectedOwner(owner)}
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {status === "PENDING" && (
                                                        <>
                                                            <button
                                                                className="owner-approve-btn"
                                                                title="Approve owner"
                                                                disabled={busy}
                                                                onClick={() => handleOwnerAction(owner, "APPROVE")}
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>

                                                            <button
                                                                className="owner-reject-btn"
                                                                title="Reject owner"
                                                                disabled={busy}
                                                                onClick={() => handleOwnerAction(owner, "REJECT")}
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedOwner && (
                <div
                    className="owner-modal-backdrop"
                    onClick={() => setSelectedOwner(null)}
                >
                    <div
                        className="owner-details-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="owner-modal-header">
                            <div>
                                <span>OWNER PROFILE</span>
                                <h2>Owner Details</h2>
                            </div>

                            <button onClick={() => setSelectedOwner(null)}>
                                <X size={21} />
                            </button>
                        </div>

                        <div className="owner-modal-profile">
                            <div className="owner-modal-avatar">
                                {(selectedOwner.fullName || selectedOwner.name || "O")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <h3>
                                    {selectedOwner.fullName ||
                                        selectedOwner.name ||
                                        "Unnamed owner"}
                                </h3>
                                <span className={`owner-status-badge ${getOwnerStatus(selectedOwner).toLowerCase()}`}>
                                    {getOwnerStatus(selectedOwner)}
                                </span>
                            </div>
                        </div>

                        <div className="owner-detail-row">
                            <Phone size={17} />
                            <div>
                                <span>Phone number</span>
                                <strong>{selectedOwner.phone || "Not provided"}</strong>
                            </div>
                        </div>

                        <div className="owner-detail-row">
                            <Mail size={17} />
                            <div>
                                <span>Email address</span>
                                <strong>{selectedOwner.email || "Not provided"}</strong>
                            </div>
                        </div>

                        <div className="owner-detail-row">
                            <CalendarDays size={17} />
                            <div>
                                <span>Registration date</span>
                                <strong>{formatDate(selectedOwner.createdAt)}</strong>
                            </div>
                        </div>

                        {getOwnerStatus(selectedOwner) === "PENDING" && (
                            <div className="owner-modal-actions">
                                <button
                                    className="owner-modal-approve"
                                    disabled={actionLoading === selectedOwner.id}
                                    onClick={() => handleOwnerAction(selectedOwner, "APPROVE")}
                                >
                                    <CheckCircle size={17} />
                                    Approve Owner
                                </button>

                                <button
                                    className="owner-modal-reject"
                                    disabled={actionLoading === selectedOwner.id}
                                    onClick={() => handleOwnerAction(selectedOwner, "REJECT")}
                                >
                                    <XCircle size={17} />
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
