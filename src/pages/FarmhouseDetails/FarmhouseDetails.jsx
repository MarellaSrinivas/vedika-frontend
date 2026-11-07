import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Star,
  Users,
  BedDouble,
  Bath,
  Check,
  Wifi,
  Waves,
  Wind,
  CarFront,
  CookingPot,
  Flame,
  Gamepad2,
  ShieldCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
  Tv, Music, Trees, Utensils, Coffee, Dumbbell, CalendarDays, Sparkles, Info, Navigation,
} from "lucide-react";

import { getFarmhouseById, getFarmhouseAmenities  } from "../../api/farmhouseApi";
import FarmhouseAvailability from "../../components/FarmhouseAvailability";
import "./FarmhouseDetails.css";

const amenityIcons = {
  "Private Pool": Waves,
  "Swimming Pool": Waves,
  Pool: Waves,
  "AC Rooms": Wind,
  AC: Wind,
  Wifi,
  WiFi: Wifi,
  Parking: CarFront,
  Kitchen: CookingPot,
  BBQ: Flame,
  Barbecue: Flame,
  Bonfire: Flame,
  "Indoor Games": Gamepad2,
  "Music System": Music,
  "Large Lawn": Trees,
  Garden: Trees,
TV: Tv,
  Television: Tv,
  "Dining Area": Utensils,
  Restaurant: Utensils,
  "Outdoor Seating": Trees,
  "Coffee Maker": Coffee,
  Gym: Dumbbell,
};

const fallbackImage =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=85";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const getList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const getImageUrl = (image) => {
  if (typeof image === "string") return image;

  return (
    image?.imageUrl ||
    image?.image_url ||
    image?.url ||
    image?.photoUrl ||
    image?.path ||
    ""
  );
};

const getAmenityName = (amenity) => {
  if (typeof amenity === "string") return amenity;

  return (
    amenity?.name ||
    amenity?.amenityName ||
    amenity?.title ||
    ""
  );
};

function FarmhouseDetails() {
  const { id } = useParams();

  const [farmhouse, setFarmhouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  const loadFarmhouse = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFarmhouseById(id);
      const property = response?.data ?? response;

      setFarmhouse(property);
      setSelectedImage(0);
    } catch (err) {
      console.error("Unable to load farmhouse:", err);
      setError("We couldn't load this farmhouse. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadFarmhouse();
  }, [loadFarmhouse]);

  const imageList = useMemo(() => {
    if (!farmhouse) return [];

    const images = getList(farmhouse.images)
      .map(getImageUrl)
      .filter(Boolean);

    if (farmhouse.mainImage) {
      const mainImage = getImageUrl(farmhouse.mainImage);

      if (mainImage && !images.includes(mainImage)) {
        images.unshift(mainImage);
      }
    }

    if (farmhouse.imageUrl && !images.includes(farmhouse.imageUrl)) {
      images.unshift(farmhouse.imageUrl);
    }

    return images.length ? images : [fallbackImage];
  }, [farmhouse]);
const [amenities, setAmenities] = useState([]);
const [amenitiesLoading, setAmenitiesLoading] = useState(true);
const [amenitiesError, setAmenitiesError] = useState("");

  const addOns = useMemo(
    () => getList(farmhouse?.addOns || farmhouse?.addons),
    [farmhouse]
  );

  const reviews = useMemo(
    () => getList(farmhouse?.reviews),
    [farmhouse]
  );

  const rating = Number(farmhouse?.rating || 0);
  const reviewCount = Number(
    farmhouse?.reviewCount ?? farmhouse?.reviewsCount ?? reviews.length
  );

  const maximumGuests = Number(
    farmhouse?.maximumGuests ?? farmhouse?.guests ?? 0
  );

  const minimumGuests = Number(farmhouse?.minimumGuests ?? 5);
  const bedrooms = farmhouse?.bedrooms ?? "—";
  const bathrooms = farmhouse?.bathrooms ?? "—";

  const basePrice = Number(
    farmhouse?.basePrice ?? farmhouse?.price ?? 0
  );

  const weekendPrice = Number(farmhouse?.weekendPrice ?? 0);

  const showPreviousImage = () => {
    setSelectedImage((current) =>
      current === 0 ? imageList.length - 1 : current - 1
    );
  };

  const showNextImage = () => {
    setSelectedImage((current) =>
      current === imageList.length - 1 ? 0 : current + 1
    );
  };

  useEffect(() => {
  if (!id) return;

  const loadAmenities = async () => {
    try {
      setAmenitiesLoading(true);
      setAmenitiesError("");

      const response = await getFarmhouseAmenities(id);

      // Supports a plain list or common Spring response wrappers.
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.content)
            ? response.content
            : [];

      // Backend returns FarmhouseAmenity records.
      const formattedAmenities = list
        .map((item) => {
          const amenity = item.amenity ?? item;

          return {
            id: item.id ?? amenity.id,
            name:
              amenity.name ??
              item.amenityName ??
              item.name ??
              "",
          };
        })
        .filter((item) => item.name);

      setAmenities(formattedAmenities);
    } catch (error) {
      console.error("Unable to load farmhouse amenities:", error);
      setAmenitiesError("Unable to load amenities. Please try again.");
    } finally {
      setAmenitiesLoading(false);
    }
  };

  loadAmenities();
}, [id]);

  const locationText = farmhouse?.location || "";
  const mapQuery = encodeURIComponent(
    [farmhouse?.name, locationText].filter(Boolean).join(", ")
  );

  const rules = getList(farmhouse?.houseRules || farmhouse?.rules);
  const description =
    farmhouse?.description ||
    "Enjoy a private getaway with family and friends in a comfortable setting.";

  if (loading) {
    return (
      <main className="fd-page">
        <div className="fd-container fd-loading">
          <div className="fd-spinner" />
          <p>Loading farmhouse details...</p>
        </div>
      </main>
    );
  }

  if (error || !farmhouse) {
    return (
      <main className="fd-page">
        <div className="fd-container fd-error">
          <Info size={34} />
          <h1>{error ? "Unable to load property" : "Farmhouse not found"}</h1>
          <p>
            {error ||
              "This property may have been removed or the link is incorrect."}
          </p>
          {error && (
            <button className="fd-primary-button" onClick={loadFarmhouse}>
              Try again
            </button>
          )}
          <Link to="/farmhouses" className="fd-secondary-button">
            Browse farmhouses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="fd-page">
      <div className="fd-container">
        {/* Breadcrumb and title */}

        <div className="fd-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={13} />
          <Link to="/farmhouses">Farmhouses</Link>
          <ChevronRight size={13} />
          <span>{farmhouse.name}</span>
        </div>

        <div className="fd-title-row">
          <div>
            <span className="fd-eyebrow">YOUR PRIVATE GETAWAY</span>

            <h1>{farmhouse.name}</h1>

            <div className="fd-title-meta">
              {rating > 0 && (
                <span className="fd-rating">
                  <Star size={15} fill="currentColor" />
                  <strong>{rating.toFixed(1)}</strong>
                  {reviewCount > 0 && (
                    <span>({reviewCount} reviews)</span>
                  )}
                </span>
              )}

              {locationText && (
                <span className="fd-location">
                  <MapPin size={15} />
                  {locationText}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className={`fd-save-button ${wishlisted ? "active" : ""}`}
            onClick={() => setWishlisted((value) => !value)}
            aria-pressed={wishlisted}
          >
            <Heart
              size={17}
              fill={wishlisted ? "currentColor" : "none"}
            />
            {wishlisted ? "Saved" : "Save property"}
          </button>
        </div>

        {/* Property gallery */}

        <section className="fd-gallery">
          <div className="fd-gallery-main">
            <img
              src={imageList[selectedImage]}
              alt={`${farmhouse.name} property`}
            />

            {imageList.length > 1 && (
              <>
                <button
                  className="fd-gallery-arrow fd-gallery-prev"
                  onClick={showPreviousImage}
                  aria-label="Previous image"
                  type="button"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  className="fd-gallery-arrow fd-gallery-next"
                  onClick={showNextImage}
                  aria-label="Next image"
                  type="button"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <span className="fd-photo-count">
              {selectedImage + 1} / {imageList.length} photos
            </span>
          </div>

          <div className="fd-gallery-side">
            {imageList.slice(0, 4).map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={`fd-gallery-tile ${
                  selectedImage === index ? "selected" : ""
                }`}
                onClick={() => setSelectedImage(index)}
                aria-label={`View property photo ${index + 1}`}
              >
                <img src={image} alt="" loading="lazy" />
                {index === 3 && imageList.length > 4 && (
                  <span>+{imageList.length - 4} photos</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Quick property facts */}

        <section className="fd-quick-facts">
          <div className="fd-fact">
            <Users />
            <strong>{maximumGuests || "—"} Guests</strong>
            <span>Maximum capacity</span>
          </div>

          <div className="fd-fact">
            <BedDouble />
            <strong>{bedrooms} Bedrooms</strong>
            <span>Sleeping spaces</span>
          </div>

          <div className="fd-fact">
            <Bath />
            <strong>{bathrooms} Bathrooms</strong>
            <span>Guest facilities</span>
          </div>

          <div className="fd-fact">
            <Clock />
            <strong>{farmhouse.checkInTime || "2:00 PM"}</strong>
            <span>Check-in time</span>
          </div>

          <div className="fd-fact">
            <CalendarDays />
            <strong>{farmhouse.checkOutTime || "11:00 AM"}</strong>
            <span>Check-out time</span>
          </div>

          <div className="fd-fact">
            <ShieldCheck />
            <strong>Private Stay</strong>
            <span>Property experience</span>
          </div>
        </section>

        {/* Main content and booking sidebar */}

        <div className="fd-main-layout">
          <div className="fd-information">
            {/* Description */}

             

            {/* Amenities */}

           <section className="fd-section">
  <span className="fd-section-kicker">COMFORT & FACILITIES</span>

  <h2>What this place offers</h2>

  <p className="fd-section-subtitle">
    Explore the facilities available at this farmhouse.
  </p>

  {amenitiesLoading ? (
    <div className="fd-empty-note">
      Loading farmhouse amenities...
    </div>
  ) : amenitiesError ? (
    <div className="fd-empty-note">
      <p>{amenitiesError}</p>

      <button
        type="button"
        className="fd-secondary-button"
        onClick={async () => {
          try {
            setAmenitiesLoading(true);
            setAmenitiesError("");

            const response = await getFarmhouseAmenities(id);

            const list = Array.isArray(response)
              ? response
              : Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.content)
                  ? response.content
                  : [];

            setAmenities(
              list
                .map((item) => {
                  const amenity = item.amenity ?? item;

                  return {
                    id: item.id ?? amenity.id,
                    name:
                      amenity.name ??
                      item.amenityName ??
                      item.name ??
                      "",
                  };
                })
                .filter((item) => item.name)
            );
          } catch (error) {
            console.error(error);
            setAmenitiesError("Unable to load amenities. Please try again.");
          } finally {
            setAmenitiesLoading(false);
          }
        }}
      >
        Try again
      </button>
    </div>
  ) : amenities.length === 0 ? (
    <div className="fd-empty-note">
      No amenities have been added to this farmhouse yet.
    </div>
  ) : (
    <div className="fd-amenities-grid">
      {amenities.map((amenity) => {
        const Icon =
          amenityIcons[amenity.name] || Check;

        return (
          <div
            className="fd-amenity"
            key={amenity.id ?? amenity.name}
          >
            <span>
              <Icon size={18} />
            </span>

            <strong>{amenity.name}</strong>
          </div>
        );
      })}
    </div>
  )}
</section>

            {/* Add-on services */}

            {addOns.length > 0 && (
              <section className="fd-section">
                <span className="fd-section-kicker">PERSONALISE YOUR STAY</span>
                <h2>Optional Add-ons</h2>
                <p className="fd-section-subtitle">
                  Additional services available at this property.
                </p>

                <div className="fd-addon-list">
                  {addOns.map((addon, index) => {
                    const name =
                      addon.name || addon.title || addon.addOnName || "Extra service";
                    const price = addon.price ?? addon.amount;

                    return (
                      <div className="fd-addon" key={addon.id || index}>
                        <span className="fd-addon-icon">
                          <Sparkles size={18} />
                        </span>
                        <div>
                          <strong>{name}</strong>
                          {addon.description && <p>{addon.description}</p>}
                        </div>
                        {price != null && (
                          <strong className="fd-addon-price">
                            {formatPrice(price)}
                          </strong>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* House rules */}

            <section className="fd-section">
              <span className="fd-section-kicker">A FEW THINGS TO KNOW</span>
              <h2>House Rules &amp; Guest Guidelines</h2>
              <p className="fd-section-subtitle">
                Please review these details before confirming your stay.
              </p>

              <div className="fd-rules-grid">
                <div className="fd-rule-card">
                  <Clock />
                  <div>
                    <h3>Check-in &amp; Check-out</h3>
                    <p>
                      Check-in: {farmhouse.checkInTime || "2:00 PM"}.
                      Check-out: {farmhouse.checkOutTime || "11:00 AM"}.
                    </p>
                  </div>
                </div>

                <div className="fd-rule-card">
                  <Users />
                  <div>
                    <h3>Guest Limit</h3>
                    <p>
                      Minimum {minimumGuests} guests.
                      Maximum {maximumGuests || "as per property capacity"} guests.
                    </p>
                  </div>
                </div>

                <div className="fd-rule-card">
                  <ShieldCheck />
                  <div>
                    <h3>Events &amp; Celebrations</h3>
                    <p>
                      Confirm event permissions and additional charges
                      with the property before booking.
                    </p>
                  </div>
                </div>

                <div className="fd-rule-card">
                  <CookingPot />
                  <div>
                    <h3>Cooking &amp; Food</h3>
                    <p>
                      Check cooking facilities and food arrangements
                      before your visit.
                    </p>
                  </div>
                </div>

                {rules.map((rule, index) => {
                  const title =
                    typeof rule === "string"
                      ? rule
                      : rule.title || rule.name || "Property rule";

                  const text =
                    typeof rule === "string"
                      ? ""
                      : rule.description || rule.details || "";

                  return (
                    <div className="fd-rule-card" key={rule.id || index}>
                      <Check />
                      <div>
                        <h3>{title}</h3>
                        {text && <p>{text}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="fd-notice">
                <ShieldCheck size={21} />
                <div>
                  <strong>Before you book</strong>
                  <p>
                    Review the guest capacity, facilities, optional services
                    and property rules. Additional services may have separate
                    charges.
                  </p>
                </div>
              </div>
            </section>

            {/* Location */}

            <section className="fd-section">
              <span className="fd-section-kicker">EXPLORE THE AREA</span>
              <h2>Location &amp; Neighbourhood</h2>
              <p className="fd-section-subtitle">
                Find the property and explore its surroundings.
              </p>

              {locationText ? (
                <>
                  <div className="fd-map">
                    <iframe
                      title={`${farmhouse.name} location map`}
                      src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>

                  <div className="fd-location-address">
                    <span>
                      <MapPin size={20} />
                    </span>
                    <div>
                      <strong>{farmhouse.name}</strong>
                      <p>{locationText}</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Navigation size={15} />
                      Directions
                    </a>
                  </div>
                </>
              ) : (
                <div className="fd-empty-note">
                  Location information will be updated soon.
                </div>
              )}
            </section>

            {/* Reviews */}

            <section className="fd-section fd-reviews-section">
              <div className="fd-reviews-heading">
                <div>
                  <span className="fd-section-kicker">GUEST EXPERIENCES</span>
                  <h2>Guest Reviews</h2>
                  <p className="fd-section-subtitle">
                    Feedback from guests who stayed here.
                  </p>
                </div>

                {rating > 0 && (
                  <div className="fd-rating-summary">
                    <Star size={18} fill="currentColor" />
                    <strong>{rating.toFixed(1)} / 5.0</strong>
                    <span>{reviewCount} reviews</span>
                  </div>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="fd-review-list">
                  {reviews.map((review, index) => (
                    <article
                      className="fd-review-card"
                      key={review.id || index}
                    >
                      <div className="fd-review-top">
                        <strong>
                          {review.customerName ||
                            review.userName ||
                            review.name ||
                            "Guest"}
                        </strong>
                        <span>
                          <Star size={13} fill="currentColor" />
                          {Number(review.rating || 0).toFixed(1)}
                        </span>
                      </div>

                      <p>
                        {review.comment ||
                          review.description ||
                          "Thank you for sharing your experience."}
                      </p>

                      {review.createdAt && (
                        <small>
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-IN",
                            { month: "short", year: "numeric" }
                          )}
                        </small>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="fd-empty-note">
                  {reviewCount > 0
                    ? `${reviewCount} guest ratings are available. Written reviews will appear here when provided by the backend.`
                    : "Be among the first guests to review this farmhouse."}
                </div>
              )}
            </section>
          </div>

          {/* Booking panel */}

          <aside className="fd-booking-card">
            <div className="fd-price-header">
              <div>
                <span className="fd-price-label">STARTING PRICE</span>
                <div className="fd-price">
                  {formatPrice(basePrice)}
                  <small> / night</small>
                </div>
                <p>Base accommodation fare</p>
              </div>

              <span className="fd-price-badge">Best stay</span>
            </div>

            {weekendPrice > 0 && (
              <div className="fd-weekend-price">
                <span>Weekend rate</span>
                <strong>{formatPrice(weekendPrice)}</strong>
              </div>
            )}

            <div className="fd-price-info">
              <Users size={16} />
              <span>
                Base fare covers the first {minimumGuests} guests.
              </span>
            </div>

            {farmhouse.extraGuestPrice > 0 && (
              <div className="fd-price-info">
                <Info size={16} />
                <span>
                  Extra guest charge:{" "}
                  <strong>{formatPrice(farmhouse.extraGuestPrice)}</strong>
                  {" "}per guest.
                </span>
              </div>
            )}

            <div className="fd-booking-divider" />

            <FarmhouseAvailability farmhouse={farmhouse} />
          </aside>
        </div>
      </div>
    </main>
  );
}

export default FarmhouseDetails;