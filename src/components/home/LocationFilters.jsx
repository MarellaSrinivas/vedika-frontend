
import { Link } from "react-router-dom";
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
} from "lucide-react";

import "./LocationFilters.css";

export default function LocationFilters({
  locations = [],
  selectedLocation = "",
  onSelectLocation,
  totalCount = 0,
  sortBy = "popular",
  onSortChange,
}) {
  const allLocations = [
    { label: "All Locations", value: "", count: totalCount },
    ...locations,
  ];

  return (
    <section
      className="vd-location-bar"
      id="vd-location-filters"
      aria-label="Filter farmhouses"
    >
      <div className="vd-location-chips">
        {allLocations.map((location) => (
          <button
            type="button"
            key={location.value || "all"}
            className={`vd-location-chip ${
              selectedLocation === location.value ? "selected" : ""
            }`}
            onClick={() => onSelectLocation?.(location.value)}
            aria-pressed={selectedLocation === location.value}
          >
            {location.label}
            <span className="vd-chip-count">{location.count}</span>
          </button>
        ))}
      </div>

      <div className="vd-filter-actions">
        <button
          type="button"
          className="vd-filter-button"
          onClick={() =>
            document
              .getElementById("vd-date-strip")
              ?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
          }
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>

        <label className="vd-sort-control">
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(event) =>
              onSortChange?.(event.target.value)
            }
            aria-label="Sort farmhouses"
          >
            <option value="popular">Popularity</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </label>

        <button
          type="button"
          className="vd-view-button active"
          aria-label="Scroll to farmhouse grid"
          onClick={() =>
            document
              .getElementById("vd-deals")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <LayoutGrid size={16} />
        </button>

        <Link
          to="/farmhouses"
          className="vd-view-button"
          aria-label="View all farmhouses"
          title="View all farmhouses"
        >
          <List size={16} />
        </Link>
      </div>
    </section>
  );
}
