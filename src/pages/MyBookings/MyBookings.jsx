
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  Moon,
  Wallet,
  ArrowRight,
  LoaderCircle,
  RefreshCw,
  Receipt,
} from "lucide-react";

import { getMyBookings } from "../../api/bookingApi";

import "./MyBookings.css";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const getStatusClass = (status) => {
  const value = (status || "").toUpperCase();

  if (["CONFIRMED", "PAID", "SUCCESS", "COMPLETED"].includes(value)) {
    return "booking-status-success";
  }

  if (["CANCELLED", "FAILED", "REFUNDED"].includes(value)) {
    return "booking-status-danger";
  }

  return "booking-status-pending";
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyBookings();

      setBookings(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your bookings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.filter((booking) => {
      const status = (booking.bookingStatus || "").toUpperCase();

      if (activeFilter === "CANCELLED") {
        return status.includes("CANCEL");
      }

      if (activeFilter === "UPCOMING") {
        return (
          !status.includes("CANCEL") &&
          new Date(`${booking.checkOut}T00:00:00`) >= today
        );
      }

      if (activeFilter === "PAST") {
        return (
          !status.includes("CANCEL") &&
          new Date(`${booking.checkOut}T00:00:00`) < today
        );
      }

      return true;
    });
  }, [bookings, activeFilter]);

  const totalPaid = bookings.reduce(
    (sum, booking) => sum + Number(booking.amountPaid || 0),
    0
  );

  const totalBalance = bookings.reduce(
    (sum, booking) => sum + Number(booking.balanceDue || 0),
    0
  );

  if (loading) {
    return (
      <div className="my-bookings-loading">
        <LoaderCircle size={35} className="booking-spin" />
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">

        <div className="my-bookings-header">
          <div>
            <span className="bookings-eyebrow">YOUR VEDIKA JOURNEY</span>
            <h1>My Bookings</h1>
            <p>Manage your farmhouse reservations and payments.</p>
          </div>

          <Link to="/farmhouses" className="explore-bookings-btn">
            Explore Farmhouses
            <ArrowRight size={17} />
          </Link>
        </div>

        {error && (
          <div className="bookings-error">
            <p>{error}</p>
            <button onClick={loadBookings}>
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {!error && (
          <>
            <div className="booking-summary-grid">
              <div className="booking-summary-card">
                <CalendarDays size={23} />
                <div>
                  <span>Total Bookings</span>
                  <strong>{bookings.length}</strong>
                </div>
              </div>

              <div className="booking-summary-card">
                <Wallet size={23} />
                <div>
                  <span>Total Paid</span>
                  <strong>{formatCurrency(totalPaid)}</strong>
                </div>
              </div>

              <div className="booking-summary-card">
                <Receipt size={23} />
                <div>
                  <span>Balance Due</span>
                  <strong>{formatCurrency(totalBalance)}</strong>
                </div>
              </div>
            </div>

            <div className="bookings-filter-section">
              <div className="bookings-filter-heading">
                <h2>Your Reservations</h2>
                <span>{filteredBookings.length} bookings</span>
              </div>

              <div className="bookings-filter-tabs">
                {[
                  { label: "All Bookings", value: "ALL" },
                  { label: "Upcoming", value: "UPCOMING" },
                  { label: "Past", value: "PAST" },
                  { label: "Cancelled", value: "CANCELLED" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    className={
                      activeFilter === filter.value ? "active" : ""
                    }
                    onClick={() => setActiveFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="no-bookings">
                <div className="no-bookings-icon">
                  <CalendarDays size={35} />
                </div>

                <h2>
                  {bookings.length === 0
                    ? "No bookings yet"
                    : "No bookings found"}
                </h2>

                <p>
                  {bookings.length === 0
                    ? "Your farmhouse reservations will appear here once you make a booking."
                    : "There are no bookings in this category."}
                </p>

                {bookings.length === 0 && (
                  <Link to="/farmhouses">
                    Explore Farmhouses
                    <ArrowRight size={17} />
                  </Link>
                )}
              </div>
            ) : (
              <div className="booking-list">
                {filteredBookings.map((booking) => (
                  <article
                    className="my-booking-card"
                    key={booking.bookingReference}
                  >
                    <div className="my-booking-top">
                      <div>
                        <span className="booking-reference-label">
                          BOOKING REFERENCE
                        </span>
                        <strong className="booking-reference">
                          {booking.bookingReference}
                        </strong>
                      </div>

                      <span
                        className={`booking-status-badge ${getStatusClass(
                          booking.bookingStatus
                        )}`}
                      >
                        {(booking.bookingStatus || "PENDING").replaceAll(
                          "_",
                          " "
                        )}
                      </span>
                    </div>

                    <div className="my-booking-main">
                      <div className="my-booking-info">
                        <h3>{booking.farmhouseName || "Farmhouse"}</h3>

                        <p className="booking-location">
                          <MapPin size={16} />
                          {booking.location || "Location unavailable"}
                        </p>

                        <div className="booking-detail-grid">
                          <div>
                            <CalendarDays size={17} />
                            <div>
                              <span>Check-in</span>
                              <strong>{formatDate(booking.checkIn)}</strong>
                            </div>
                          </div>

                          <div>
                            <CalendarDays size={17} />
                            <div>
                              <span>Check-out</span>
                              <strong>{formatDate(booking.checkOut)}</strong>
                            </div>
                          </div>

                          <div>
                            <Users size={17} />
                            <div>
                              <span>Guests</span>
                              <strong>{booking.guests || 0} Guests</strong>
                            </div>
                          </div>

                          <div>
                            <Moon size={17} />
                            <div>
                              <span>Duration</span>
                              <strong>{booking.nights || 0} Nights</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="my-booking-payment">
                        <span className="payment-heading">
                          PAYMENT SUMMARY
                        </span>

                        <div className="payment-row">
                          <span>Total Amount</span>
                          <strong>{formatCurrency(booking.totalAmount)}</strong>
                        </div>

                        <div className="payment-row">
                          <span>Amount Paid</span>
                          <strong className="paid-amount">
                            {formatCurrency(booking.amountPaid)}
                          </strong>
                        </div>

                        <div className="payment-row">
                          <span>Balance Due</span>
                          <strong className="balance-amount">
                            {formatCurrency(booking.balanceDue)}
                          </strong>
                        </div>

                        <div className="payment-status-row">
                          <span>Payment Status</span>
                          <span
                            className={`booking-status-badge ${getStatusClass(
                              booking.paymentStatus
                            )}`}
                          >
                            {(booking.paymentStatus || "UNPAID").replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        </div>

                        <div className="payment-option">
                          Payment Option:{" "}
                          <strong>
                            {(booking.paymentOption || "N/A").replaceAll(
                              "_",
                              " "
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="my-booking-footer">
                      <span>
                        Booked on{" "}
                        {booking.createdAt
                          ? new Date(booking.createdAt).toLocaleDateString(
                              "en-IN"
                            )
                          : "N/A"}
                      </span>

                      <Link
                        to={`/booking-confirmation/${encodeURIComponent(
                          booking.bookingReference
                        )}`}
                      >
                        View Booking
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
