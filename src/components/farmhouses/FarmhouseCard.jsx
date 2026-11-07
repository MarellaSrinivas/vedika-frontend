
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Star,
  ArrowRight,
} from "lucide-react";

import { isLoggedIn } from "../../utils/auth";
import "./FarmhouseCard.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80";

const money = (value) =>
  Number(value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

export default function FarmhouseCard({ farmhouse }) {
  const navigate = useNavigate();

  const [imageIndex, setImageIndex] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  const images = Array.isArray(farmhouse.images)
    ? farmhouse.images.filter(Boolean)
    : [];

  const image = images[imageIndex] || FALLBACK_IMAGE;

  const price = Number(farmhouse.basePrice ?? 0);
  const originalPrice = Number(farmhouse.weekendPrice ?? 0);

  const discount =
    originalPrice > price && price > 0
      ? Math.round(
          ((originalPrice - price) / originalPrice) * 100
        )
      : null;

  const detailsUrl = `/farmhouses/${farmhouse.id}`;

  // Protect farmhouse details navigation.
  const handleViewDetails = () => {
    if (!isLoggedIn()) {
      navigate(
        `/login?redirect=${encodeURIComponent(detailsUrl)}`
      );
      return;
    }

    navigate(detailsUrl);
  };

  const handleWishlist = (event) => {
    event.stopPropagation();
    setWishlisted((current) => !current);
  };

  const handleImageChange = (event, index) => {
    event.stopPropagation();
    setImageIndex(index);
  };

  return (
    <article className="vd-farmhouse-card">
      <div className="vd-card-image-wrap">
        <button
          type="button"
          className="vd-card-image-link"
          aria-label={`View ${farmhouse.name}`}
          onClick={handleViewDetails}
        >
          <img
            src={image}
            alt={farmhouse.name || "Farmhouse"}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </button>

        {discount !== null && (
          <span className="vd-discount-badge">
            {discount}% OFF
          </span>
        )}

        <span className="vd-date-badge">
          {new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </span>

        <button
          type="button"
          className={`vd-heart-button ${
            wishlisted ? "is-active" : ""
          }`}
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-pressed={wishlisted}
          onClick={handleWishlist}
        >
          <Heart
            size={18}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>

        {images.length > 1 && (
          <div className="vd-image-dots">
            {images.slice(0, 5).map((_, index) => (
              <button
                type="button"
                key={index}
                aria-label={`Show image ${index + 1}`}
                className={
                  index === imageIndex ? "active" : ""
                }
                onClick={(event) =>
                  handleImageChange(event, index)
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className="vd-card-body">
        <div className="vd-card-title-row">
          <button
            type="button"
            className="vd-card-title"
            onClick={handleViewDetails}
          >
            {farmhouse.name}
          </button>

          {farmhouse.rating != null && (
            <span className="vd-card-rating">
              <Star size={13} fill="currentColor" />
              {Number(farmhouse.rating).toFixed(1)}
            </span>
          )}
        </div>

        <p className="vd-card-location">
          <MapPin size={12} />
          <span>
            {farmhouse.location || "Hyderabad"}
          </span>
        </p>

        <div className="vd-card-footer">
          <div className="vd-price-block">
            {originalPrice > price && (
              <span className="vd-original-price">
                ₹{money(originalPrice)}
              </span>
            )}

            <div>
              <strong>₹{money(price)}</strong>
              <span className="vd-price-unit">
                {" "}/ night
              </span>
            </div>
          </div>

          <button
            type="button"
            className="vd-reserve-button"
            onClick={handleViewDetails}
          >
            Reserve <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}
