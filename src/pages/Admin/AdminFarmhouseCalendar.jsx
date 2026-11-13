
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    RefreshCw,
    Save,
    Trash2,
    Lock,
    Unlock
} from "lucide-react";

import {
    getAdminFarmhouseCalendar,
    getAdminFarmhouseById,
    setAdminSpecialPrice,
    removeAdminSpecialPrice,
    setAdminFarmhouseAvailability
} from "../../api/adminFarmhouseApi";

import "./AdminFarmhouseCalendar.css";

const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

export default function AdminFarmhouseCalendar() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [farmhouse, setFarmhouse] = useState(null);
    const [days, setDays] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [specialPrice, setSpecialPrice] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const selectedDay = days.find((day) => day.date === selectedDate);

    const loadCalendar = async () => {
        try {
            setLoading(true);

            const [farmhouseData, calendarData] = await Promise.all([
                getAdminFarmhouseById(id),
                getAdminFarmhouseCalendar(id)
            ]);

            const calendar = Array.isArray(calendarData)
                ? calendarData
                : [];

            setFarmhouse(farmhouseData);
            setDays(calendar);

            if (calendar.length > 0) {
                const currentSelected = calendar.find(
                    (day) => day.date === selectedDate
                );

                const dateToSelect = currentSelected
                    ? selectedDate
                    : calendar[0].date;

                setSelectedDate(dateToSelect);

                const selected = calendar.find(
                    (day) => day.date === dateToSelect
                );

                setSpecialPrice(
                    selected?.pricingType === "SPECIAL"
                        ? String(selected.price)
                        : ""
                );
            }
        } catch (error) {
            console.error("Failed to load calendar:", error);
            alert(
                error.response?.data?.message ||
                "Unable to load farmhouse calendar"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCalendar();
    }, [id]);

    const handleDateSelect = (day) => {
        setSelectedDate(day.date);

        setSpecialPrice(
            day.pricingType === "SPECIAL"
                ? String(day.price)
                : ""
        );
    };

    const handleSavePrice = async (event) => {
        event.preventDefault();

        if (!selectedDate || !specialPrice || Number(specialPrice) <= 0) {
            alert("Enter a valid special price.");
            return;
        }

        try {
            setSaving(true);

            await setAdminSpecialPrice(
                id,
                selectedDate,
                Number(specialPrice)
            );

            alert("Special price saved successfully.");
            await loadCalendar();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to save special price"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleRemovePrice = async () => {
        if (!selectedDate) return;

        if (!window.confirm("Remove the special price for this date?")) {
            return;
        }

        try {
            setSaving(true);

            await removeAdminSpecialPrice(id, selectedDate);

            setSpecialPrice("");
            alert("Special price removed.");
            await loadCalendar();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to remove special price"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleAvailability = async (available) => {
        if (!selectedDay || selectedDay.status === "BOOKED") {
            return;
        }

        const message = available
            ? "Reopen this date for bookings?"
            : "Block this date from bookings?";

        if (!window.confirm(message)) return;

        try {
            setSaving(true);

            await setAdminFarmhouseAvailability(
                id,
                selectedDate,
                available
            );

            alert(
                available
                    ? "Date reopened successfully."
                    : "Date blocked successfully."
            );

            await loadCalendar();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to update availability"
            );
        } finally {
            setSaving(false);
        }
    };

    const getStatusClass = (day) => {
        if (day.status === "BOOKED") return "booked";
        if (!day.available) return "blocked";
        return "available";
    };

    if (loading && days.length === 0) {
        return (
            <div className="admin-calendar-page">
                <div className="ac-message">Loading calendar...</div>
            </div>
        );
    }

    return (
        <div className="admin-calendar-page">
            <div className="ac-header">
                <div>
                    <button
                        className="ac-back-btn"
                        onClick={() => navigate("/admin/farmhouses")}
                    >
                        <ArrowLeft size={17} />
                        Back to Farmhouses
                    </button>

                    <h1>
                        <CalendarDays size={25} />
                        Farmhouse Calendar
                    </h1>

                    <p>
                        {farmhouse?.name || `Farmhouse #${id}`}
                        {farmhouse?.location
                            ? ` · ${farmhouse.location}`
                            : ""}
                    </p>
                </div>

                <button
                    className="ac-refresh-btn"
                    onClick={loadCalendar}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            <div className="ac-legend">
                <span><i className="available-dot" /> Available</span>
                <span><i className="booked-dot" /> Booked</span>
                <span><i className="blocked-dot" /> Blocked</span>
            </div>

            <div className="ac-layout">
                <section className="ac-calendar-card">
                    <div className="ac-card-heading">
                        <div>
                            <h2>Next 30 Days</h2>
                            <p>Select a date to manage its price and availability.</p>
                        </div>
                    </div>

                    {days.length === 0 ? (
                        <div className="ac-message">
                            No calendar dates available.
                        </div>
                    ) : (
                        <div className="ac-days-grid">
                            {days.map((day) => (
                                <button
                                    key={day.date}
                                    type="button"
                                    className={`ac-day ${getStatusClass(day)} ${
                                        selectedDate === day.date ? "selected" : ""
                                    }`}
                                    onClick={() => handleDateSelect(day)}
                                >
                                    <span className="ac-day-name">
                                        {day.dayOfWeek?.slice(0, 3)}
                                    </span>

                                    <strong>
                                        {new Date(
                                            `${day.date}T00:00:00`
                                        ).getDate()}
                                    </strong>

                                    <span className="ac-day-price">
                                        {formatPrice(day.price)}
                                    </span>

                                    <span className="ac-day-status">
                                        {day.status === "BOOKED"
                                            ? "Booked"
                                            : !day.available
                                                ? "Blocked"
                                                : "Available"}
                                    </span>

                                    {day.pricingType === "SPECIAL" && (
                                        <span className="ac-special-label">
                                            Special
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <aside className="ac-manage-card">
                    <h2>Manage Selected Date</h2>

                    {!selectedDay ? (
                        <p className="ac-empty-selection">
                            Select a date from the calendar.
                        </p>
                    ) : (
                        <>
                            <div className="ac-selected-date">
                                <span>Selected date</span>
                                <strong>{formatDate(selectedDay.date)}</strong>
                            </div>

                            <div className="ac-current-price">
                                <span>Current nightly price</span>
                                <strong>{formatPrice(selectedDay.price)}</strong>
                                <small>
                                    Pricing: {selectedDay.pricingType || "BASE"}
                                </small>
                            </div>

                            <form onSubmit={handleSavePrice}>
                                <label htmlFor="specialPrice">
                                    Special price (₹)
                                </label>

                                <input
                                    id="specialPrice"
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="Enter special price"
                                    value={specialPrice}
                                    onChange={(e) =>
                                        setSpecialPrice(e.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="submit"
                                    className="ac-primary-btn"
                                    disabled={saving}
                                >
                                    <Save size={17} />
                                    {saving ? "Saving..." : "Save Special Price"}
                                </button>
                            </form>

                            {selectedDay.pricingType === "SPECIAL" && (
                                <button
                                    className="ac-remove-price-btn"
                                    onClick={handleRemovePrice}
                                    disabled={saving}
                                >
                                    <Trash2 size={16} />
                                    Remove Special Price
                                </button>
                            )}

                            <div className="ac-availability-section">
                                <h3>Booking Availability</h3>

                                {selectedDay.status === "BOOKED" ? (
                                    <div className="ac-booked-notice">
                                        This date has an existing booking.
                                        Availability cannot be changed here.
                                    </div>
                                ) : selectedDay.available ? (
                                    <button
                                        className="ac-block-btn"
                                        onClick={() => handleAvailability(false)}
                                        disabled={saving}
                                    >
                                        <Lock size={17} />
                                        Block This Date
                                    </button>
                                ) : (
                                    <button
                                        className="ac-open-btn"
                                        onClick={() => handleAvailability(true)}
                                        disabled={saving}
                                    >
                                        <Unlock size={17} />
                                        Reopen This Date
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </aside>
            </div>
        </div>
    );
}
