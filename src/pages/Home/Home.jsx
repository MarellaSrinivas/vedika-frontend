import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getFarmhouses,
  getFeaturedFarmhouses,
} from "../../api/farmhouseApi";
import HomeBanners from "../../components/home/HomeBanners";
import LocationFilters from "../../components/home/LocationFilters";
import FarmhouseCard from "../../components/farmhouses/FarmhouseCard";

import "./Home.css";

export default function Home() {
  const [farmhouses, setFarmhouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [featuredFarmhouses, setFeaturedFarmhouses] = useState([]);
const [featuredLoading, setFeaturedLoading] = useState(true);
const [featuredError, setFeaturedError] = useState("");

  const loadFarmhouses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFarmhouses();

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
          ? response.content
          : Array.isArray(response?.data)
            ? response.data
            : [];

      setFarmhouses(list);
    } catch (err) {
      console.error("Unable to load farmhouses:", err);
      setError("We couldn't load stays right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFarmhouses();
  }, [loadFarmhouses]);

  // Build location filters from all farmhouses.
  const locations = useMemo(() => {
    const counts = new Map();

    farmhouses.forEach((farmhouse) => {
      const area = (farmhouse.location || "").split(",")[0].trim();

      if (area) {
        counts.set(area, (counts.get(area) || 0) + 1);
      }
    });

    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({
        value,
        label: value,
        count,
      }));
  }, [farmhouses]);

  // Check whether a farmhouse has a genuine discount.
  const hasDeal = (farmhouse) => {
    const originalPrice = Number(
      farmhouse.originalPrice ??
      farmhouse.weekendPrice ??
      farmhouse.basePrice ??
      farmhouse.price ??
      0
    );

    const dealPrice = Number(
      farmhouse.dealPrice ??
      farmhouse.discountedPrice ??
      farmhouse.basePrice ??
      farmhouse.price ??
      0
    );

    const discount = Number(farmhouse.discount ?? 0);

    return (
      farmhouse.featured === true &&
      (
        (originalPrice > 0 && dealPrice > 0 && dealPrice < originalPrice) ||
        discount > 0
      )
    );
  };

  // Featured farmhouses with discounts only; maximum 4.
  const dealFarmhouses = useMemo(() => {
    return farmhouses
      .filter(hasDeal)
      .slice(0, 4);
  }, [farmhouses]);

  // Location filter and sorting apply to the All Farmhouses section.
  const visibleFarmhouses = useMemo(() => {
    let result = [...farmhouses];

    if (selectedLocation) {
      result = result.filter((farmhouse) =>
        (farmhouse.location || "")
          .toLowerCase()
          .includes(selectedLocation.toLowerCase())
      );
    }

    const getPrice = (farmhouse) =>
      Number(farmhouse.basePrice ?? farmhouse.price ?? 0);

    if (sortBy === "price-low") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortBy === "rating") {
      result.sort(
        (a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0)
      );
    }

    return result;
  }, [farmhouses, selectedLocation, sortBy]);

  const loadFeaturedFarmhouses = useCallback(async () => {
  try {
    setFeaturedLoading(true);
    setFeaturedError("");

    const response = await getFeaturedFarmhouses();

    const list = Array.isArray(response)
      ? response
      : Array.isArray(response?.content)
        ? response.content
        : Array.isArray(response?.data)
          ? response.data
          : [];

    setFeaturedFarmhouses(list.slice(0, 4));
  } catch (err) {
    console.error("Unable to load featured farmhouses:", err);
    setFeaturedError("Unable to load featured stays right now.");
  } finally {
    setFeaturedLoading(false);
  }
}, []);

useEffect(() => {
  loadFeaturedFarmhouses();
}, [loadFeaturedFarmhouses]);

  return (
    <div className="vd-page">
      <main className="vd-home-main">
        <HomeBanners />

        {/* Fetured Properties */}
        <section className="vd-deals-section" id="vd-deals">
          <div className="vd-section-heading">
            <div className="vd-section-title-wrap">
              <h2>
                <span className="vd-live-dot" />
                Featured Properties
              </h2>

              <span className="vd-limited-badge">
                Limited Time Only
              </span>
            </div>

            <Link to="/farmhouses" className="vd-view-all">
              View all stays <span>→</span>
            </Link>
          </div>

          {featuredLoading ? (
  <div className="vd-state-panel" role="status">
    <div className="vd-spinner" />
    <p>Finding featured getaways...</p>
  </div>
) : featuredError ? (
  <div className="vd-state-panel" role="alert">
    <p>{featuredError}</p>

    <button
      type="button"
      className="vd-primary-button"
      onClick={loadFeaturedFarmhouses}
    >
      Try again
    </button>
  </div>
) : featuredFarmhouses.length === 0 ? (
  <div className="vd-state-panel">
    <p>No featured farmhouses are available right now.</p>
  </div>
) : (
  <div className="vd-farmhouse-grid">
    {featuredFarmhouses.map((farmhouse) => (
      <FarmhouseCard
        key={farmhouse.id}
        farmhouse={farmhouse}
      />
    ))}
  </div>
)}
        </section>

        {/* ALL FARMHOUSES */}
        <section className="vd-all-farmhouses-section" id="all-farmhouses">
          <div className="vd-all-heading">
            <div>
              <span className="vd-section-eyebrow">
                FIND YOUR PERFECT GETAWAY
              </span>
              <h2 className="vd-all-title">Explore All Farmhouses</h2>
              <p className="vd-all-description">
                Discover the perfect stay for your next escape.
              </p>
            </div>

            <span className="vd-farmhouse-count">
              {visibleFarmhouses.length} stays
            </span>
          </div>

          <LocationFilters
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            totalCount={farmhouses.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {loading ? (
            <div className="vd-state-panel" role="status">
              <div className="vd-spinner" />
              <p>Loading all farmhouses...</p>
            </div>
          ) : error ? (
            <div className="vd-state-panel" role="alert">
              <p>{error}</p>
              <button
                type="button"
                className="vd-primary-button"
                onClick={loadFarmhouses}
              >
                Try again
              </button>
            </div>
          ) : visibleFarmhouses.length === 0 ? (
            <div className="vd-state-panel">
              <p>
                {selectedLocation
                  ? "No farmhouses found in this location."
                  : "No farmhouses are available right now."}
              </p>

              {selectedLocation && (
                <button
                  type="button"
                  className="vd-text-button"
                  onClick={() => setSelectedLocation("")}
                >
                  Show all locations
                </button>
              )}
            </div>
          ) : (
            <div className="vd-farmhouse-grid">
              {visibleFarmhouses.map((farmhouse) => (
                <FarmhouseCard
                  key={farmhouse.id}
                  farmhouse={farmhouse}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}