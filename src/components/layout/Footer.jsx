import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Heart,
} from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="vd-footer">
      {/* Newsletter section */}
      {/* <section className="vd-footer-newsletter">
        <div className="vd-footer-container vd-newsletter-inner">
          <div className="vd-newsletter-content">
            <span className="vd-footer-eyebrow">
              THE VEDIKA EXPERIENCE
            </span>

            <h2>Make Every Getaway Special</h2>

            <p>
              Discover beautiful farmhouses, private pools, and
              unforgettable weekend escapes around Hyderabad.
            </p>
          </div>

          <Link to="/farmhouses" className="vd-newsletter-button">
            Explore Stays
            <ArrowRight size={17} />
          </Link>
        </div>
      </section> */}

      {/* Main footer */}
      <div className="vd-footer-main">
        <div className="vd-footer-container vd-footer-grid">
          {/* Brand */}
          <div className="vd-footer-brand-column">
            <Link to="/" className="vd-footer-brand">
              <span className="vd-footer-brand-icon">V</span>
              <span>
                The <strong>Vedika</strong>
              </span>
            </Link>

            <p className="vd-footer-description">
              Your escape from the everyday. Find the perfect
              farmhouse for family gatherings, celebrations, and
              peaceful weekends with the people you love.
            </p>

            <div className="vd-footer-socials">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                f
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                IG
              </a>

              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                YT
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="vd-footer-column">
            <h3>Explore</h3>

            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/farmhouses">All Farmhouses</Link></li>
              <li>
                <Link to="/farmhouses?type=banquet">
                  Banquets &amp; Resorts
                </Link>
              </li>
              <li>
                <Link to="/farmhouses?type=private-villa">
                  Private Villas
                </Link>
              </li>
              <li>
                <Link to="/farmhouses">Weekend Getaways</Link>
              </li>
            </ul>
          </div>

          {/* Customer support */}
          <div className="vd-footer-column">
            <h3>Customer Support</h3>

            <ul>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/login">My Account</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li>
                <Link to="/faq">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/cancellation-policy">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="vd-footer-column vd-footer-contact">
            <h3>Get In Touch</h3>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Hyderabad%2C+Telangana"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={17} />
              <span>Hyderabad, Telangana, India</span>
            </a>

            <a href="tel:+917674040033">
              <Phone size={17} />
              <span>+91 76740 40033</span>
            </a>

            <a href="mailto:support@thevedika.com">
              <Mail size={17} />
              <span>support@thevedika.com</span>
            </a>

            <div className="vd-footer-contact-note">
              Need help planning your next getaway? We are here
              to help.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="vd-footer-bottom">
        <div className="vd-footer-container vd-footer-bottom-inner">
          <p>
            © {currentYear} The Vedika. All rights reserved.
          </p>

          <div className="vd-footer-legal-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">
              Terms &amp; Conditions
            </Link>
          </div>

          <p className="vd-footer-made">
            Made with <Heart size={13} fill="currentColor" />
            <span>for memorable getaways</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
