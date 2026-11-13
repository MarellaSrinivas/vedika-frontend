import { useEffect, useMemo, useState } from "react";
import {
    Search, RefreshCw, Eye, X, CalendarDays,
    Users, MapPin, CreditCard, ClipboardList, CheckCircle, Ban
} from "lucide-react";

import {
    getAdminBookings,
    getAdminBookingById, cancelAdminBooking, completeAdminBooking
} from "../../api/adminBookingApi";

 
import "./AdminBookings.css";

const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

const dateText = (value) => {
    if (!value) return "—";
    return new Date(`${value}`.length === 10 ? `${value}T00:00:00` : value)
        .toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
};

const statusClass = (value) =>
    String(value || "UNKNOWN").toLowerCase().replaceAll("_", "-");

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [bookingFilter, setBookingFilter] = useState("ALL");
    const [paymentFilter, setPaymentFilter] = useState("ALL");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const data = await getAdminBookings();

            setBookings(
                Array.isArray(data)
                    ? data
                    : data?.content || data?.bookings || []
            );
        } catch (error) {
            console.error("Unable to load admin bookings:", error);
            alert(error.response?.data?.message || "Unable to load bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const reference = booking.bookingReference || "";
            const customerName =
                booking.customerName || booking.customer?.fullName || "";
            const phone =
                booking.customerPhone || booking.customer?.phone || "";
            const farmhouseName =
                booking.farmhouseName || booking.farmhouse?.name || "";

            const query = search.trim().toLowerCase();

            const matchesSearch =
                !query ||
                reference.toLowerCase().includes(query) ||
                customerName.toLowerCase().includes(query) ||
                phone.toLowerCase().includes(query) ||
                farmhouseName.toLowerCase().includes(query);

            const matchesBooking =
                bookingFilter === "ALL" ||
                booking.bookingStatus === bookingFilter;

            const matchesPayment =
                paymentFilter === "ALL" ||
                booking.paymentStatus === paymentFilter;

            return matchesSearch && matchesBooking && matchesPayment;
        });
    }, [bookings, search, bookingFilter, paymentFilter]);

    const openDetails = async (booking) => {
        setSelectedBooking(booking);

        if (!booking.id) return;

        try {
            setDetailLoading(true);
            const detail = await getAdminBookingById(booking.id);
            setSelectedBooking(detail);
        } catch (error) {
            // Keep the list data visible if a separate detail endpoint is unavailable.
            console.error("Unable to load booking details:", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const stats = useMemo(() => ({
        total: bookings.length,
        pending: bookings.filter(
            (b) => b.bookingStatus === "PENDING_PAYMENT"
        ).length,
        confirmed: bookings.filter(
            (b) => b.bookingStatus === "CONFIRMED"
        ).length,
        cancelled: bookings.filter(
            (b) => b.bookingStatus === "CANCELLED"
        ).length
    }), [bookings]);


    const handleBookingAction = async (action, booking) => {
    const isCancel = action === "cancel";

    const confirmed = window.confirm(
        isCancel
            ? `Cancel booking ${booking.bookingReference}?`
            : `Mark booking ${booking.bookingReference} as completed?`
    );

    if (!confirmed) return;

    try {
        setActionLoading(true);

        if (isCancel) {
            await cancelAdminBooking(booking.id);
        } else {
            await completeAdminBooking(booking.id);
        }

        alert(
            isCancel
                ? "Booking cancelled successfully."
                : "Booking completed successfully."
        );

        setSelectedBooking(null);
        await loadBookings();

    } catch (error) {
        console.error("Booking action failed:", error);

        alert(
            error.response?.data?.message ||
            "Unable to update booking. Please try again."
        );
    } finally {
        setActionLoading(false);
    }
};

    return (
        <div className="admin-bookings-page">
            <div className="ab-header">
                <div>
                    <h1>Bookings</h1>
                    <p>View and monitor all farmhouse reservations.</p>
                </div>

                <button className="ab-refresh" onClick={loadBookings}>
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            <div className="ab-stats">
                <div>
                    <span>Total bookings</span>
                    <strong>{stats.total}</strong>
                </div>
                <div>
                    <span>Pending payment</span>
                    <strong>{stats.pending}</strong>
                </div>
                <div>
                    <span>Confirmed</span>
                    <strong>{stats.confirmed}</strong>
                </div>
                <div>
                    <span>Cancelled</span>
                    <strong>{stats.cancelled}</strong>
                </div>
            </div>

            <div className="ab-filters">
                <div className="ab-search">
                    <Search size={18} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search reference, customer, phone or farmhouse..."
                    />
                </div>

                <select
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                >
                    <option value="ALL">All booking statuses</option>
                    <option value="PENDING_PAYMENT">Pending payment</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                </select>

                <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                >
                    <option value="ALL">All payment statuses</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIALLY_PAID">Partially paid</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                </select>
            </div>

            {loading ? (
                <div className="ab-empty">Loading bookings...</div>
            ) : filteredBookings.length === 0 ? (
                <div className="ab-empty">No bookings found.</div>
            ) : (
                <div className="ab-table-wrap">
                    <table className="ab-table">
                        <thead>
                            <tr>
                                <th>Booking</th>
                                <th>Customer</th>
                                <th>Farmhouse</th>
                                <th>Stay dates</th>
                                <th>Guests</th>
                                <th>Total amount</th>
                                <th>Booking status</th>
                                <th>Payment</th>
                                <th>Details</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id || booking.bookingReference}>
                                    <td>
                                        <strong>{booking.bookingReference || `#${booking.id}`}</strong>
                                        <small>{dateText(booking.createdAt)}</small>
                                    </td>

                                    <td>
                                        <strong>
                                            {booking.customerName || booking.customer?.fullName || "Customer"}
                                        </strong>
                                        <small>
                                            {booking.customerPhone || booking.customer?.phone || "—"}
                                        </small>
                                    </td>

                                    <td>
                                        {booking.farmhouseName || booking.farmhouse?.name || "—"}
                                    </td>

                                    <td>
                                        {dateText(booking.checkIn)}
                                        <small>to {dateText(booking.checkOut)}</small>
                                    </td>

                                    <td>{booking.guests ?? "—"}</td>

                                    <td>
                                        <strong>{money(booking.totalAmount)}</strong>
                                        <small>Paid: {money(booking.amountPaid)}</small>
                                    </td>

                                    <td>
                                        <span className={`ab-status ${statusClass(booking.bookingStatus)}`}>
                                            {booking.bookingStatus || "UNKNOWN"}
                                        </span>
                                    </td>

                                    <td>
                                        <span className={`ab-status ${statusClass(booking.paymentStatus)}`}>
                                            {booking.paymentStatus || "UNKNOWN"}
                                        </span>
                                    </td>

                                    <td>
                                        <button
                                            className="ab-view-btn"
                                            onClick={() => openDetails(booking)}
                                            title="View booking"
                                        >
                                            <Eye size={17} />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedBooking && (
                <div className="ab-overlay" onClick={() => setSelectedBooking(null)}>
                    <div
                        className="ab-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="ab-modal-header">
                            <div>
                                <h2>Booking details</h2>
                                <p>{selectedBooking.bookingReference || `Booking #${selectedBooking.id}`}</p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)}>
                                <X size={21} />
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="ab-empty">Loading booking details...</div>
                        ) : (
                            <>
                                <div className="ab-detail-grid">
                                    <div className="ab-detail-card">
                                        <CalendarDays />
                                        <span>Check-in / Check-out</span>
                                        <strong>
                                            {dateText(selectedBooking.checkIn)} – {dateText(selectedBooking.checkOut)}
                                        </strong>
                                        <small>{selectedBooking.totalNights || selectedBooking.nights || "—"} night(s)</small>
                                    </div>

                                    <div className="ab-detail-card">
                                        <Users />
                                        <span>Guests</span>
                                        <strong>{selectedBooking.guests ?? "—"}</strong>
                                    </div>

                                    <div className="ab-detail-card">
                                        <MapPin />
                                        <span>Farmhouse</span>
                                        <strong>
                                            {selectedBooking.farmhouseName || selectedBooking.farmhouse?.name || "—"}
                                        </strong>
                                    </div>

                                    <div className="ab-detail-card">
                                        <ClipboardList />
                                        <span>Booking status</span>
                                        <strong>{selectedBooking.bookingStatus || "—"}</strong>
                                    </div>
                                </div>

                                <h3>Customer information</h3>
                                <div className="ab-info-row">
                                    <span>Name</span>
                                    <strong>{selectedBooking.customerName || selectedBooking.customer?.fullName || "—"}</strong>
                                </div>
                                <div className="ab-info-row">
                                    <span>Phone</span>
                                    <strong>{selectedBooking.customerPhone || selectedBooking.customer?.phone || "—"}</strong>
                                </div>

                                <h3>Payment summary</h3>
                                <div className="ab-info-row">
                                    <span>Accommodation</span>
                                    <strong>{money(selectedBooking.accommodationTotal)}</strong>
                                </div>
                                <div className="ab-info-row">
                                    <span>Add-ons</span>
                                    <strong>{money(selectedBooking.addonsTotal)}</strong>
                                </div>
                                <div className="ab-info-row">
                                    <span>Total amount</span>
                                    <strong>{money(selectedBooking.totalAmount)}</strong>
                                </div>
                                <div className="ab-info-row">
                                    <span>Amount paid</span>
                                    <strong>{money(selectedBooking.amountPaid)}</strong>
                                </div>
                                <div className="ab-info-row">
                                    <span>Balance due</span>
                                    <strong>{money(selectedBooking.balanceDue)}</strong>
                                </div>
                                <div className="ab-info-row">
                                    <span>Payment option / status</span>
                                    <strong>
                                        {selectedBooking.paymentOption || "—"} / {selectedBooking.paymentStatus || "—"}
                                    </strong>
                                </div>

                                {selectedBooking.specialRequests && (
                                    <>
                                        <h3>Special requests</h3>
                                        <p className="ab-special-requests">
                                            {selectedBooking.specialRequests}
                                        </p>
                                    </>
                                )}

                                <div className="ab-modal-footer">
                                    <span>
                                        <CreditCard size={16} />
                                        Admin view — no booking changes
                                    </span>
                                    <button onClick={() => setSelectedBooking(null)}>Close</button>
                                </div>

                                <div className="admin-booking-actions">

    {selectedBooking.bookingStatus === "PENDING_PAYMENT" && (
        <button
            className="admin-booking-cancel-btn"
            disabled={actionLoading}
            onClick={() =>
                handleBookingAction("cancel", selectedBooking)
            }
        >
            <Ban size={16} />
            {actionLoading ? "Processing..." : "Cancel Booking"}
        </button>
    )}

    {selectedBooking.bookingStatus === "CONFIRMED" && (
        <button
            className="admin-booking-complete-btn"
            disabled={actionLoading}
            onClick={() =>
                handleBookingAction("complete", selectedBooking)
            }
        >
            <CheckCircle size={16} />
            {actionLoading ? "Processing..." : "Mark Completed"}
        </button>
    )}

</div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}