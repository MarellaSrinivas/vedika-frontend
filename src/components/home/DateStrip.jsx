
import { useMemo, useRef } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import "./DateStrip.css";

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function DateStrip({ checkIn = "", onCheckInChange }) {
  const dateInputRef = useRef(null);

  const todayKey = dateKey(new Date());

  const dates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 10 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
  }, []);

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Fall back to focusing the date input.
      }
    }

    input.focus();
    input.click();
  };

  return (
    <section className="vd-date-strip" id="vd-date-strip">
      <div className="vd-date-heading">
        <CalendarDays size={17} />
        <span>Select Check-in</span>
      </div>

      <div className="vd-date-list">
        {dates.map((date) => {
          const key = dateKey(date);
          const active = (checkIn || todayKey) === key;

          return (
            <button
              type="button"
              key={key}
              className={`vd-date-item ${active ? "selected" : ""}`}
              onClick={() => onCheckInChange?.(key)}
              aria-pressed={active}
            >
              <span className="vd-date-day">
                {key === todayKey
                  ? "TODAY"
                  : date
                      .toLocaleDateString("en-IN", {
                        weekday: "short",
                      })
                      .toUpperCase()}
              </span>

              <strong>{date.getDate()}</strong>

              <span className="vd-date-month">
                {date
                  .toLocaleDateString("en-IN", {
                    month: "short",
                  })
                  .toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="vd-more-dates-wrap">
        <button
          type="button"
          className="vd-more-dates"
          onClick={openDatePicker}
        >
          More Dates <ChevronRight size={15} />
        </button>

        <input
          ref={dateInputRef}
          className="vd-date-picker-input"
          type="date"
          min={todayKey}
          value={checkIn}
          onChange={(event) => onCheckInChange?.(event.target.value)}
          aria-label="Choose a check-in date"
        />
      </div>
    </section>
  );
}
