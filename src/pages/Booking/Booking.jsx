
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  UserRound,
  LoaderCircle,
  MapPin,
} from "lucide-react";

import api from "../../api/api";
import "./Booking.css";

const ADVANCE_AMOUNT = 1000;

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatDate = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const getNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);

  const difference = Math.round(
    (end.getTime() - start.getTime()) / 86400000
  );

  return difference > 0 ? difference : 0;
};

const getFarmhouseImage = (farmhouse) => {
  if (!farmhouse) return "";

  const firstImage = farmhouse.images?.[0];

  if (typeof firstImage === "string") return firstImage;

  return (
    firstImage?.imageUrl ||
    firstImage?.image_url ||
    firstImage?.url ||
    ""
  );
};

const unwrapResponse = (response) =>
  response?.data?.data ?? response?.data ?? response;

const getCalendarArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;

  return (
    responseData?.calendar ||
    responseData?.days ||
    responseData?.content ||
    responseData?.data ||
    []
  );
};

const normalizeCalendar = (days) =>
  (Array.isArray(days) ? days : [])
    .filter((day) => day?.date)
    .map((day) => ({
      ...day,
      date: String(day.date).slice(0, 10),
      price: Number(day.price ?? 0),
      available:
        day.available !== false &&
        !["BOOKED", "UNAVAILABLE", "BLOCKED", "NOT_AVAILABLE"].includes(
          String(day.status || "").toUpperCase()
        ),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

const normalizePricingType = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/[_\s-]/g, "");

const isPerGuestAddon = (addon) =>
  normalizePricingType(addon.pricingType) === "PERGUEST";

const getAddonPrice = (addon, guests) => {
  const price = Number(addon.price || 0);

  return isPerGuestAddon(addon) ? price * guests : price;
};

const getApiError = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

const getInitialAddonIds = (searchParams) => {
  const value = searchParams.get("addOns");

  if (!value) return [];

  return value
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
};

export default function Booking() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [farmhouse, setFarmhouse] = useState(null);
  const [availableAddOns, setAvailableAddOns] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);

  const [loading, setLoading] = useState(true);
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const [calendarError, setCalendarError] = useState("");

  const [checkIn, setCheckIn] = useState(
    searchParams.get("checkIn") || ""
  );

  const [checkOut, setCheckOut] = useState(
    searchParams.get("checkOut") || ""
  );

  const [guests, setGuests] = useState(
    Math.max(5, Number(searchParams.get("guests")) || 5)
  );

  const [selectedAddOns, setSelectedAddOns] = useState(
    () => getInitialAddonIds(searchParams)
  );

  const [paymentOption, setPaymentOption] = useState("FULL");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Load farmhouse, calendar and add-ons from the backend.
  useEffect(() => {
    let cancelled = false;

    const loadBookingData = async () => {
      try {
        setLoading(true);
        setError("");
        setCalendarError("");
        setCalendarLoaded(false);

        const farmhouseResponse = await api.get(
          `/farmhouses/${id}`
        );

        if (cancelled) return;

        const farmhouseData = unwrapResponse(farmhouseResponse);

        setFarmhouse(farmhouseData);

        // Load the actual date-wise calendar prices and availability.
        try {
          const calendarResponse = await api.get(
            `/farmhouses/${id}/calendar`
          );

          if (cancelled) return;

          const calendarData = unwrapResponse(calendarResponse);
          const days = normalizeCalendar(
            getCalendarArray(calendarData)
          );

          setCalendarDays(days);
          setCalendarLoaded(true);

          if (days.length === 0) {
            setCalendarError(
              "The availability calendar returned no dates. Please go back and select your dates again."
            );
          }
        } catch (calendarRequestError) {
          if (!cancelled) {
            setCalendarError(
              getApiError(calendarRequestError)
            );
            setCalendarLoaded(true);
          }
        }

        // Use embedded add-ons first.
        const embeddedAddons =
          farmhouseData.addons ||
          farmhouseData.addOns ||
          [];

        let addons = Array.isArray(embeddedAddons)
          ? embeddedAddons
          : [];

        // Try the separate endpoint as an additional source.
        try {
          const addonsResponse = await api.get(
            `/farmhouses/${id}/addons`
          );

          const responseData = unwrapResponse(addonsResponse);

          const endpointAddons = Array.isArray(responseData)
            ? responseData
            : Array.isArray(responseData?.content)
              ? responseData.content
              : [];

          if (endpointAddons.length > 0) {
            addons = endpointAddons;
          }
        } catch (addonError) {
          console.warn(
            "Using add-ons from farmhouse details:",
            addonError
          );
        }

        if (cancelled) return;

        const filteredAddons = addons.filter(
          (addon) =>
            addon.available !== false &&
            addon.id != null
        );

        setAvailableAddOns(filteredAddons);

        // Keep only add-on IDs that are still available.
        setSelectedAddOns((previous) =>
          previous.filter((selectedId) =>
            filteredAddons.some(
              (addon) => Number(addon.id) === Number(selectedId)
            )
          )
        );

        const minimum = Number(
          farmhouseData.minimumGuests || 5
        );

        const maximum = Number(
          farmhouseData.maximumGuests ||
            farmhouseData.guests ||
            20
        );

        setGuests((previous) =>
          Math.min(Math.max(previous, minimum), maximum)
        );

        // Prefill authenticated user details.
        try {
          const savedUser = JSON.parse(
            localStorage.getItem("thevedika_user") || "{}"
          );

          setFormData((previous) => ({
            ...previous,
            fullName:
              savedUser.fullName || savedUser.name || "",
            email: savedUser.email || "",
            phone: savedUser.phone || "",
          }));
        } catch {
          // Ignore invalid saved user data.
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getApiError(requestError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBookingData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const nights = useMemo(
    () => getNights(checkIn, checkOut),
    [checkIn, checkOut]
  );

  const calendarByDate = useMemo(() => {
    const result = {};

    calendarDays.forEach((day) => {
      result[day.date] = day;
    });

    return result;
  }, [calendarDays]);

  // Check every occupied night. Checkout day is not charged.
  const bookingDateIssue = useMemo(() => {
    if (!checkIn || !checkOut || nights < 1) return "";

    if (!calendarLoaded) {
      return "Checking date availability...";
    }

    if (calendarError || calendarDays.length === 0) {
      return calendarError || "Availability calendar is unavailable.";
    }

    for (let index = 0; index < nights; index += 1) {
      const date = addDays(checkIn, index);
      const calendarDay = calendarByDate[date];

      if (!calendarDay) {
        return `Availability for ${date} is not available in the current calendar. Please choose dates within the available calendar range.`;
      }

      if (!calendarDay.available) {
        return `${date} is booked or unavailable. Please choose different dates.`;
      }

      if (!Number.isFinite(calendarDay.price) || calendarDay.price <= 0) {
        return `The price for ${date} is not available. Please select different dates or contact support.`;
      }
    }

    return "";
  }, [
    checkIn,
    checkOut,
    nights,
    calendarLoaded,
    calendarError,
    calendarDays,
    calendarByDate,
  ]);

  // Calculate each night's price from the live calendar.
  const nightlyBreakdown = useMemo(() => {
    if (!nights || bookingDateIssue) return [];

    return Array.from({ length: nights }, (_, index) => {
      const date = addDays(checkIn, index);
      const calendarDay = calendarByDate[date];

      return {
        date,
        price: Number(calendarDay?.price || 0),
        pricingType: calendarDay?.pricingType || "",
        dayOfWeek: calendarDay?.dayOfWeek || "",
      };
    });
  }, [checkIn, nights, calendarByDate, bookingDateIssue]);

  const baseAccommodationTotal = useMemo(
    () =>
      nightlyBreakdown.reduce(
        (total, day) => total + day.price,
        0
      ),
    [nightlyBreakdown]
  );

  const minimumGuests = Number(
    farmhouse?.minimumGuests || 5
  );

  const maximumGuests = Number(
    farmhouse?.maximumGuests ||
      farmhouse?.guests ||
      20
  );

  const extraGuestCount = Math.max(
    0,
    guests - minimumGuests
  );

  const extraGuestPrice = Number(
    farmhouse?.extraGuestPrice || 0
  );

  const extraGuestTotal =
    extraGuestCount * extraGuestPrice * nights;

  const accommodationTotal =
    baseAccommodationTotal + extraGuestTotal;

  const selectedAddonObjects = useMemo(
    () =>
      availableAddOns.filter((addon) =>
        selectedAddOns.includes(Number(addon.id))
      ),
    [availableAddOns, selectedAddOns]
  );

  const addOnsTotal = useMemo(
    () =>
      selectedAddonObjects.reduce(
        (total, addon) =>
          total + getAddonPrice(addon, guests),
        0
      ),
    [selectedAddonObjects, guests]
  );

  const totalAmount = accommodationTotal + addOnsTotal;

  const amountToPay =
    paymentOption === "ADVANCE"
      ? ADVANCE_AMOUNT
      : totalAmount;

  const balanceDue = Math.max(
    0,
    totalAmount - amountToPay
  );

  // If the total becomes less than the fixed advance, switch to full payment.
  useEffect(() => {
    if (
      paymentOption === "ADVANCE" &&
      totalAmount < ADVANCE_AMOUNT
    ) {
      setPaymentOption("FULL");
    }
  }, [paymentOption, totalAmount]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleAddon = (addonId) => {
    const numericId = Number(addonId);

    setSelectedAddOns((previous) =>
      previous.includes(numericId)
        ? previous.filter((selectedId) => selectedId !== numericId)
        : [...previous, numericId]
    );
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      return "Please enter your full name.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      return "Please enter a valid email address.";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      return "Enter a valid 10-digit Indian mobile number.";
    }

    if (!checkIn || !checkOut || nights < 1) {
      return "Please select valid check-in and check-out dates.";
    }

    if (checkIn < getToday()) {
      return "Check-in cannot be in the past.";
    }

    if (
      guests < minimumGuests ||
      guests > maximumGuests
    ) {
      return `Select between ${minimumGuests} and ${maximumGuests} guests.`;
    }

    if (!calendarLoaded || bookingDateIssue) {
      return bookingDateIssue ||
        "Please wait while date availability is checked.";
    }

    if (totalAmount <= 0) {
      return "The booking amount is invalid. Please check your dates.";
    }

    if (
      paymentOption === "ADVANCE" &&
      totalAmount < ADVANCE_AMOUNT
    ) {
      return "The ₹1,000 advance is unavailable when the total is below ₹1,000.";
    }

    if (!acceptedTerms) {
      return "Please accept the booking and payment terms.";
    }

    return "";
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setProcessing(true);

    try {
      // 1. Load Razorpay Checkout.
      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please check your internet connection."
        );
      }

      // 2. Create a pending booking.
      // The backend remains responsible for final price and availability validation.
      const bookingResponse = await api.post(
        `/bookings/farmhouses/${id}`,
        {
          checkIn,
          checkOut,
          guests,
          specialRequests: formData.specialRequests.trim(),
          paymentOption,
          addonIds: selectedAddonObjects.map((addon) =>
            Number(addon.id)
          ),
        }
      );

      const booking = unwrapResponse(bookingResponse);

      if (!booking?.bookingReference) {
        throw new Error(
          "Booking was created, but the booking reference was not returned."
        );
      }

      // 3. Create Razorpay order through the backend.
      const orderResponse = await api.post(
        `/payments/booking/${booking.bookingReference}/create-order`
      );

      const order = unwrapResponse(orderResponse);

      if (!order?.orderId || !order?.keyId) {
        throw new Error(
          "The server did not return the Razorpay order details."
        );
      }

      // 4. Open Razorpay Checkout.
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "The Vedika",
        description: `Booking ${booking.bookingReference}`,
        order_id: order.orderId,

        prefill: {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },

        notes: {
          bookingReference: booking.bookingReference,
        },

        theme: {
          color: "#1f3a2a",
        },

        modal: {
          ondismiss: () => {
            setProcessing(false);
            setError(
              "Payment was not completed. Your booking is still pending payment. You can retry from your booking flow."
            );
          },
        },

        handler: async (paymentResponse) => {
          try {
            // 5. Verify the Razorpay signature on the backend.
            const verificationResponse = await api.post(
              "/payments/verify",
              {
                bookingReference: booking.bookingReference,
                razorpayOrderId:
                  paymentResponse.razorpay_order_id,
                razorpayPaymentId:
                  paymentResponse.razorpay_payment_id,
                razorpaySignature:
                  paymentResponse.razorpay_signature,
              }
            );

            const verification =
              unwrapResponse(verificationResponse);

            if (
              verification?.success !== true ||
              verification?.bookingStatus !== "CONFIRMED"
            ) {
              throw new Error(
                verification?.message ||
                  "Payment verification is not complete. Please contact support."
              );
            }

            // 6. Navigate only after successful server verification.
            navigate(
              `/booking-confirmation/${booking.bookingReference}`,
              {
                replace: true,
              }
            );
          } catch (verificationError) {
            setError(
              getApiError(verificationError) ||
                "Payment was received but verification could not be completed. Please contact support with your booking reference."
            );
            setProcessing(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setProcessing(false);

        setError(
          response?.error?.description ||
            "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (requestError) {
      setError(getApiError(requestError));
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="page container booking-page">
        <div className="booking-loading">
          <LoaderCircle
            className="booking-spinner"
            size={30}
          />
          <p>Loading booking details...</p>
        </div>
      </main>
    );
  }

  if (!farmhouse) {
    return (
      <main className="page container booking-page">
        <h1>Farmhouse details unavailable</h1>
        <p>{error || "Please try again."}</p>
        <Link to="/farmhouses">Browse farmhouses</Link>
      </main>
    );
  }

  const image = getFarmhouseImage(farmhouse);

  return (
    <main className="page container booking-page">
      <Link
        to={`/farmhouses/${farmhouse.id}`}
        className="booking-back"
      >
        <ArrowLeft size={18} />
        Back to farmhouse
      </Link>

      <div className="booking-heading">
        <p className="eyebrow">COMPLETE YOUR RESERVATION</p>
        <h1 className="heading-font">Book your stay</h1>
        <p>
          Review your stay details and complete your payment securely.
        </p>
      </div>

      <form
        className="booking-layout"
        onSubmit={handlePayment}
      >
        <section className="booking-form-panel">
          <div className="booking-section">
            <h2>
              <UserRound size={20} />
              Guest details
            </h2>

            <div className="booking-fields">
              <label>
                Full name
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={updateField}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={updateField}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Mobile number
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.phone}
                  onChange={updateField}
                  autoComplete="tel"
                  required
                />
              </label>

              <label>
                Special requests (optional)
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={updateField}
                  rows={3}
                  maxLength={500}
                />
              </label>
            </div>
          </div>

          <div className="booking-section">
            <h2>
              <CalendarDays size={20} />
              Edit your stay
            </h2>

            <div className="booking-fields">
              <label>
                Check-in
                <input
                  type="date"
                  value={checkIn}
                  min={getToday()}
                  onChange={(event) =>
                    setCheckIn(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Check-out
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || getToday()}
                  onChange={(event) =>
                    setCheckOut(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Number of guests
                <select
                  value={guests}
                  onChange={(event) =>
                    setGuests(Number(event.target.value))
                  }
                >
                  {Array.from(
                    {
                      length: Math.max(
                        0,
                        maximumGuests - minimumGuests + 1
                      ),
                    },
                    (_, index) => minimumGuests + index
                  ).map((count) => (
                    <option key={count} value={count}>
                      {count} guests
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {bookingDateIssue && (
              <p className="booking-error booking-date-error">
                {bookingDateIssue}
              </p>
            )}

            {!bookingDateIssue && nights > 0 && (
              <p className="booking-availability-success">
                <ShieldCheck size={16} />
                Your selected dates are available.
              </p>
            )}

            <p className="booking-time-note">
              Check-in: {farmhouse.checkInTime || "2:00 PM"}
              {" · "}
              Check-out: {farmhouse.checkOutTime || "11:00 AM"}
            </p>
          </div>

          <div className="booking-section">
            <h2>Essential services</h2>

            <p className="addons-intro">
              Customize your stay with optional services.
            </p>

            <div className="booking-addons">
              {availableAddOns.length === 0 ? (
                <p>
                  No additional services are available for this farmhouse.
                </p>
              ) : (
                availableAddOns.map((item) => {
                  const selected = selectedAddOns.includes(
                    Number(item.id)
                  );

                  return (
                    <label
                      key={item.id}
                      className={`booking-addon ${
                        selected ? "selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleAddon(item.id)}
                      />

                      <span className="booking-addon-copy">
                        <strong>{item.name}</strong>

                        {item.description && (
                          <small>{item.description}</small>
                        )}

                        <small>
                          {formatPrice(item.price)}{" "}
                          {isPerGuestAddon(item)
                            ? "per guest"
                            : "per stay"}
                        </small>
                      </span>

                      <strong>
                        {formatPrice(
                          getAddonPrice(item, guests)
                        )}
                      </strong>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="booking-section">
            <h2>
              <CreditCard size={20} />
              Choose payment option
            </h2>

            <label className="payment-choice">
              <input
                type="radio"
                name="paymentOption"
                value="FULL"
                checked={paymentOption === "FULL"}
                onChange={() => setPaymentOption("FULL")}
              />

              <span className="payment-choice-copy">
                <strong>Pay full amount</strong>
                <small>
                  Pay the entire booking amount now.
                </small>
              </span>

              <strong>{formatPrice(totalAmount)}</strong>
            </label>

            <label
              className={`payment-choice ${
                totalAmount < ADVANCE_AMOUNT
                  ? "payment-choice-disabled"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="paymentOption"
                value="ADVANCE"
                checked={paymentOption === "ADVANCE"}
                disabled={totalAmount < ADVANCE_AMOUNT}
                onChange={() => setPaymentOption("ADVANCE")}
              />

              <span className="payment-choice-copy">
                <strong>Pay ₹1,000 advance</strong>
                <small>
                  Pay the fixed advance now and the remaining balance later.
                </small>
              </span>

              <strong>{formatPrice(ADVANCE_AMOUNT)}</strong>
            </label>

            {paymentOption === "ADVANCE" && (
              <div className="advance-notice">
                <ShieldCheck size={18} />
                <span>
                  Pay {formatPrice(amountToPay)} now. Remaining balance:
                  {" "}
                  {formatPrice(balanceDue)}.
                </span>
              </div>
            )}
          </div>

          <label className="booking-terms">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) =>
                setAcceptedTerms(event.target.checked)
              }
            />

            <span>
              I agree to the booking, payment, cancellation and refund policies.
            </span>
          </label>

          {error && (
            <p className="booking-error">{error}</p>
          )}

          <button
            className="booking-submit"
            type="submit"
            disabled={
              processing ||
              nights < 1 ||
              totalAmount <= 0 ||
              !calendarLoaded ||
              Boolean(bookingDateIssue)
            }
          >
            {processing ? (
              <>
                <LoaderCircle
                  className="booking-spinner"
                  size={18}
                />
                Processing...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Proceed to pay {formatPrice(amountToPay)}
              </>
            )}
          </button>

          <p className="booking-secure-note">
            Secure payment powered by Razorpay. Your booking is confirmed
            only after payment verification.
          </p>
        </section>

        <aside className="booking-summary">
          {image && (
            <img
              src={image}
              alt={farmhouse.name}
              className="booking-summary-image"
            />
          )}

          <div className="booking-summary-content">
            <h2>{farmhouse.name}</h2>

            <p>
              <MapPin
                size={14}
                style={{
                  display: "inline",
                  marginRight: 4,
                }}
              />
              {farmhouse.location}
            </p>

            <div className="booking-price-row">
              <span>Base accommodation</span>
              <strong>
                {formatPrice(baseAccommodationTotal)}
              </strong>
            </div>

            {extraGuestTotal > 0 && (
              <div className="booking-price-row">
                <span>
                  Extra guests ({extraGuestCount} × {nights} nights)
                </span>
                <strong>
                  {formatPrice(extraGuestTotal)}
                </strong>
              </div>
            )}

            <div className="booking-price-row">
              <span>Number of nights</span>
              <strong>{nights}</strong>
            </div>

            <div className="booking-price-row">
              <span>Guests</span>
              <strong>{guests}</strong>
            </div>

            {nightlyBreakdown.map((day) => (
              <div
                className="booking-price-row booking-night-row"
                key={day.date}
              >
                <span>
                  {day.date}
                  {day.pricingType && (
                    <small className="booking-pricing-type">
                      {String(day.pricingType).replace(/_/g, " ")}
                    </small>
                  )}
                </span>
                <strong>{formatPrice(day.price)}</strong>
              </div>
            ))}

            {selectedAddonObjects.map((addon) => (
              <div
                className="booking-price-row"
                key={addon.id}
              >
                <span>{addon.name}</span>
                <strong>
                  {formatPrice(
                    getAddonPrice(addon, guests)
                  )}
                </strong>
              </div>
            ))}

            <div className="booking-price-row booking-price-total">
              <span>Total booking amount</span>
              <strong>{formatPrice(totalAmount)}</strong>
            </div>

            <div className="booking-price-row">
              <span>Pay now</span>
              <strong>{formatPrice(amountToPay)}</strong>
            </div>

            {paymentOption === "ADVANCE" && (
              <div className="booking-price-row">
                <span>Remaining balance</span>
                <strong>{formatPrice(balanceDue)}</strong>
              </div>
            )}

            <p className="booking-summary-note">
              The final payable amount is calculated and validated by the
              server when your booking is created.
            </p>
          </div>
        </aside>
      </form>
    </main>
  );
}
