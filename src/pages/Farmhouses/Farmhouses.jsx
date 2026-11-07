
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  Users,
  BedDouble,
  Star,
  Heart,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Waves,
  Wifi,
  Wind,
  Flame,
  CalendarDays,
} from "lucide-react";

import { farmhouses } from "../../data/farmhouses";
import "./Farmhouses.css";

const amenityOptions = [
  { label: "Private Pool", icon: Waves },
  { label: "AC Rooms", icon: Wind },
  { label: "WiFi", icon: Wifi },
  { label: "BBQ", icon: Flame },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
const DEMO_BOOKED_OFFSETS = {
  1: [4, 5, 11, 19, 20, 26],
  2: [2, 3, 9, 15, 16, 24],
  3: [6, 7, 13, 21, 22, 28],
};

const BOOKING_STORAGE_KEY = "thevedika_demo_bookings";

function toLocalDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getNextDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + 1);

  return toLocalDateString(date);
}

function isStayAvailable(farmhouse, checkIn, checkOut) {
  if (!checkIn || !checkOut) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const offsets =
    DEMO_BOOKED_OFFSETS[String(farmhouse.id)] || [3, 4, 12, 18, 25];

  const bookedDates = new Set(
    offsets.map((offset) => {
      const date = new Date(today);
      date.setDate(date.getDate() + offset);
      return toLocalDateString(date);
    })
  );

  // Each night is occupied from check-in up to, but not including, checkout.
  let current = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);

  while (current < end) {
    const dateString = toLocalDateString(current);

    if (bookedDates.has(dateString)) return false;

    current.setDate(current.getDate() + 1);
  }

  // Also exclude dates overlapping saved demo bookings.
  try {
    const savedBookings = JSON.parse(
      localStorage.getItem(BOOKING_STORAGE_KEY) || "[]"
    );

    const hasConflict = savedBookings.some((booking) => {
      if (String(booking.farmhouseId) !== String(farmhouse.id)) {
        return false;
      }

      if (
        ["CANCELLED", "DEMO_CANCELLED"].includes(booking.bookingStatus)
      ) {
        return false;
      }

      return checkIn < booking.checkOut && checkOut > booking.checkIn;
    });

    if (hasConflict) return false;
  } catch {
    // Ignore invalid demo storage. Live availability must be checked by the API.
  }

  return true;
}
function Farmhouses() {
  const [searchParams, setSearchParams] = useSearchParams();

 const [location, setLocation] = useState(
  searchParams.get("location") || ""
);

const [guests, setGuests] = useState(
  Math.max(5, Number(searchParams.get("guests")) || 5)
);

const [checkIn, setCheckIn] = useState(
  searchParams.get("checkIn") || ""
);

const checkOut = checkIn ? getNextDate(checkIn) : "";
  const [maxPrice, setMaxPrice] = useState(25000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  const filteredFarmhouses = useMemo(() => {
    let results = farmhouses.filter((farmhouse) => {
      const matchesLocation =
        !location.trim() ||
        farmhouse.location.toLowerCase().includes(location.toLowerCase()) ||
        farmhouse.name.toLowerCase().includes(location.toLowerCase());

      const matchesGuests = farmhouse.guests >= guests;
      const matchesPrice = farmhouse.price <= maxPrice;
const matchesAvailability = isStayAvailable(
  farmhouse,
  checkIn,
  checkOut
);
      const matchesAmenities = selectedAmenities.every((amenity) =>
        farmhouse.amenities.some(
          (item) => item.toLowerCase() === amenity.toLowerCase()
        )
      );

      return (
  matchesLocation &&
  matchesGuests &&
  matchesPrice &&
  matchesAmenities &&
  matchesAvailability
);
    });

    if (sortBy === "price-low") {
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      results = [...results].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      results = [...results].sort((a, b) => b.rating - a.rating);
    }

    return results;
}, [location, guests, maxPrice, selectedAmenities, sortBy, checkIn, checkOut]);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    );
  };

  const toggleWishlist = (id) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSearch = (event) => {
  event.preventDefault();

  const params = new URLSearchParams();

  if (location.trim()) params.set("location", location.trim());
  if (checkIn) {
    params.set("checkIn", checkIn);
    params.set("checkOut", getNextDate(checkIn));
  }

  params.set("guests", String(guests));

  setSearchParams(params);
};

const clearFilters = () => {
  setLocation("");
  setGuests(5);
  setCheckIn("");
  setMaxPrice(25000);
  setSelectedAmenities([]);
  setSortBy("recommended");
  setSearchParams({});
};
 
  return (
    <main className="farmhouses-page">
      <section className="listing-hero">
        <div className="container">
          <p className="listing-eyebrow">FIND YOUR PERFECT ESCAPE</p>
          <h1 className="heading-font">Discover Farmhouses</h1>
          <p className="listing-hero-description">
            Private pools, beautiful lawns and memorable moments await.
          </p>

          <form className="listing-search" onSubmit={handleSearch}>
            <label className="listing-search-field">
  <CalendarDays size={19} />
  <span>
    <small>Check-in</small>
    <input
      type="date"
      min={toLocalDateString(new Date())}
      value={checkIn}
      onChange={(event) => setCheckIn(event.target.value)}
    />
  </span>
</label>

            <label className="listing-search-field guest-field">
              <Users size={19} />
              <span>
                <small>Guests</small>
                <select
                  value={guests}
                  onChange={(event) => setGuests(Number(event.target.value))}
                >
                  {[1, 2, 4, 6, 8, 10, 15, 20].map((count) => (
                    <option value={count} key={count}>
                      {count === 1 ? "Any capacity" : `${count}+ guests`}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <button className="listing-search-button" type="submit">
              <Search size={18} />
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="container listing-content">
        <div className="listing-heading-row">
          <div>
            <p className="listing-overline">EXPLORE OUR COLLECTION</p>
            <h2 className="heading-font">Farmhouses for every occasion</h2>
            <p className="results-count">
              {filteredFarmhouses.length}{" "}
              {filteredFarmhouses.length === 1 ? "property" : "properties"} found
            </p>
          </div>

          <div className="listing-toolbar">
            <button
              type="button"
              className="filter-toggle"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              {filtersOpen ? <X size={17} /> : <SlidersHorizontal size={17} />}
              {filtersOpen ? "Hide filters" : "Filters"}
            </button>

            <label className="sort-control">
              <ArrowUpDown size={17} />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort farmhouses"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Top rated</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>

        <div className={`listing-layout ${filtersOpen ? "filters-visible" : ""}`}>
          <aside className={`filter-sidebar ${filtersOpen ? "open" : ""}`}>
            <div className="filter-title-row">
              <h3>Filter your stay</h3>
              <button type="button" onClick={clearFilters}>
                Clear all
              </button>
            </div>

            <div className="filter-section">
              <h4>Maximum price per day</h4>
              <div className="price-range-labels">
                <span>{formatPrice(0)}</span>
                <strong>{formatPrice(maxPrice)}</strong>
              </div>
              <input
                className="price-range"
                type="range"
                min="5000"
                max="25000"
                step="1000"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
              />
            </div>

            <div className="filter-section">
              <h4>Guest capacity</h4>
              {[1, 5, 10, 15, 20].map((count) => (
                <label className="filter-option" key={count}>
                  <input
                    type="radio"
                    name="capacity"
                    checked={guests === count}
                    onChange={() => setGuests(count)}
                  />
                  <span>{count === 1 ? "Any capacity" : `${count}+ guests`}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h4>Amenities</h4>
              {amenityOptions.map(({ label, icon: Icon }) => (
                <label className="filter-option" key={label}>
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(label)}
                    onChange={() => toggleAmenity(label)}
                  />
                  <Icon size={17} />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <button
              className="apply-filters-button"
              type="button"
              onClick={() => setFiltersOpen(false)}
            >
              Show {filteredFarmhouses.length} properties
            </button>
          </aside>

          <div className="farmhouse-results">
            {filteredFarmhouses.length > 0 ? (
              <div className="farmhouse-grid">
                {filteredFarmhouses.map((farmhouse) => (
                  <article className="listing-card" key={farmhouse.id}>
                    <div className="listing-card-image-wrap">
                      <Link to={`/farmhouses/${farmhouse.id}`}>
                        <img
                          className="listing-card-image"
                          src={farmhouse.images?.[0]}
                          alt={farmhouse.name}
                          loading="lazy"
                        />
                      </Link>

                      <button
                        type="button"
                        className={`wishlist-button ${
                          wishlist.includes(farmhouse.id) ? "active" : ""
                        }`}
                        onClick={() => toggleWishlist(farmhouse.id)}
                        aria-label={
                          wishlist.includes(farmhouse.id)
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        <Heart
                          size={19}
                          fill={
                            wishlist.includes(farmhouse.id)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                      <span className="listing-image-badge">Private stay</span>
                    </div>

                    <div className="listing-card-body">
                      <div className="listing-card-title-row">
                        <h3>
                          <Link to={`/farmhouses/${farmhouse.id}`}>
                            {farmhouse.name}
                          </Link>
                        </h3>
                        <span className="listing-rating">
                          <Star size={15} fill="currentColor" />
                          {farmhouse.rating}
                        </span>
                      </div>

                      <p className="listing-location">
                        <MapPin size={15} />
                        {farmhouse.location}
                      </p>

                      <div className="listing-specs">
                        <span>
                          <Users size={16} /> Up to {farmhouse.guests}
                        </span>
                        <span>
                          <BedDouble size={16} /> {farmhouse.bedrooms} bedrooms
                        </span>
                      </div>

                      <div className="listing-amenities">
                        {farmhouse.amenities.slice(0, 3).map((amenity) => (
                          <span key={amenity}>{amenity}</span>
                        ))}
                        {farmhouse.amenities.length > 3 && (
                          <span>+{farmhouse.amenities.length - 3} more</span>
                        )}
                      </div>

                      <div className="listing-card-footer">
                        <div>
                          <strong>{formatPrice(farmhouse.price)}</strong>
                          <span> / day</span>
                          <p>Weekend: {formatPrice(farmhouse.weekendPrice)}</p>
                        </div>

                        <Link
                          className="view-property-button"
                          to={`/farmhouses/${farmhouse.id}`}
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <div className="empty-results-icon">
                  <Search size={30} />
                </div>
                <h3>No farmhouses found</h3>
                <p>
                  Try changing your location, guest capacity, price or amenities.
                </p>
                <button type="button" onClick={clearFilters}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Farmhouses;
