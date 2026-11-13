
import { useEffect, useMemo, useState } from "react";
import {
  IndianRupee,
  RefreshCw,
  Search,
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock3,
  XCircle,
  LoaderCircle,
  Eye,
  X,
  CalendarDays
} from "lucide-react";

import { getOwnerPayments } from "../../api/ownerDashboardApi";
import "./OwnerPayments.css";

const formatAmount = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const statusClass = (status = "") =>
  status.toLowerCase().replaceAll("_", "-");

export default function OwnerPayments() {
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

      const response = await getOwnerPayments();
      setPayments(Array.isArray(response) ? response : []);
    } catch (err) {
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
    const keyword = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !keyword ||
        payment.bookingReference?.toLowerCase().includes(keyword) ||
        payment.farmhouseName?.toLowerCase().includes(keyword) ||
        payment.customerName?.toLowerCase().includes(keyword) ||
        payment.customerPhone?.includes(keyword) ||
        payment.razorpayPaymentId?.toLowerCase().includes(keyword) ||
        payment.razorpayOrderId?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const summary = useMemo(() => {
    const successful = payments.filter(
      (payment) => payment.status === "SUCCESS"
    );

    const pending = payments.filter(
      (payment) => ["CREATED", "PENDING"].includes(payment.status)
    );

    const failed = payments.filter(
      (payment) => payment.status === "FAILED"
    );

    return {
      totalRecords: payments.length,
      successfulCount: successful.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      revenue: successful.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      )
    };
  }, [payments]);

  return (
    <div className="owner-payments-page">

      <div className="owner-payments-heading">
        <div>
          <span className="owner-eyebrow">FINANCIAL MANAGEMENT</span>
          <h1>Payments</h1>
          <p>Track payments and revenue from your farmhouse bookings.</p>
        </div>

        <button
          className="owner-payment-refresh"
          onClick={loadPayments}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="owner-payment-error">{error}</div>
      )}

      <div className="owner-payment-summary">

        <div className="owner-payment-summary-card revenue">
          <div className="owner-payment-summary-icon">
            <IndianRupee size={21} />
          </div>
          <span>Successful Payment Revenue</span>
          <strong>₹{formatAmount(summary.revenue)}</strong>
          <small>Based on successful payment records</small>
        </div>

        <div className="owner-payment-summary-card">
          <div className="owner-payment-summary-icon">
            <Receipt size={21} />
          </div>
          <span>Total Payment Records</span>
          <strong>{summary.totalRecords}</strong>
          <small>All transaction records</small>
        </div>

        <div className="owner-payment-summary-card">
          <div className="owner-payment-summary-icon success">
            <CheckCircle2 size={21} />
          </div>
          <span>Successful Payments</span>
          <strong>{summary.successfulCount}</strong>
          <small>Completed transactions</small>
        </div>

        <div className="owner-payment-summary-card">
          <div className="owner-payment-summary-icon pending">
            <Clock3 size={21} />
          </div>
          <span>Pending Payments</span>
          <strong>{summary.pendingCount}</strong>
          <small>Awaiting confirmation</small>
        </div>

        <div className="owner-payment-summary-card">
          <div className="owner-payment-summary-icon failed">
            <XCircle size={21} />
          </div>
          <span>Failed Payments</span>
          <strong>{summary.failedCount}</strong>
          <small>Unsuccessful transactions</small>
        </div>

      </div>

      <div className="owner-payment-toolbar">
        <div className="owner-payment-search">
          <Search size={18} />
          <input
            placeholder="Search booking, customer or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Payments</option>
          <option value="SUCCESS">Successful</option>
          <option value="CREATED">Created</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="owner-payment-loading">
          <LoaderCircle className="owner-payment-spin" size={30} />
          <p>Loading payment records...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="owner-payment-empty">
          <CreditCard size={46} />
          <h3>No payment records found</h3>
          <p>
            {payments.length === 0
              ? "Payments for your bookings will appear here."
              : "Try changing your search or payment status filter."}
          </p>
        </div>
      ) : (
        <div className="owner-payment-table-wrapper">
          <table className="owner-payment-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Booking Reference</th>
                <th>Customer</th>
                <th>Farmhouse</th>
                <th>Payment Option</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <strong>
                      {payment.razorpayPaymentId || "Not available"}
                    </strong>
                    <small>
                      Order: {payment.razorpayOrderId || "—"}
                    </small>
                  </td>

                  <td>
                    <strong>{payment.bookingReference || "—"}</strong>
                  </td>

                  <td>
                    <strong>{payment.customerName || "Customer"}</strong>
                    <small>{payment.customerPhone || "—"}</small>
                  </td>

                  <td>{payment.farmhouseName || "—"}</td>

                  <td>{payment.paymentOption || "—"}</td>

                  <td>
                    <strong>
                      ₹{formatAmount(payment.amount)}
                    </strong>
                    <small>{payment.currency || "INR"}</small>
                  </td>

                  <td>
                    <span className={`owner-payment-badge ${statusClass(payment.status)}`}>
                      {payment.status || "UNKNOWN"}
                    </span>
                  </td>

                  <td>{formatDate(payment.createdAt)}</td>

                  <td>
                    <button
                      className="owner-payment-view-btn"
                      onClick={() => setSelectedPayment(payment)}
                      title="View payment details"
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

      {selectedPayment && (
        <div
          className="owner-payment-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedPayment(null);
            }
          }}
        >
          <div className="owner-payment-modal">

            <div className="owner-payment-modal-header">
              <div>
                <span>PAYMENT DETAILS</span>
                <h2>{selectedPayment.bookingReference || "Payment"}</h2>
              </div>

              <button onClick={() => setSelectedPayment(null)}>
                <X size={22} />
              </button>
            </div>

            <div className="owner-payment-modal-body">

              <div className="owner-payment-amount-highlight">
                <span>Transaction Amount</span>
                <strong>
                  ₹{formatAmount(selectedPayment.amount)}
                </strong>
                <span className={`owner-payment-badge ${statusClass(selectedPayment.status)}`}>
                  {selectedPayment.status}
                </span>
              </div>

              <div className="owner-payment-detail-list">
                <div>
                  <span>Customer</span>
                  <strong>{selectedPayment.customerName || "—"}</strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>{selectedPayment.customerPhone || "—"}</strong>
                </div>

                <div>
                  <span>Farmhouse</span>
                  <strong>{selectedPayment.farmhouseName || "—"}</strong>
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
                  <span>Transaction Date</span>
                  <strong>
                    <CalendarDays size={15} />
                    {formatDate(selectedPayment.createdAt)}
                  </strong>
                </div>

                <div className="full">
                  <span>Razorpay Order ID</span>
                  <strong className="transaction-id">
                    {selectedPayment.razorpayOrderId || "—"}
                  </strong>
                </div>

                <div className="full">
                  <span>Razorpay Payment ID</span>
                  <strong className="transaction-id">
                    {selectedPayment.razorpayPaymentId || "Not available"}
                  </strong>
                </div>
              </div>

            </div>

            <div className="owner-payment-modal-footer">
              <button onClick={() => setSelectedPayment(null)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
