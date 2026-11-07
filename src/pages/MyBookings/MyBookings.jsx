
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  CreditCard,
  Clock3,
  ArrowRight,
  CalendarCheck,
  ClipboardList,
} from "lucide-react";

import "./MyBookings.css";

const STORAGE_KEY = "thevedika_demo_bookings";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (dateString) => {
  if (!dateString) return "Not available";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    try {
      const savedBookings = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      setBookings(Array.isArray(savedBookings) ? savedBookings : []);
    } catch {
      setBookings([]);
    }
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "ADVANCE") {
      return booking.paymentOption === "ADVANCE";
    }

    if (filter === "FULL") {
      return booking.paymentOption === "FULL";
    }

    return true;
  });

  const totalBookings = bookings.length;

  const totalPaid = bookings.reduce(
    (sum, booking) => sum + Number(booking.amountPaid || 0),
    0
  );

  const totalBalance = bookings.reduce(
    (sum, booking) => sum + Number(booking.balanceDue || 0),
    0
  );

  return (
    <main className="page my-bookings-page">
      <div className="container">
        <header className="my-bookings-header">
          <div>
            <p className="eyebrow">YOURVEDIKA JOURNEY</p>
            <h1 className="heading-font">My Bookings</h1>
            <p>
              View your farmhouse reservations and payment breakdowns.
            </p>
          </div>

          <Link to="/farmhouses" className="my-bookings-browse">
            Explore farmhouses <ArrowRight size={17} />
          </Link>
        </header>

        <div className="my-bookings-demo-notice">
          <Clock3 size={19} />
          <p>
            <strong>Frontend demo mode:</strong> these bookings are saved only
            in this browser. Payment statuses are simulated, not verified by
            Razorpay.
          </p>
        </div>

        <section className="my-bookings-stats">
          <article className="my-booking-stat">
            <span className="my-booking-stat-icon">
              <CalendarCheck size={21} />
            </span>
            <div>
              <p>Total bookings</p>
              <strong>{totalBookings}</strong>
            </div>
          </article>

          <article className="my-booking-stat">
            <span className="my-booking-stat-icon">
              <CreditCard size={21} />
            </span>
            <div>
              <p>Amount paid (demo)</p>
              <strong>{formatPrice(totalPaid)}</strong>
            </div>
          </article>

          <article className="my-booking-stat">
            <span className="my-booking-stat-icon">
              <Clock3 size={21} />
            </span>
            <div>
              <p>Balance at check-in</p>
              <strong>{formatPrice(totalBalance)}</strong>
            </div>
          </article>
        </section>

        <div className="my-bookings-toolbar">
          <div>
            <h2>Your reservations</h2>
            <p>
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "booking" : "bookings"} found
            </p>
          </div>

          <div className="my-bookings-filters">
            {[
              { label: "All bookings", value: "ALL" },
              { label: "Full payment", value: "FULL" },
              { label: "Advance payment", value: "ADVANCE" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={filter === option.value ? "active" : ""}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <section className="my-bookings-empty">
            <span>
              <ClipboardList size={36} />
            </span>

            <h2>
              {totalBookings === 0
                ? "No bookings yet"
                : "No bookings in this category"}
            </h2>

            <p>
              {totalBookings === 0
                ? "Your farmhouse bookings will appear here after you complete the booking demo."
                : "Try another payment filter to see your bookings."}
            </p>

            <Link to="/farmhouses" className="my-bookings-browse">
              Explore farmhouses <ArrowRight size={17} />
            </Link>
          </section>
        ) : (
          <section className="my-bookings-list">
            {filteredBookings.map((booking) => {
              const isAdvance = booking.paymentOption === "ADVANCE";

              return (
                <article
                  className="my-booking-card"
                  key={booking.bookingReference}
                >
                  <img
                    className="my-booking-image"
                    src={booking.image}
                    alt={booking.farmhouseName}
                  />

                  <div className="my-booking-content">
                    <div className="my-booking-title-row">
                      <div>
                        <p className="my-booking-reference">
                          Ref: {booking.bookingReference}
                        </p>
                        <h3>{booking.farmhouseName}</h3>
                        <p className="my-booking-location">
                          <MapPin size={15} />
                          {booking.location}
                        </p>
                      </div>

                      <span className="my-booking-demo-status">
                        DEMO
                      </span>
                    </div>

                    <div className="my-booking-details">
                      <div>
                        <CalendarDays size={17} />
                        <span>
                          {formatDate(booking.checkIn)} –{" "}
                          {formatDate(booking.checkOut)}
                        </span>
                      </div>

                      <div>
                        <Users size={17} />
                        <span>
                          {booking.guests}{" "}
                          {booking.guests === 1 ? "guest" : "guests"}
                        </span>
                      </div>

                      <div>
                        <CreditCard size={17} />
                        <span>
                          {isAdvance ? "₹1,000 advance" : "Full payment"}
                        </span>
                      </div>
                    </div>

                    <div className="my-booking-payment">
                      <div>
                        <span>Total amount</span>
                        <strong>{formatPrice(booking.totalAmount)}</strong>
                      </div>

                      <div>
                        <span>Paid (demo)</span>
                        <strong>{formatPrice(booking.amountPaid)}</strong>
                      </div>

                      <div>
                        <span>Due at check-in</span>
                        <strong>{formatPrice(booking.balanceDue)}</strong>
                      </div>
                    </div>

                    <div className="my-booking-footer">
                      <p>
                        Payment:{" "}
                        <strong>
                          {booking.paymentStatus || "DEMO_PAID"}
                        </strong>
                      </p>

                      <button
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        View details <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {selectedBooking && (
          <div
            className="my-booking-modal-backdrop"
            onClick={() => setSelectedBooking(null)}
            role="presentation"
          >
            <section
              className="my-booking-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="my-booking-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="my-booking-modal-close"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
              >
                ×
              </button>

              <p className="eyebrow">BOOKING DETAILS</p>
              <h2 id="my-booking-modal-title">
                {selectedBooking.farmhouseName}
              </h2>

              <p className="my-booking-modal-reference">
                {selectedBooking.bookingReference}
              </p>

              <div className="my-booking-modal-rows">
                <p>
                  <span>Guest</span>
                  <strong>{selectedBooking.customer?.fullName}</strong>
                </p>
                <p>
                  <span>Email</span>
                  <strong>{selectedBooking.customer?.email}</strong>
                </p>
                <p>
                  <span>Phone</span>
                  <strong>{selectedBooking.customer?.phone}</strong>
                </p>
                <p>
                  <span>Check-in</span>
                  <strong>{formatDate(selectedBooking.checkIn)}</strong>
                </p>
                <p>
                  <span>Check-out</span>
                  <strong>{formatDate(selectedBooking.checkOut)}</strong>
                </p>
                <p>
                  <span>Duration</span>
                  <strong>
                    {selectedBooking.nights}{" "}
                    {selectedBooking.nights === 1 ? "night" : "nights"}
                  </strong>
                </p>
                <p>
                  <span>Payment method</span>
                  <strong>
                    {selectedBooking.paymentOption === "ADVANCE"
                      ? "₹1,000 advance"
                      : "Full payment"}
                  </strong>
                </p>
                <p>
                  <span>Total booking amount</span>
                  <strong>{formatPrice(selectedBooking.totalAmount)}</strong>
                </p>
                <p>
                  <span>Amount paid (demo)</span>
                  <strong>{formatPrice(selectedBooking.amountPaid)}</strong>
                </p>
                <p>
                  <span>Balance at check-in</span>
                  <strong>{formatPrice(selectedBooking.balanceDue)}</strong>
                </p>
              </div>

              {selectedBooking.specialRequests && (
                <div className="my-booking-special-requests">
                  <span>Special requests</span>
                  <p>{selectedBooking.specialRequests}</p>
                </div>
              )}

              <Link
                to={`/booking-confirmation/${selectedBooking.bookingReference}`}
                state={{ booking: selectedBooking }}
                className="my-bookings-browse"
              >
                Open confirmation <ArrowRight size={17} />
              </Link>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
