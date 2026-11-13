
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  Search,
  RefreshCw,
  LoaderCircle,
  Eye,
  X,
  IndianRupee
} from "lucide-react";

import { getOwnerBookings } from "../../api/ownerDashboardApi";
import "./OwnerBookings.css";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatAmount = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });

const getStatusClass = (status = "") =>
  status.toLowerCase().replaceAll("_", "-");

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOwnerBookings();
      setBookings(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !keyword ||
        booking.bookingReference?.toLowerCase().includes(keyword) ||
        booking.farmhouseName?.toLowerCase().includes(keyword) ||
        booking.customerName?.toLowerCase().includes(keyword) ||
        booking.customerPhone?.includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        booking.bookingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const counts = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(
      (b) => b.bookingStatus === "PENDING_PAYMENT"
    ).length,
    confirmed: bookings.filter(
      (b) => b.bookingStatus === "CONFIRMED"
    ).length,
    completed: bookings.filter(
      (b) => b.bookingStatus === "COMPLETED"
    ).length,
    cancelled: bookings.filter(
      (b) => b.bookingStatus === "CANCELLED"
    ).length
  }), [bookings]);

  return (
    <div className="owner-bookings-page">

      <div className="owner-bookings-heading">
        <div>
          <span className="owner-eyebrow">RESERVATION MANAGEMENT</span>
          <h1>Bookings</h1>
          <p>View and manage reservations for your properties.</p>
        </div>

        <button
          className="owner-refresh-btn"
          onClick={loadBookings}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="owner-booking-stats">
        <div>
          <span>Total Bookings</span>
          <strong>{counts.total}</strong>
        </div>
        <div>
          <span>Pending Payment</span>
          <strong>{counts.pending}</strong>
        </div>
        <div>
          <span>Confirmed</span>
          <strong>{counts.confirmed}</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>{counts.completed}</strong>
        </div>
        <div>
          <span>Cancelled</span>
          <strong>{counts.cancelled}</strong>
        </div>
      </div>

      <div className="owner-booking-toolbar">
        <div className="owner-booking-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search booking, customer or farmhouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Bookings</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="owner-booking-error">{error}</div>
      )}

      {loading ? (
        <div className="owner-booking-loading">
          <LoaderCircle className="owner-spin" size={30} />
          <p>Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="owner-booking-empty">
          <CalendarDays size={45} />
          <h3>No bookings found</h3>
          <p>
            {bookings.length === 0
              ? "Bookings for your properties will appear here."
              : "Try changing your search or status filter."}
          </p>
        </div>
      ) : (
        <div className="owner-booking-table-wrapper">
          <table className="owner-booking-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Customer</th>
                <th>Farmhouse</th>
                <th>Stay</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.bookingReference}</strong>
                    <small>
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </small>
                  </td>

                  <td>
                    <strong>{booking.customerName || "Customer"}</strong>
                    <small>{booking.customerPhone || "—"}</small>
                  </td>

                  <td>{booking.farmhouseName || "—"}</td>

                  <td>
                    <strong>{formatDate(booking.checkIn)}</strong>
                    <small>to {formatDate(booking.checkOut)}</small>
                  </td>

                  <td>{booking.guests ?? "—"}</td>

                  <td>
                    <strong>₹{formatAmount(booking.totalAmount)}</strong>
                    <small>
                      Paid: ₹{formatAmount(booking.amountPaid)}
                    </small>
                  </td>

                  <td>
                    <span className={`owner-payment-status ${getStatusClass(booking.paymentStatus)}`}>
                      {booking.paymentStatus || "UNPAID"}
                    </span>
                  </td>

                  <td>
                    <span className={`owner-booking-status ${getStatusClass(booking.bookingStatus)}`}>
                      {(booking.bookingStatus || "UNKNOWN").replaceAll("_", " ")}
                    </span>
                  </td>

                  <td>
                    <button
                      className="owner-view-booking-btn"
                      title="View booking details"
                      onClick={() => setSelectedBooking(booking)}
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

      {selectedBooking && (
        <div
          className="owner-booking-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedBooking(null);
            }
          }}
        >
          <div className="owner-booking-modal">

            <div className="owner-booking-modal-header">
              <div>
                <span>BOOKING DETAILS</span>
                <h2>{selectedBooking.bookingReference}</h2>
              </div>

              <button onClick={() => setSelectedBooking(null)}>
                <X size={22} />
              </button>
            </div>

            <div className="owner-booking-modal-body">

              <div className="owner-booking-detail-section">
                <h3>Customer Information</h3>
                <div className="owner-detail-grid">
                  <div>
                    <small>Customer Name</small>
                    <strong>{selectedBooking.customerName || "—"}</strong>
                  </div>
                  <div>
                    <small>Phone Number</small>
                    <strong>{selectedBooking.customerPhone || "—"}</strong>
                  </div>
                </div>
              </div>

              <div className="owner-booking-detail-section">
                <h3>Property & Stay</h3>

                <div className="owner-detail-grid">
                  <div>
                    <small>Farmhouse</small>
                    <strong>{selectedBooking.farmhouseName || "—"}</strong>
                  </div>

                  <div>
                    <small>Guests</small>
                    <strong>
                      <Users size={15} />
                      {selectedBooking.guests ?? "—"} Guests
                    </strong>
                  </div>

                  <div>
                    <small>Check-in</small>
                    <strong>
                      <CalendarDays size={15} />
                      {formatDate(selectedBooking.checkIn)}
                    </strong>
                  </div>

                  <div>
                    <small>Check-out</small>
                    <strong>
                      <CalendarDays size={15} />
                      {formatDate(selectedBooking.checkOut)}
                    </strong>
                  </div>

                  <div>
                    <small>Total Nights</small>
                    <strong>{selectedBooking.totalNights ?? "—"}</strong>
                  </div>
                </div>
              </div>

              <div className="owner-booking-detail-section">
                <h3>Payment Summary</h3>

                <div className="owner-payment-breakdown">
                  <div>
                    <span>Accommodation</span>
                    <strong>₹{formatAmount(selectedBooking.accommodationTotal)}</strong>
                  </div>

                  <div>
                    <span>Add-ons</span>
                    <strong>₹{formatAmount(selectedBooking.addonsTotal)}</strong>
                  </div>

                  <div>
                    <span>Total Amount</span>
                    <strong>₹{formatAmount(selectedBooking.totalAmount)}</strong>
                  </div>

                  <div>
                    <span>Amount Paid</span>
                    <strong className="paid">
                      ₹{formatAmount(selectedBooking.amountPaid)}
                    </strong>
                  </div>

                  <div>
                    <span>Balance Due</span>
                    <strong className="balance">
                      ₹{formatAmount(selectedBooking.balanceDue)}
                    </strong>
                  </div>

                  <div>
                    <span>Payment Option</span>
                    <strong>{selectedBooking.paymentOption || "—"}</strong>
                  </div>
                </div>
              </div>

              <div className="owner-booking-detail-section">
                <h3>Booking Status</h3>

                <div className="owner-detail-grid">
                  <div>
                    <small>Booking</small>
                    <strong>
                      {(selectedBooking.bookingStatus || "UNKNOWN").replaceAll("_", " ")}
                    </strong>
                  </div>

                  <div>
                    <small>Payment</small>
                    <strong>
                      {selectedBooking.paymentStatus || "UNPAID"}
                    </strong>
                  </div>
                </div>
              </div>

            </div>

            <div className="owner-booking-modal-footer">
              <button onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
