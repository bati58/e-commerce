import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient.js";
import ProductCard from "../components/ProductCard.jsx";

const FLASH_SALE_START_SECONDS = 2 * 60 * 60 + 12 * 60 + 45;

const CATEGORY_TILES = [
  { name: "Electronics", search: "electronics", description: "Phones, audio, gadgets" },
  { name: "Clothes", search: "clothes", description: "Daily style essentials" },
  { name: "Watches", search: "watch", description: "Classic and smart styles" },
  { name: "Socks", search: "socks", description: "Comfort packs for every day" },
  { name: "Hats", search: "hat", description: "Caps, beanies, bucket hats" },
  { name: "Eye Glasses", search: "glasses", description: "Blue-light and fashion frames" },
];

const TRUST_POINTS = [
  {
    badge: "FS",
    title: "Free Shipping",
    description: "Free shipping on eligible orders above $49.",
  },
  {
    badge: "SP",
    title: "Secure Payments",
    description: "Protected checkout with trusted payment partners.",
  },
  {
    badge: "ER",
    title: "Easy Returns",
    description: "Simple return policy with quick support.",
  },
];

const TESTIMONIALS = [
  {
    name: "Nadia R.",
    text: "Fast delivery and the quality matched exactly what I saw online.",
  },
  {
    name: "Michael T.",
    text: "Checkout was smooth and customer support answered right away.",
  },
  {
    name: "Aisha K.",
    text: "Great pricing on watches and clothing. I will order again.",
  },
];

const formatCountdown = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const ProductRailSection = ({ title, products }) => {
  return (
    <section className="home-section">
      <div className="section-head">
        <h2>{title}</h2>
      </div>
      {products.length === 0 ? (
        <p className="section-note">Products will appear here when data is available.</p>
      ) : (
        <div className="product-rail">
          {products.map((product) => (
            <ProductCard key={`${title}-${product._id}`} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(FLASH_SALE_START_SECONDS);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    apiClient
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((previous) =>
        previous <= 1 ? FLASH_SALE_START_SECONDS : previous - 1
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isSubscribed) return;
    const timer = setTimeout(() => setIsSubscribed(false), 2500);
    return () => clearTimeout(timer);
  }, [isSubscribed]);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  const newArrivals = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);
  }, [products]);

  const bestSellers = useMemo(() => {
    return [...products].sort((a, b) => a.stock - b.stock).slice(0, 8);
  }, [products]);

  const limitedOffers = useMemo(() => {
    return [...products].sort((a, b) => b.price - a.price).slice(0, 8);
  }, [products]);

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    setIsSubscribed(true);
    setNewsletterEmail("");
  };

  return (
    <section className="home-page">
      <div className="container">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="hero-kicker">Premium products at affordable prices</p>
            <h1>Big Sale Up To 50% On Trending Picks</h1>
            <p>
              Shop electronics, clothes, watches, socks, hats, and eye glasses with secure
              checkout and fast delivery.
            </p>
            <div className="hero-cta">
              <Link to="/products" className="btn-primary">
                Shop Now
              </Link>
              <a href="#category-grid" className="btn-secondary hero-secondary-btn">
                Explore Categories
              </a>
            </div>
          </div>

          <div className="hero-media">
            {featuredProducts.slice(0, 3).map((product, index) => (
              <img
                key={product._id}
                src={product.image}
                alt={product.name}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
              />
            ))}
            {featuredProducts.length === 0 ? (
              <div className="hero-fallback">Product showcase appears here</div>
            ) : null}
          </div>
        </section>

        <section className="flash-banner">
          <p>Flash Sale Countdown</p>
          <strong>{formatCountdown(secondsLeft)}</strong>
        </section>

        <section id="category-grid" className="home-section">
          <div className="section-head">
            <h2>Shop By Category</h2>
          </div>
          <div className="category-grid">
            {CATEGORY_TILES.map((category) => (
              <Link
                key={category.name}
                className="category-tile"
                to={`/products?search=${encodeURIComponent(category.search)}`}
              >
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <ProductRailSection title="Featured Products" products={featuredProducts} />
        <ProductRailSection title="New Arrivals" products={newArrivals} />
        <ProductRailSection title="Best Sellers" products={bestSellers} />
        <ProductRailSection title="Limited Offers" products={limitedOffers} />

        <section className="trust-strip">
          {TRUST_POINTS.map((point) => (
            <article key={point.title} className="trust-card">
              <span className="trust-badge">{point.badge}</span>
              <div>
                <h3>{point.title}</h3>
                <p>{point.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="home-section">
          <div className="section-head">
            <h2>Customer Reviews</h2>
          </div>
          <div className="testimonial-grid">
            {TESTIMONIALS.map((review) => (
              <article className="testimonial-card" key={review.name}>
                <p className="stars">5/5 Rating</p>
                <p>{review.text}</p>
                <h3>{review.name}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="newsletter-panel">
          <div>
            <h2>Newsletter Signup</h2>
            <p>Get weekly offers, new arrivals, and flash deal alerts.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Email address"
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              required
            />
            <button type="submit" className="btn-primary">
              Subscribe
            </button>
          </form>
          {isSubscribed ? (
            <p className="newsletter-success">Subscribed successfully. Check your inbox soon.</p>
          ) : null}
        </section>
      </div>
    </section>
  );
};

export default HomePage;
