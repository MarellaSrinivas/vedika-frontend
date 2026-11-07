import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, CheckCircle2, XCircle, Users, IndianRupee,
  ArrowRight, Info, ChevronLeft, ChevronRight, Flame, CookingPot, Utensils,
} from "lucide-react";
import "./FarmhouseAvailability.css";

const MIN_GUESTS = 5;
const DEFAULT_EXTRA_GUEST_PRICE = 500;
const STORAGE_KEY = "thevedika_demo_bookings";
const DAYS_TO_SHOW = 4;
const CALENDAR_DAYS = 30;

const DEMO_BOOKED_OFFSETS = {
  1: [4, 5, 11, 19, 20, 26],
  2: [2, 3, 9, 15, 16, 24],
  3: [6, 7, 13, 21, 22, 28],
};

const DEFAULT_ADD_ONS = [
  {
    id: "gasCooking",
    name: "Gas cooking access",
    description: "Gas stove and basic cooking access",
    price: 500,
    pricingType: "perStay",
    available: true,
    icon: "cooking",
  },
  {
    id: "foodPackage",
    name: "Food package",
    description: "Food arranged per guest; confirm menu with the host",
    price: 350,
    pricingType: "perGuest",
    available: true,
    icon: "food",
  },
  {
    id: "barbecue",
    name: "Barbecue setup",
    description: "Barbecue equipment and setup",
    price: 1500,
    pricingType: "perStay",
    available: true,
    icon: "bbq",
  },
];

function localDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatDate(dateString) {
  if (!dateString) return "Select date";
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-IN", {
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

function getBookedDates(farmhouseId, today) {
  const offsets = DEMO_BOOKED_OFFSETS[String(farmhouseId)] || [3, 4, 12, 18, 25];
  return offsets.map((offset) => localDateString(addDays(today, offset)));
}

function getNightlyPrice(farmhouse, date, guests) {
  const dateString = localDateString(date);

  const specialRate = farmhouse.specialPrices?.[dateString];

  const basePrice = Number(
    farmhouse.basePrice ?? farmhouse.price ?? 0
  );

  const weekendPrice = Number(
    farmhouse.weekendPrice ?? basePrice
  );

  const isWeekend = date.getDay() === 5 || date.getDay() === 6;

  const nightlyRate =
    specialRate != null
      ? Number(specialRate)
      : isWeekend
        ? weekendPrice
        : basePrice;

  const minimumGuests = Number(
    farmhouse.minimumGuests ?? MIN_GUESTS
  );

  const extraGuests = Math.max(0, guests - minimumGuests);

  const extraGuestPrice = Number(
    farmhouse.extraGuestPrice ?? DEFAULT_EXTRA_GUEST_PRICE
  );

  return nightlyRate + extraGuests * extraGuestPrice;
}

function getAddOnAmount(addOn, guests) {
  return Number(addOn.price || 0) * (addOn.pricingType === "perGuest" ? guests : 1);
}

function AddOnIcon({ icon }) {
  if (icon === "cooking") return <CookingPot size={19} />;
  if (icon === "bbq") return <Flame size={19} />;
  return <Utensils size={19} />;
}

export default function FarmhouseAvailability({ farmhouse }) {
  const navigate = useNavigate();
  const [dateWindowStart, setDateWindowStart] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [nights, setNights] = useState(1);
const [guests, setGuests] = useState(
  Math.max(1, Number(farmhouse.minimumGuests ?? MIN_GUESTS))
);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [error, setError] = useState("");

  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const calendarDates = useMemo(
    () => Array.from({ length: CALENDAR_DAYS }, (_, index) => addDays(today, index)),
    [today]
  );

  const visibleDates = calendarDates.slice(dateWindowStart, dateWindowStart + DAYS_TO_SHOW);
  const bookedDates = useMemo(() => getBookedDates(farmhouse.id, today), [farmhouse.id, today]);
const minimumGuests = Math.max(
  1,
  Number(farmhouse.minimumGuests ?? MIN_GUESTS)
);

const maxGuests = Math.max(
  minimumGuests,
  Number(
    farmhouse.maximumGuests ??
    farmhouse.guests ??
    15
  )
);
  const checkOut = checkIn
    ? localDateString(addDays(new Date(`${checkIn}T12:00:00`), nights))
    : "";

  const availableAddOns = useMemo(() => {
    const list = Array.isArray(farmhouse.addOns) ? farmhouse.addOns : DEFAULT_ADD_ONS;
    return list.filter((item) => item.available !== false);
  }, [farmhouse]);

  const occupiedNights = useMemo(() => {
    if (!checkIn || nights < 1) return [];
    const start = new Date(`${checkIn}T12:00:00`);
    return Array.from({ length: nights }, (_, index) => localDateString(addDays(start, index)));
  }, [checkIn, nights]);

  const blockedStayDate = occupiedNights.find((date) => bookedDates.includes(date));

  const priceBreakdown = useMemo(() => {
    if (!checkIn || nights < 1) return [];
    const start = new Date(`${checkIn}T12:00:00`);
    return Array.from({ length: nights }, (_, index) => {
      const date = addDays(start, index);
      return { date: localDateString(date), price: getNightlyPrice(farmhouse, date, guests) };
    });
  }, [farmhouse, checkIn, nights, guests]);

  const accommodationTotal = priceBreakdown.reduce((sum, night) => sum + night.price, 0);
  const selectedAddOnItems = availableAddOns.filter((item) => selectedAddOns.includes(item.id));
  const addOnsTotal = selectedAddOnItems.reduce((sum, item) => sum + getAddOnAmount(item, guests), 0);
  const totalPrice = accommodationTotal + addOnsTotal;

  const isBooked = (dateString) => bookedDates.includes(dateString);
  const canGoBack = dateWindowStart > 0;
  const canGoForward = dateWindowStart < CALENDAR_DAYS - DAYS_TO_SHOW;

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
    if (guests < MIN_GUESTS || guests > maxGuests) {
      setError(`Choose between ${MIN_GUESTS} and ${maxGuests} guests.`);
      return;
    }
    if (blockedStayDate) {
      setError(`The night of ${formatDate(blockedStayDate)} is booked. Choose another check-in date or stay length.`);
      return;
    }

    try {
      const savedBookings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const conflict = savedBookings.some((booking) => {
        if (String(booking.farmhouseId) !== String(farmhouse.id)) return false;
        if (["CANCELLED", "DEMO_CANCELLED"].includes(booking.bookingStatus)) return false;
        return checkIn < booking.checkOut && checkOut > booking.checkIn;
      });
      if (conflict) {
        setError("These dates conflict with a saved demo booking. Please choose another stay.");
        return;
      }
    } catch {
      // Demo storage only. The server must validate live availability in production.
    }

    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
      nights: String(nights),
      total: String(totalPrice),
      addOns: selectedAddOnItems.map((item) => item.id).join(","),
    });
    navigate(`/booking/${farmhouse.id}?${params.toString()}`);
  }

  return (
    <section className="availability-card" id="availability">
      <div className="availability-heading">
        <div>
          <span className="availability-eyebrow">CHECK YOUR DATES</span>
          <h2>Availability & pricing</h2>
          <p>Browse the next 30 days. Choose a check-in date, then select your nights.</p>
        </div>
        <div className="availability-calendar-icon"><CalendarDays size={23} /></div>
      </div>

      <div className="availability-legend">
        <span><i className="availability-dot available-dot" />Available</span>
        <span><i className="availability-dot booked-dot" />Booked</span>
        <span><i className="availability-dot selected-dot" />Check-in</span>
      </div>

      <div className="availability-slider-controls">
        <button type="button" disabled={!canGoBack} onClick={() => setDateWindowStart((v) => Math.max(0, v - DAYS_TO_SHOW))} aria-label="Previous dates">
          <ChevronLeft size={18} />
        </button>
        <span>{formatDate(localDateString(visibleDates[0]))} – {formatDate(localDateString(visibleDates[visibleDates.length - 1]))}</span>
        <button type="button" disabled={!canGoForward} onClick={() => setDateWindowStart((v) => Math.min(CALENDAR_DAYS - DAYS_TO_SHOW, v + DAYS_TO_SHOW))} aria-label="Next dates">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="availability-calendar">
        {visibleDates.map((date) => {
          const dateString = localDateString(date);
          const booked = isBooked(dateString);
          const selected = checkIn === dateString;
          const price = getNightlyPrice(farmhouse, date, guests);
          return (
            <button
              key={dateString}
              type="button"
              disabled={booked}
              onClick={() => selectCheckIn(dateString)}
              className={`availability-date ${booked ? "is-booked" : "is-available"} ${selected ? "is-date-endpoint" : ""}`}
              aria-label={`${formatDate(dateString)}, ${booked ? "booked" : "available"}, ${formatPrice(price)} per night`}
              title={booked ? "Booked" : `${formatPrice(price)} per night`}
            >
              <span className="availability-day-name">{date.toLocaleDateString("en-IN", { weekday: "short" })}</span>
              <strong>{date.getDate()}</strong>
              <span className="availability-date-price">{booked ? <XCircle size={13} /> : formatPrice(price)}</span>
              <span className="availability-status">{booked ? "Booked" : selected ? "Check-in" : "Available"}</span>
            </button>
          );
        })}
      </div>

      <div className="availability-notice">
        <Info size={17} />
        <p>Check-in is at {farmhouse.checkInTime || "2:00 PM"}. Checkout is at {farmhouse.checkOutTime || "11:00 AM"}. Weekend and special-date rates may differ.</p>
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
          <div><label>CHECK-IN</label><strong>{formatDate(checkIn)}</strong><small>2:00 PM</small></div>
          <div className="availability-date-divider"><ArrowRight size={17} /></div>
          <div><label>CHECKOUT</label><strong>{formatDate(checkOut)}</strong><small>11:00 AM</small></div>
        </div>

        <label className="availability-guests-label" htmlFor="availability-guests"><Users size={17} />Number of guests</label>
        <select id="availability-guests" className="availability-guests-select" value={guests} onChange={(event) => { setGuests(Number(event.target.value)); setError(""); }}>
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
  Base fare covers {minimumGuests} guests. Each additional guest
  costs{" "}
  {formatPrice(
    farmhouse.extraGuestPrice ?? DEFAULT_EXTRA_GUEST_PRICE
  )}{" "}
  per night.
</p>
        <label className="availability-guests-label"><CookingPot size={17} />Optional essential services</label>
        <div className="availability-addons">
          {availableAddOns.map((item) => {
            const checked = selectedAddOns.includes(item.id);
            return (
              <label className={`availability-addon ${checked ? "is-selected" : ""}`} key={item.id}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setSelectedAddOns((current) => checked ? current.filter((id) => id !== item.id) : [...current, item.id]);
                    setError("");
                  }}
                />
                <span className="availability-addon-icon"><AddOnIcon icon={item.icon} /></span>
                <span className="availability-addon-copy"><strong>{item.name}</strong><small>{item.description}</small><small>{item.pricingType === "perGuest" ? `${formatPrice(item.price)} per guest` : "One-time charge per stay"}</small></span>
                <strong className="availability-addon-price">{formatPrice(getAddOnAmount(item, guests))}</strong>
              </label>
            );
          })}
        </div>
      </div>

      {priceBreakdown.length > 0 && (
        <div className="availability-price-breakdown">
          <h3>Price breakdown</h3>
          {priceBreakdown.map((night) => (
            <div key={night.date} className="availability-price-row"><span>{formatDate(night.date)} accommodation</span><strong>{formatPrice(night.price)}</strong></div>
          ))}
          {selectedAddOnItems.map((item) => (
            <div key={item.id} className="availability-price-row"><span>{item.name}</span><strong>{formatPrice(getAddOnAmount(item, guests))}</strong></div>
          ))}
          <div className="availability-total">
            <div><span>Estimated total</span><small>{nights} night{nights === 1 ? "" : "s"} · {guests} guests</small></div>
            <strong><IndianRupee size={17} />{Math.round(totalPrice).toLocaleString("en-IN")}</strong>
          </div>
        </div>
      )}

      {error && <p className="availability-error" role="alert">{error}</p>}

      <button type="button" className="availability-book-button" onClick={handleContinue}>
        Continue to booking <ArrowRight size={18} />
      </button>
      <p className="availability-footer-note"><CheckCircle2 size={15} />No payment is taken on this page.</p>
      <p className="availability-demo-note">Demo availability and prices only. The backend must confirm live availability and recalculate the final price before payment.</p>
    </section>
  );
}
