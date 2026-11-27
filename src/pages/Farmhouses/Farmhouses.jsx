
import { useEffect, useMemo, useState } from "react";
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

import { getFarmhouses } from "../../api/farmhouseApi.js";
import SEO from "../../components/SEO";
import "./Farmhouses.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));

const toLocalDateString = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getNextDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + 1);

  return toLocalDateString(date);
};

const getImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "string") return image;

  return (
    image.imageUrl ||
    image.url ||
    image.image ||
    ""
  );
};

const getFarmhouseImages = (farmhouse) => {
  const images = Array.isArray(farmhouse.images)
    ? farmhouse.images
    : [];

  return images
    .filter(Boolean)
    .sort((a, b) => {
      const coverA =
        typeof a === "object" && a.coverImage ? 1 : 0;
      const coverB =
        typeof b === "object" && b.coverImage ? 1 : 0;

      if (coverA !== coverB) return coverB - coverA;

      const orderA =
        typeof a === "object" ? Number(a.displayOrder || 0) : 0;
      const orderB =
        typeof b === "object" ? Number(b.displayOrder || 0) : 0;

      return orderA - orderB;
    })
    .map(getImageUrl)
    .filter(Boolean);
};

const getFarmhouseAmenities = (farmhouse) => {
  const amenities = farmhouse.amenities || [];

  if (!Array.isArray(amenities)) return [];

  return amenities
    .map((amenity) =>
      typeof amenity === "string"
        ? amenity
        : amenity?.name || amenity?.amenityName || ""
    )
    .filter(Boolean);
};

const normalizeFarmhouse = (farmhouse) => {
  const images = getFarmhouseImages(farmhouse);
  const amenities = getFarmhouseAmenities(farmhouse);

  return {
    ...farmhouse,
    id: farmhouse.id,
    name: farmhouse.name || "Farmhouse",
    location:
      farmhouse.location ||
      farmhouse.city ||
      farmhouse.addressLine ||
      "Hyderabad",
    images,
    amenities,
    price: Number(
      farmhouse.basePrice ?? farmhouse.price ?? 0
    ),
    weekendPrice: Number(
      farmhouse.weekendPrice ?? farmhouse.basePrice ?? farmhouse.price ?? 0
    ),
    guests: Number(
      farmhouse.maximumGuests ?? farmhouse.guests ?? 0
    ),
    minimumGuests: Number(farmhouse.minimumGuests || 1),
    bedrooms: Number(farmhouse.bedrooms || 0),
    bathrooms: Number(farmhouse.bathrooms || 0),
    rating: Number(farmhouse.rating || 0),
    reviewCount: Number(
      farmhouse.reviewCount ?? farmhouse.reviewsCount ?? 0
    ),
  };
};

const getAmenityIcon = (amenity) => {
  const name = amenity.toLowerCase();

  if (name.includes("pool")) return Waves;
  if (name.includes("wifi") || name.includes("wi-fi")) return Wifi;
  if (name.includes("ac") || name.includes("air condition")) return Wind;
  if (name.includes("bbq") || name.includes("barbecue")) return Flame;

  return null;
};

function Farmhouses() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [farmhouses, setFarmhouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );

  const [guests, setGuests] = useState(
    Math.max(1, Number(searchParams.get("guests")) || 5)
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

  // Load active farmhouse listings from backend.
  useEffect(() => {
    let isMounted = true;

    const loadFarmhouses = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getFarmhouses();

        if (!isMounted) return;

        const normalized = (Array.isArray(data) ? data : [])
          .map(normalizeFarmhouse)
          .filter((farmhouse) => farmhouse.id != null);

        setFarmhouses(normalized);
      } catch (err) {
        console.error("Failed to load farmhouses:", err);

        if (isMounted) {
          setError(
            "We couldn't load farmhouses right now. Please try again."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFarmhouses();

    return () => {
      isMounted = false;
    };
  }, []);

  // Amenities available in the live database.
  const amenityOptions = useMemo(() => {
    const allAmenities = farmhouses.flatMap(
      (farmhouse) => farmhouse.amenities
    );

    return [...new Set(allAmenities)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [farmhouses]);

  const filteredFarmhouses = useMemo(() => {
    let results = farmhouses.filter((farmhouse) => {
      const searchLocation = location.trim().toLowerCase();

      const matchesLocation =
        !searchLocation ||
        farmhouse.location.toLowerCase().includes(searchLocation) ||
        farmhouse.name.toLowerCase().includes(searchLocation);

      const matchesGuests =
        guests <= 1 || farmhouse.guests >= guests;

      const matchesPrice = farmhouse.price <= maxPrice;

      const matchesAmenities = selectedAmenities.every((amenity) =>
        farmhouse.amenities.some(
          (item) =>
            item.toLowerCase() === amenity.toLowerCase()
        )
      );

      return (
        matchesLocation &&
        matchesGuests &&
        matchesPrice &&
        matchesAmenities
      );
    });

    if (sortBy === "price-low") {
      results = [...results].sort(
        (a, b) => a.price - b.price
      );
    } else if (sortBy === "price-high") {
      results = [...results].sort(
        (a, b) => b.price - a.price
      );
    } else if (sortBy === "rating") {
      results = [...results].sort(
        (a, b) => b.rating - a.rating
      );
    }

    return results;
  }, [
    farmhouses,
    location,
    guests,
    maxPrice,
    selectedAmenities,
    sortBy,
  ]);

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

    if (location.trim()) {
      params.set("location", location.trim());
    }

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
      <SEO
        title="Farmhouses Near Hyderabad"
        description="Explore and book private farmhouses near Hyderabad. Discover farmhouses with swimming pools, spacious lawns, BBQ facilities and comfortable stays."
        url="/farmhouses"
        keywords={[
          "farmhouses near Hyderabad",
          "farmhouse booking Hyderabad",
          "private pool farmhouses",
          "weekend farmhouse stays",
          "farmhouse for groups",
        ]}
      />

      <section className="listing-hero">
        <div className="container">
          <p className="listing-eyebrow">
            FIND YOUR PERFECT ESCAPE
          </p>

          <h1 className="heading-font">
            Discover Farmhouses
          </h1>

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
                  onChange={(event) =>
                    setCheckIn(event.target.value)
                  }
                />
              </span>
            </label>

            <label className="listing-search-field guest-field">
              <Users size={19} />

              <span>
                <small>Guests</small>

                <select
                  value={guests}
                  onChange={(event) =>
                    setGuests(Number(event.target.value))
                  }
                >
                  {[1, 5, 10, 15, 20].map((count) => (
                    <option value={count} key={count}>
                      {count === 1
                        ? "Any capacity"
                        : `${count}+ guests`}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <button
              className="listing-search-button"
              type="submit"
            >
              <Search size={18} />
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="container listing-content">
        <div className="listing-heading-row">
          <div>
            <p className="listing-overline">
              EXPLORE OUR COLLECTION
            </p>

            <h2 className="heading-font">
              Farmhouses for every occasion
            </h2>

            <p className="results-count">
              {loading
                ? "Loading properties..."
                : `${filteredFarmhouses.length} ${
                    filteredFarmhouses.length === 1
                      ? "property"
                      : "properties"
                  } found`}
            </p>
          </div>

          <div className="listing-toolbar">
            <button
              type="button"
              className="filter-toggle"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              {filtersOpen ? (
                <X size={17} />
              ) : (
                <SlidersHorizontal size={17} />
              )}

              {filtersOpen ? "Hide filters" : "Filters"}
            </button>

            <label className="sort-control">
              <ArrowUpDown size={17} />

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                aria-label="Sort farmhouses"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Top rated</option>
                <option value="price-low">
                  Price: low to high
                </option>
                <option value="price-high">
                  Price: high to low
                </option>
              </select>
            </label>
          </div>
        </div>

        <div
          className={`listing-layout ${
            filtersOpen ? "filters-visible" : ""
          }`}
        >
          <aside
            className={`filter-sidebar ${
              filtersOpen ? "open" : ""
            }`}
          >
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
                onChange={(event) =>
                  setMaxPrice(Number(event.target.value))
                }
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

                  <span>
                    {count === 1
                      ? "Any capacity"
                      : `${count}+ guests`}
                  </span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h4>Amenities</h4>

              {amenityOptions.length > 0 ? (
                amenityOptions.map((amenity) => {
                  const Icon = getAmenityIcon(amenity);

                  return (
                    <label
                      className="filter-option"
                      key={amenity}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                      />

                      {Icon && <Icon size={17} />}

                      <span>{amenity}</span>
                    </label>
                  );
                })
              ) : (
                <p className="results-count">
                  No amenities available.
                </p>
              )}
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
            {loading ? (
              <div className="empty-results">
                <div className="empty-results-icon">
                  <Search size={30} />
                </div>

                <h3>Finding your perfect stay...</h3>

                <p>
                  Please wait while we load available farmhouses.
                </p>
              </div>
            ) : error ? (
              <div className="empty-results">
                <h3>Unable to load farmhouses</h3>
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : filteredFarmhouses.length > 0 ? (
              <div className="farmhouse-grid">
                {filteredFarmhouses.map((farmhouse) => (
                  <article
                    className="listing-card"
                    key={farmhouse.id}
                  >
                    <div className="listing-card-image-wrap">
                      <Link
                        to={`/farmhouses/${farmhouse.id}`}
                      >
                        <img
                          className="listing-card-image"
                          src={
                            farmhouse.images[0] ||
                            "/images/farmhouse-placeholder.jpg"
                          }
                          alt={farmhouse.name}
                          loading="lazy"
                        />
                      </Link>

                      <button
                        type="button"
                        className={`wishlist-button ${
                          wishlist.includes(farmhouse.id)
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleWishlist(farmhouse.id)
                        }
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

                      <span className="listing-image-badge">
                        Private stay
                      </span>
                    </div>

                    <div className="listing-card-body">
                      <div className="listing-card-title-row">
                        <h3>
                          <Link
                            to={`/farmhouses/${farmhouse.id}`}
                          >
                            {farmhouse.name}
                          </Link>
                        </h3>

                        {farmhouse.rating > 0 && (
                          <span className="listing-rating">
                            <Star
                              size={15}
                              fill="currentColor"
                            />
                            {farmhouse.rating}
                          </span>
                        )}
                      </div>

                      <p className="listing-location">
                        <MapPin size={15} />
                        {farmhouse.location}
                      </p>

                      <div className="listing-specs">
                        <span>
                          <Users size={16} />
                          Up to {farmhouse.guests}
                        </span>

                        <span>
                          <BedDouble size={16} />
                          {farmhouse.bedrooms} bedrooms
                        </span>
                      </div>

                      <div className="listing-amenities">
                        {farmhouse.amenities
                          .slice(0, 3)
                          .map((amenity, index) => (
                            <span key={`${amenity}-${index}`}>
                              {amenity}
                            </span>
                          ))}

                        {farmhouse.amenities.length > 3 && (
                          <span>
                            +{farmhouse.amenities.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="listing-card-footer">
                        <div>
                          <strong>
                            {formatPrice(farmhouse.price)}
                          </strong>

                          <span> / day</span>

                          <p>
                            Weekend:{" "}
                            {formatPrice(farmhouse.weekendPrice)}
                          </p>
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
                  Try changing your location, guest capacity,
                  price or amenities.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                >
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
