
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import vedikaLogo from "../../assets/logo.png";
import {
  Search,
  Heart,
  UserRound,
  Phone,
  Menu,
  X,
  ChevronDown,
  Megaphone,
  MessageSquareText,
  Navigation,
} from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const closeMenu = () => setMobileOpen(false);

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (value) {
      window.location.href = `/farmhouses?location=${encodeURIComponent(value)}`;
    }
  };

  return (
    <header className="vd-header">
      {/* Top promotional bar */}
      <div className="vd-promo">
        <div className="vd-promo-inner">
          <span className="vd-promo-label">
            <Megaphone size={14} strokeWidth={2.5} />
            <span>CURATED STAYS HYDERABAD</span>
          </span>

          <p className="vd-promo-message">
            Weekend Getaways: Book your private farmhouse retreat
            &amp; get 25% off + complimentary barbecue setup.
          </p>

          <a href="tel:+917674040033" className="vd-promo-phone">
            <Phone size={13} />
            <span>+91 76740 40033</span>
          </a>
        </div>
      </div>

      {/* Main navigation */}
      <div className="vd-navbar">
        {/* Brand logo with tagline included in the image */}
       {/* Brand: logo + editable title and tagline */}
<Link
  to="/"
  className="vd-brand"
  onClick={closeMenu}
  aria-label="The Vedika home"
>
  <img
    src={vedikaLogo}
    alt="The Vedika logo"
    className="vd-brand-logo"
  />

  <span className="vd-brand-text">
    <strong>The Vedika</strong>
    <small>Your Private Farmhouse Retreat</small>
  </span>
</Link>

        {/* Location selector */}
        <button
          type="button"
          className="vd-location-button"
          onClick={() =>
            document
              .getElementById("vd-location-filters")
              ?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
          }
          aria-label="Select location: Hyderabad, all zones"
        >
          <Navigation size={16} strokeWidth={2.4} />
          <span>Hyderabad / All Zones</span>
          <ChevronDown size={15} />
        </button>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="vd-mobile-toggle"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Navigation links */}
        <nav
          className={`vd-nav-links ${mobileOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <NavLink
            to="/farmhouses"
            end
            onClick={closeMenu}
            className={({ isActive }) =>
              `vd-nav-link vd-farmhouse-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Farmhouses
          </NavLink>

          <NavLink
            to="/farmhouses?type=banquet"
            onClick={closeMenu}
            className="vd-nav-link"
          >
            <span>Banquets & Resorts</span>
          </NavLink>

          {/* <NavLink
            to="/farmhouses?type=private-villa"
            onClick={closeMenu}
            className="vd-nav-link"
          >
            <span>Private</span>
            <span>Villas</span>
          </NavLink> */}
        </nav>

        {/* Search */}
        <form
          className="vd-search"
          onSubmit={handleSearch}
          role="search"
        >
          <Search size={17} strokeWidth={2} />

          <input
            aria-label="Search farmhouses"
            placeholder="Search villas, pools..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <span className="vd-search-shortcut" aria-hidden="true">
            ⌘K
          </span>
        </form>

        {/* WhatsApp */}
        <a
          className="vd-whatsapp"
          href="https://wa.me/917674040033"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageSquareText size={17} strokeWidth={2.2} />
          <span>WhatsApp</span>
        </a>

        {/* Wishlist */}
        <Link
          to="/wishlist"
          className="vd-icon-button"
          aria-label="Wishlist"
        >
          <Heart size={23} strokeWidth={2} />
        </Link>

        {/* Account */}
        <Link
          to="/login"
          className="vd-account-button"
          aria-label="My account"
        >
          <UserRound size={17} strokeWidth={2.4} />
        </Link>
      </div>
    </header>
  );
}
