
import { useEffect, useMemo, useState } from "react";
import {
    CreditCard,
    Search,
    RefreshCw,
    Eye,
    X,
    IndianRupee,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";

import {
    getAdminPayments
} from "../../api/adminPaymentApi";

import "./AdminPayments.css";

export default function AdminPayments() {

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedPayment, setSelectedPayment] = useState(null);

    const loadPayments = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminPayments();

            setPayments(
                Array.isArray(data) ? data : data?.content || []
            );
        } catch (err) {
            console.error("Failed to load payments:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load payment records."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {

            const searchText = search.toLowerCase();

            const matchesSearch = [
                payment.bookingReference,
                payment.farmhouseName,
                payment.customerName,
                payment.customerPhone,
                payment.razorpayOrderId,
                payment.razorpayPaymentId
            ].some((value) =>
                String(value || "").toLowerCase().includes(searchText)
            );

            const matchesStatus =
                statusFilter === "ALL" ||
                String(payment.status || "").toUpperCase() === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [payments, search, statusFilter]);

    const successfulPayments = payments.filter(
        (p) => String(p.status).toUpperCase() === "SUCCESS"
    );

    const totalRevenue = successfulPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
    );

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(Number(amount || 0));

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusClass = (status) => {
        const value = String(status || "").toUpperCase();

        if (value === "SUCCESS") return "success";
        if (value === "CREATED" || value === "PENDING") return "pending";
        if (value === "FAILED") return "failed";

        return "default";
    };

    return (
        <div className="admin-payments-page">

            <div className="admin-page-heading">
                <div>
                    <span className="admin-eyebrow">FINANCIAL MANAGEMENT</span>
                    <h1>Payments</h1>
                    <p>Monitor all booking transactions and Razorpay payments.</p>
                </div>

                <button
                    className="admin-refresh-btn"
                    onClick={loadPayments}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="admin-payment-stats">

                <div className="admin-payment-stat">
                    <div className="admin-stat-icon blue">
                        <CreditCard />
                    </div>
                    <div>
                        <span>Total Transactions</span>
                        <h2>{payments.length}</h2>
                    </div>
                </div>

                <div className="admin-payment-stat">
                    <div className="admin-stat-icon green">
                        <CheckCircle />
                    </div>
                    <div>
                        <span>Successful Payments</span>
                        <h2>{successfulPayments.length}</h2>
                    </div>
                </div>

                <div className="admin-payment-stat">
                    <div className="admin-stat-icon gold">
                        <IndianRupee />
                    </div>
                    <div>
                        <span>Total Revenue</span>
                        <h2>{formatCurrency(totalRevenue)}</h2>
                    </div>
                </div>

                <div className="admin-payment-stat">
                    <div className="admin-stat-icon orange">
                        <Clock />
                    </div>
                    <div>
                        <span>Pending Transactions</span>
                        <h2>
                            {payments.filter(
                                (p) =>
                                    ["CREATED", "PENDING"].includes(
                                        String(p.status).toUpperCase()
                                    )
                            ).length}
                        </h2>
                    </div>
                </div>

            </div>

            <div className="admin-payment-toolbar">

                <div className="admin-payment-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search booking, customer or Razorpay ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="SUCCESS">Success</option>
                    <option value="CREATED">Created</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                </select>

            </div>

            {error && (
                <div className="admin-payment-error">
                    {error}
                    <button onClick={loadPayments}>Try again</button>
                </div>
            )}

            <div className="admin-payment-table-card">

                <div className="admin-payment-table-heading">
                    <h3>Transaction History</h3>
                    <span>{filteredPayments.length} records</span>
                </div>

                {loading ? (
                    <div className="admin-payment-loading">
                        Loading payments...
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="admin-payment-empty">
                        <CreditCard size={36} />
                        <h3>No payments found</h3>
                        <p>Payment transactions will appear here.</p>
                    </div>
                ) : (
                    <div className="admin-payment-table-scroll">
                        <table className="admin-payment-table">
                            <thead>
                                <tr>
                                    <th>Transaction</th>
                                    <th>Booking</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Payment Type</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>
                                            <strong>PAY-{payment.id}</strong>
                                            <small>
                                                {payment.razorpayPaymentId || payment.razorpayOrderId || "—"}
                                            </small>
                                        </td>

                                        <td>
                                            <strong>
                                                {payment.bookingReference || "—"}
                                            </strong>
                                            <small>
                                                {payment.farmhouseName || "—"}
                                            </small>
                                        </td>

                                        <td>
                                            <strong>
                                                {payment.customerName || "—"}
                                            </strong>
                                            <small>
                                                {payment.customerPhone || "—"}
                                            </small>
                                        </td>

                                        <td>
                                            <strong>
                                                {formatCurrency(payment.amount)}
                                            </strong>
                                        </td>

                                        <td>
                                            {payment.paymentOption || "—"}
                                        </td>

                                        <td>{formatDate(payment.createdAt)}</td>

                                        <td>
                                            <span className={`admin-payment-status ${getStatusClass(payment.status)}`}>
                                                {payment.status || "UNKNOWN"}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="admin-payment-view-btn"
                                                onClick={() => setSelectedPayment(payment)}
                                                title="View payment"
                                            >
                                                <Eye size={17} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

            {selectedPayment && (
                <div
                    className="admin-payment-modal-overlay"
                    onClick={() => setSelectedPayment(null)}
                >
                    <div
                        className="admin-payment-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-payment-modal-header">
                            <div>
                                <span>TRANSACTION DETAILS</span>
                                <h2>PAY-{selectedPayment.id}</h2>
                            </div>

                            <button onClick={() => setSelectedPayment(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="admin-payment-modal-body">

                            <div className="admin-payment-amount">
                                <span>Transaction Amount</span>
                                <h1>
                                    {formatCurrency(selectedPayment.amount)}
                                </h1>
                                <span className={`admin-payment-status ${getStatusClass(selectedPayment.status)}`}>
                                    {selectedPayment.status || "UNKNOWN"}
                                </span>
                            </div>

                            <div className="admin-payment-detail-grid">
                                <div>
                                    <span>Booking Reference</span>
                                    <strong>{selectedPayment.bookingReference || "—"}</strong>
                                </div>

                                <div>
                                    <span>Farmhouse</span>
                                    <strong>{selectedPayment.farmhouseName || "—"}</strong>
                                </div>

                                <div>
                                    <span>Customer</span>
                                    <strong>{selectedPayment.customerName || "—"}</strong>
                                </div>

                                <div>
                                    <span>Phone</span>
                                    <strong>{selectedPayment.customerPhone || "—"}</strong>
                                </div>

                                <div>
                                    <span>Payment Option</span>
                                    <strong>{selectedPayment.paymentOption || "—"}</strong>
                                </div>

                                <div>
                                    <span>Currency</span>
                                    <strong>{selectedPayment.currency || "INR"}</strong>
                                </div>

                                <div>
                                    <span>Razorpay Order ID</span>
                                    <strong>{selectedPayment.razorpayOrderId || "—"}</strong>
                                </div>

                                <div>
                                    <span>Razorpay Payment ID</span>
                                    <strong>{selectedPayment.razorpayPaymentId || "—"}</strong>
                                </div>

                                <div>
                                    <span>Created At</span>
                                    <strong>{formatDate(selectedPayment.createdAt)}</strong>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
