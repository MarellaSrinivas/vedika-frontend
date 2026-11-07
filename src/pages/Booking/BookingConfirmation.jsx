import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  CalendarDays,
  MapPin,
  Users,
  CreditCard,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";

import api from "../../api/api";
import "./BookingConfirmation.css";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function BookingConfirmation() {
  const { reference } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/bookings/${reference}`);

        const data = response.data?.data || response.data;

        if (!cancelled) {
          setBooking(data);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load this booking. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBooking();

    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (loading) {
    return (
      <main className="page container confirmation-page">
        <div className="confirmation-card">
          <LoaderCircle className="booking-spinner" size={32} />
          <h1>Loading your booking...</h1>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="page container confirmation-page">
        <div className="confirmation-card">
          <AlertTriangle size={46} color="#ad741d" />
          <h1>Booking details unavailable</h1>
          <p>{error || "We could not find this booking."}</p>

          <Link
            to="/farmhouses"
            className="confirmation-primary-link"
          >
            Browse farmhouses
          </Link>
        </div>
      </main>
    );
  }

  const total = Number(booking.totalAmount || 0);
  const paid = Number(booking.amountPaid || 0);
  const balance = Number(
    booking.balanceDue ?? Math.max(0, total - paid)
  );

  const isConfirmed = booking.bookingStatus === "CONFIRMED";
  const isPaid = booking.paymentStatus === "PAID";
  const isPartial = booking.paymentStatus === "PARTIALLY_PAID";

  return (
    <main className="page container confirmation-page">
      <div className="confirmation-card">
        {isConfirmed ? (
          <CheckCircle2
            className="confirmation-success-icon"
            size={60}
          />
        ) : (
          <Clock3
            className="confirmation-pending-icon"
            size={60}
          />
        )}

        <p className="eyebrow">THE VEDIKA BOOKING</p>

        <h1 className="heading-font">
          {isConfirmed
            ? "Your booking is confirmed!"
            : "Booking payment is pending"}
        </h1>

        <p className="confirmation-intro">
          {isConfirmed
            ? "Your payment has been verified by our server. Your reservation details are below."
            : "Your reservation has not yet been confirmed. Please contact support if you have completed the payment."}
        </p>

        {!isConfirmed && (
          <div className="confirmation-pending-note">
            <AlertTriangle size={20} />
            <p>
              <strong>Confirmation pending</strong>
              <br />
              Do not assume your reservation is confirmed until the payment
              status is verified.
            </p>
          </div>
        )}

        <div className="confirmation-reference">
          <span>Booking reference</span>
          <strong>{booking.bookingReference || reference}</strong>
        </div>

        <div className="confirmation-property">
          <div>
            <h2>{booking.farmhouseName}</h2>
            <p>
              <MapPin size={15} />
              {booking.location}
            </p>
          </div>
        </div>

        <div className="confirmation-details-grid">
          <div>
            <CalendarDays size={19} />
            <span>Check-in</span>
            <strong>{formatDate(booking.checkIn)}</strong>
          </div>

          <div>
            <CalendarDays size={19} />
            <span>Check-out</span>
            <strong>{formatDate(booking.checkOut)}</strong>
          </div>

          <div>
            <Users size={19} />
            <span>Guests</span>
            <strong>{booking.guests}</strong>
          </div>

          <div>
            <Clock3 size={19} />
            <span>Duration</span>
            <strong>
              {booking.nights ??
                Math.max(
                  0,
                  Math.round(
                    (new Date(booking.checkOut) -
                      new Date(booking.checkIn)) /
                      86400000
                  )
                )}{" "}
              nights
            </strong>
          </div>
        </div>

        <div className="confirmation-payment">
          <h3>
            <CreditCard size={19} />
            Payment summary
          </h3>

          <div>
            <span>Accommodation</span>
            <strong>
              {formatPrice(booking.accommodationTotal)}
            </strong>
          </div>

          {Number(booking.addonsTotal || 0) > 0 && (
            <div>
              <span>Additional services</span>
              <strong>{formatPrice(booking.addonsTotal)}</strong>
            </div>
          )}

          <div>
            <span>Total booking amount</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <div>
            <span>Payment option</span>
            <strong>
              {booking.paymentOption === "ADVANCE"
                ? "₹1,000 advance"
                : "Full payment"}
            </strong>
          </div>

          <div>
            <span>Amount paid</span>
            <strong>{formatPrice(paid)}</strong>
          </div>

          <div className="confirmation-balance">
            <span>Remaining balance</span>
            <strong>{formatPrice(balance)}</strong>
          </div>

          <div>
            <span>Payment status</span>
            <strong>
              {isPaid
                ? "PAID"
                : isPartial
                  ? "PARTIALLY PAID"
                  : booking.paymentStatus}
            </strong>
          </div>

          <div>
            <span>Booking status</span>
            <strong>{booking.bookingStatus}</strong>
          </div>
        </div>

        {isConfirmed && balance > 0 && (
          <div className="confirmation-balance-note">
            <Clock3 size={20} />
            <p>
              <strong>Remaining balance</strong>
              <br />
              {formatPrice(balance)} is still outstanding. Please follow
              the property's payment policy for the remaining amount.
            </p>
          </div>
        )}

        {isConfirmed && balance === 0 && (
          <div className="confirmation-balance-note">
            <CheckCircle2 size={20} />
            <p>
              <strong>Payment completed</strong>
              <br />
              Your full booking amount has been paid successfully.
            </p>
          </div>
        )}

        {booking.specialRequests && (
          <div className="confirmation-customer">
            <h3>Special requests</h3>
            <p>{booking.specialRequests}</p>
          </div>
        )}

        <div className="confirmation-actions">
          <Link
            to="/farmhouses"
            className="confirmation-primary-link"
          >
            Explore more farmhouses
          </Link>

          <Link
            to="/"
            className="confirmation-secondary-link"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}