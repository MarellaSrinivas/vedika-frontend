
import { Link } from "react-router-dom";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import "./HomeBanners.css";
import farmhouseBg from "../../assets/farmhouse.png";


export default function HomeBanners() {
  return (
    <section className="vd-hero-grid">
      <article className="vd-hero-banner vd-hero-banquet">
        <div className="vd-hero-overlay" />

        <div className="vd-hero-content">
          <span className="vd-hero-tag">
            ✦ THE VEDIKA BANQUET HALL
          </span>

          <span className="vd-hero-top-action">
            <Play size={12} />
            Watch Video
          </span>

          <h1>A Grand Stage for Your Big Day</h1>

          <p>
            Air-conditioned ballrooms and expansive party lawns
            for weddings, celebrations, and unforgettable events.
          </p>

          <div className="vd-hero-actions">
            <Link
              to="/farmhouses?type=banquet"
              className="vd-primary-button"
            >
              Book Venue <ArrowRight size={15} />
            </Link>

            <span className="vd-hero-note">
              Capacity: 200–800 guests
            </span>
          </div>
        </div>
      </article>

<article
  className="vd-hero-banner vd-hero-retreat"
  style={{ "--hero-bg": `url(${farmhouseBg})` }}
>        <div className="vd-hero-overlay" />

        <div className="vd-hero-content">
          <span className="vd-hero-tag">
            ✦ THE VEDIKA PRIVATE RETREATS
          </span>

          <span className="vd-hero-top-action">
            <ShieldCheck size={12} />
            Handpicked Stays
          </span>

          <h2>Exclusive Farmhouses with Private Pools</h2>

          <p>
            Discover scenic getaways around Hyderabad.
            Perfect for family reunions, weekend escapes,
            and private celebrations.
          </p>

          <div className="vd-hero-actions">
            <Link to="/farmhouses" className="vd-light-button">
              Explore Farmhouses <ArrowRight size={15} />
            </Link>

            <span className="vd-hero-note">
              Private lawns, pools &amp; outdoor spaces
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}
