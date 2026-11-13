
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Users,
  IndianRupee,
  ArrowRight,
  Info,
  ChevronLeft,
  ChevronRight,
  Flame,
  CookingPot,
  Utensils,
} from "lucide-react";
import { getFarmhouseCalendar } from "../api/farmhouseApi";
import "./FarmhouseAvailability.css";

const MIN_GUESTS = 5;
const DEFAULT_EXTRA_GUEST_PRICE = 500;
const DAYS_TO_SHOW = 4;

function localDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseLocalDate(value) {
  if (!value) return null;

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatDate(dateString) {
  if (!dateString) return "Select date";

  const date = parseLocalDate(dateString);
  if (!date) return "Select date";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function unwrapCalendarResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.calendar)) return response.calendar;
  if (Array.isArray(response?.days)) return response.days;

  return [];
}

function isCalendarDayAvailable(day) {
  if (day?.available === false) return false;

  const status = String(day?.status || "").toUpperCase();

  if (
    ["BOOKED", "UNAVAILABLE", "BLOCKED", "NOT_AVAILABLE"].includes(status)
  ) {
    return false;
  }

  return true;
}

function getPricingLabel(day) {
  const type = String(day?.pricingType || "").toUpperCase();

  if (type.includes("SPECIAL")) return "Special price";
  if (type.includes("WEEKEND")) return "Weekend price";

  return "";
}

function getNightlyPrice(calendarDay, farmhouse, guests) {
  // Calendar price is the backend's date-specific base rate.
  const baseRate = Number(
    calendarDay?.price ?? farmhouse.basePrice ?? farmhouse.price ?? 0
  );

  const minimumGuests = Math.max(
    1,
    Number(farmhouse.minimumGuests ?? MIN_GUESTS)
  );

  const extraGuests = Math.max(0, guests - minimumGuests);

  const extraGuestPrice = Number(
    farmhouse.extraGuestPrice ?? DEFAULT_EXTRA_GUEST_PRICE
  );

  return baseRate + extraGuests * extraGuestPrice;
}

function getAddOnAmount(addOn, guests) {
  const pricingType = String(addOn.pricingType || "")
    .replaceAll("_", "")
    .toLowerCase();

  const price = Number(addOn.price || 0);

  return pricingType === "perguest" ? price * guests : price;
}

function AddOnIcon({ item }) {
  const name = `${item.name || ""} ${item.icon || ""}`.toLowerCase();

  if (name.includes("gas") || name.includes("cook")) {
    return <CookingPot size={19} />;
  }

  if (name.includes("bbq") || name.includes("barbecue")) {
    return <Flame size={19} />;
  }

  return <Utensils size={19} />;
}

export default function FarmhouseAvailability({ farmhouse }) {
  const navigate = useNavigate();

  const [calendar, setCalendar] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState("");

  const [dateWindowStart, setDateWindowStart] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [nights, setNights] = useState(1);

  const minimumGuests = Math.max(
    1,
    Number(farmhouse.minimumGuests ?? MIN_GUESTS)
  );

  const maxGuests = Math.max(
    minimumGuests,
    Number(farmhouse.maximumGuests ?? farmhouse.guests ?? 15)
  );

  const [guests, setGuests] = useState(minimumGuests);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [error, setError] = useState("");

  // Keep the guest selection valid when the farmhouse changes.
  useEffect(() => {
    setGuests(minimumGuests);
    setCheckIn("");
    setNights(1);
    setSelectedAddOns([]);
    setDateWindowStart(0);
  }, [farmhouse.id, minimumGuests]);

  // Fetch actual calendar data from the backend.
  useEffect(() => {
    let cancelled = false;

    async function loadCalendar() {
      setCalendarLoading(true);
      setCalendarError("");

      try {
        const response = await getFarmhouseCalendar(farmhouse.id);
        const days = unwrapCalendarResponse(response)
          .filter((day) => day?.date)
          .map((day) => ({
            ...day,
            date: String(day.date).slice(0, 10),
            price: Number(day.price || 0),
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        if (!cancelled) {
          setCalendar(days);

          if (days.length === 0) {
            setCalendarError(
              "Calendar dates are not available right now. Please try again."
            );
          }
        }
      } catch (err) {
        console.error("Failed to load farmhouse calendar:", err);

        if (!cancelled) {
          setCalendar([]);
          setCalendarError(
            err.response?.data?.message ||
              "Unable to load availability. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setCalendarLoading(false);
        }
      }
    }

    if (farmhouse?.id) {
      loadCalendar();
    }

    return () => {
      cancelled = true;
    };
  }, [farmhouse.id]);

  const calendarByDate = useMemo(() => {
    return new Map(calendar.map((day) => [day.date, day]));
  }, [calendar]);

  const visibleDates = calendar.slice(
    dateWindowStart,
    dateWindowStart + DAYS_TO_SHOW
  );

  const canGoBack = dateWindowStart > 0;
  const canGoForward =
    dateWindowStart + DAYS_TO_SHOW < calendar.length;

  const checkOut = checkIn
    ? localDateString(
        addDays(parseLocalDate(checkIn), nights)
      )
    : "";

  const availableAddOns = useMemo(() => {
    const list = farmhouse.addOns || farmhouse.addons || [];

    return Array.isArray(list)
      ? list.filter(
          (item) =>
            item.available !== false &&
            item.id !== undefined &&
            item.id !== null
        )
      : [];
  }, [farmhouse.addOns, farmhouse.addons]);

  const occupiedNights = useMemo(() => {
    if (!checkIn || nights < 1) return [];

    const start = parseLocalDate(checkIn);

    return Array.from({ length: nights }, (_, index) =>
      localDateString(addDays(start, index))
    );
  }, [checkIn, nights]);

  const blockedStayDate = occupiedNights.find((date) => {
    const day = calendarByDate.get(date);

    return !day || !isCalendarDayAvailable(day);
  });

  const priceBreakdown = useMemo(() => {
    if (!checkIn || nights < 1) return [];

    return occupiedNights.map((date) => {
      const calendarDay = calendarByDate.get(date);

      return {
        date,
        calendarDay,
        price: calendarDay
          ? getNightlyPrice(calendarDay, farmhouse, guests)
          : 0,
      };
    });
  }, [occupiedNights, calendarByDate, farmhouse, guests, checkIn, nights]);

  const accommodationTotal = priceBreakdown.reduce(
    (sum, night) => sum + night.price,
    0
  );

  const selectedAddOnItems = availableAddOns.filter((item) =>
    selectedAddOns.includes(String(item.id))
  );

  const addOnsTotal = selectedAddOnItems.reduce(
    (sum, item) => sum + getAddOnAmount(item, guests),
    0
  );

  const totalPrice = accommodationTotal + addOnsTotal;

  function isBooked(dateString) {
    const day = calendarByDate.get(dateString);

    return !day || !isCalendarDayAvailable(day);
  }

  function selectCheckIn(dateString) {
    if (isBooked(dateString)) return;

    setCheckIn(dateString);
    setNights(1);
    setError("");
  }

  function handleContinue() {
    setError("");

    if (!checkIn) {
      setError("Please select your check-in date.");
      return;
    }

    if (guests < minimumGuests || guests > maxGuests) {
      setError(
        `Choose between ${minimumGuests} and ${maxGuests} guests.`
      );
      return;
    }

    if (blockedStayDate) {
      setError(
        `${formatDate(blockedStayDate)} is not available. Please choose different dates or a shorter stay.`
      );
      return;
    }

    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
      nights: String(nights),
      total: String(totalPrice),
      addOns: selectedAddOnItems
        .map((item) => item.id)
        .join(","),
    });

    navigate(`/booking/${farmhouse.id}?${params.toString()}`);
  }

  return (
    <section className="availability-card" id="availability">
      <div className="availability-heading">
        <div>
          <span className="availability-eyebrow">
            CHECK YOUR DATES
          </span>
          <h2>Availability & pricing</h2>
          <p>
            Browse available dates. Choose a check-in date, then
            select your nights.
          </p>
        </div>

        <div className="availability-calendar-icon">
          <CalendarDays size={23} />
        </div>
      </div>

      <div className="availability-legend">
        <span>
          <i className="availability-dot available-dot" />
          Available
        </span>
        <span>
          <i className="availability-dot booked-dot" />
          Booked
        </span>
        <span>
          <i className="availability-dot selected-dot" />
          Check-in
        </span>
      </div>

      {calendarLoading ? (
        <div className="availability-loading">
          Loading live availability...
        </div>
      ) : calendarError ? (
        <div className="availability-error" role="alert">
          {calendarError}
        </div>
      ) : (
        <>
          <div className="availability-slider-controls">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={() =>
                setDateWindowStart((value) =>
                  Math.max(0, value - DAYS_TO_SHOW)
                )
              }
              aria-label="Previous dates"
            >
              <ChevronLeft size={18} />
            </button>

            <span>
              {formatDate(visibleDates[0]?.date)} –{" "}
              {formatDate(
                visibleDates[visibleDates.length - 1]?.date
              )}
            </span>

            <button
              type="button"
              disabled={!canGoForward}
              onClick={() =>
                setDateWindowStart((value) =>
                  Math.min(
                    calendar.length - DAYS_TO_SHOW,
                    value + DAYS_TO_SHOW
                  )
                )
              }
              aria-label="Next dates"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="availability-calendar">
            {visibleDates.map((day) => {
              const date = parseLocalDate(day.date);
              const booked = !isCalendarDayAvailable(day);
              const selected = checkIn === day.date;
              const price = getNightlyPrice(day, farmhouse, guests);
              const pricingLabel = getPricingLabel(day);

              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={booked}
                  onClick={() => selectCheckIn(day.date)}
                  className={`availability-date ${
                    booked ? "is-booked" : "is-available"
                  } ${selected ? "is-date-endpoint" : ""}`}
                  aria-label={`${formatDate(day.date)}, ${
                    booked ? "booked" : "available"
                  }, ${formatPrice(price)} per night`}
                  title={
                    booked
                      ? "Booked"
                      : `${formatPrice(price)} per night`
                  }
                >
                  <span className="availability-day-name">
                    {date?.toLocaleDateString("en-IN", {
                      weekday: "short",
                    })}
                  </span>

                  <strong>{date?.getDate()}</strong>

                  <span className="availability-date-price">
                    {booked ? (
                      <XCircle size={13} />
                    ) : (
                      formatPrice(price)
                    )}
                  </span>

                  <span className="availability-status">
                    {booked
                      ? "Booked"
                      : selected
                      ? "Check-in"
                      : "Available"}
                  </span>

                  {!booked && pricingLabel && (
                    <small className="availability-pricing-label">
                      {pricingLabel}
                    </small>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="availability-notice">
        <Info size={17} />
        <p>
          Check-in is at {farmhouse.checkInTime || "2:00 PM"}.
          Checkout is at {farmhouse.checkOutTime || "11:00 AM"}.
          Prices are based on the selected dates and guest count.
        </p>
      </div>

      <div className="availability-selection">
        <div className="availability-selection-heading">
          <h3>Your stay</h3>

          <label className="availability-nights-control">
            <CalendarDays size={16} />
            <select
              aria-label="Number of nights"
              value={nights}
              onChange={(event) => {
                setNights(Number(event.target.value));
                setError("");
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? "night" : "nights"}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="availability-date-summary">
          <div>
            <label>CHECK-IN</label>
            <strong>{formatDate(checkIn)}</strong>
            <small>
              {farmhouse.checkInTime || "2:00 PM"}
            </small>
          </div>

          <div className="availability-date-divider">
            <ArrowRight size={17} />
          </div>

          <div>
            <label>CHECKOUT</label>
            <strong>{formatDate(checkOut)}</strong>
            <small>
              {farmhouse.checkOutTime || "11:00 AM"}
            </small>
          </div>
        </div>

        <label
          className="availability-guests-label"
          htmlFor="availability-guests"
        >
          <Users size={17} />
          Number of guests
        </label>

        <select
          id="availability-guests"
          className="availability-guests-select"
          value={guests}
          onChange={(event) => {
            setGuests(Number(event.target.value));
            setError("");
          }}
        >
          {Array.from(
            { length: maxGuests - minimumGuests + 1 },
            (_, index) => minimumGuests + index
          ).map((count) => (
            <option key={count} value={count}>
              {count} guests
              {count === minimumGuests ? " — Base fare" : ""}
            </option>
          ))}
        </select>

        <p className="availability-extra-guests">
          Base fare covers {minimumGuests} guests. Each additional
          guest costs{" "}
          {formatPrice(
            farmhouse.extraGuestPrice ?? DEFAULT_EXTRA_GUEST_PRICE
          )}{" "}
          per night.
        </p>

        <label className="availability-guests-label">
          <CookingPot size={17} />
          Optional essential services
        </label>

        <div className="availability-addons">
          {availableAddOns.length > 0 ? (
            availableAddOns.map((item) => {
              const itemId = String(item.id);
              const checked = selectedAddOns.includes(itemId);
              const pricingType = String(item.pricingType || "")
                .replaceAll("_", "")
                .toLowerCase();

              return (
                <label
                  className={`availability-addon ${
                    checked ? "is-selected" : ""
                  }`}
                  key={itemId}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setSelectedAddOns((current) =>
                        checked
                          ? current.filter((id) => id !== itemId)
                          : [...current, itemId]
                      );
                      setError("");
                    }}
                  />

                  <span className="availability-addon-icon">
                    <AddOnIcon item={item} />
                  </span>

                  <span className="availability-addon-copy">
                    <strong>{item.name}</strong>
                    <small>{item.description}</small>
                    <small>
                      {pricingType === "perguest"
                        ? `${formatPrice(item.price)} per guest`
                        : "One-time charge per stay"}
                    </small>
                  </span>

                  <strong className="availability-addon-price">
                    {formatPrice(getAddOnAmount(item, guests))}
                  </strong>
                </label>
              );
            })
          ) : (
            <p>No additional services are currently available.</p>
          )}
        </div>
      </div>

      {priceBreakdown.length > 0 && (
        <div className="availability-price-breakdown">
          <h3>Price breakdown</h3>

          {priceBreakdown.map((night) => (
            <div
              key={night.date}
              className="availability-price-row"
            >
              <span>
                {formatDate(night.date)} accommodation
              </span>
              <strong>{formatPrice(night.price)}</strong>
            </div>
          ))}

          {selectedAddOnItems.map((item) => (
            <div
              key={item.id}
              className="availability-price-row"
            >
              <span>{item.name}</span>
              <strong>
                {formatPrice(getAddOnAmount(item, guests))}
              </strong>
            </div>
          ))}

          <div className="availability-total">
            <div>
              <span>Estimated total</span>
              <small>
                {nights} night{nights === 1 ? "" : "s"} · {guests}{" "}
                guests
              </small>
            </div>

            <strong>
              <IndianRupee size={17} />
              {Math.round(totalPrice).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      )}

      {blockedStayDate && checkIn && (
        <p className="availability-error" role="alert">
          {formatDate(blockedStayDate)} is not available for this
          stay. Please select another date or stay length.
        </p>
      )}

      {error && (
        <p className="availability-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        className="availability-book-button"
        onClick={handleContinue}
        disabled={
          calendarLoading ||
          Boolean(calendarError) ||
          calendar.length === 0
        }
      >
        Continue to booking <ArrowRight size={18} />
      </button>

      <p className="availability-footer-note">
        <CheckCircle2 size={15} />
        No payment is taken on this page.
      </p>

      <p className="availability-demo-note">
        Availability and date-specific prices are loaded from the
        server. Final availability and price are verified again
        when the booking is created.
      </p>
    </section>
  );
}
