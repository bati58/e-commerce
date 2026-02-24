import { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { useCart } from "../state/CartContext.jsx";

const CATEGORY_OPTIONS = [
  { label: "Electronics", value: "electronics" },
  { label: "Clothes", value: "clothes" },
  { label: "Watches", value: "watch" },
  { label: "Socks", value: "socks" },
  { label: "Hats", value: "hat" },
  { label: "Eye Glasses", value: "glasses" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("EN");
  const [currency, setCurrency] = useState("USD");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    navigate("/");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = search.trim();
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : "/products");
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    navigate(category ? `/products?search=${encodeURIComponent(category)}` : "/products");
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );
  const accountPath = user ? "/account" : "/login";
  const textLinkClassName = ({ isActive }) => `nav-text-link${isActive ? " active" : ""}`;
  const cartLinkClassName = ({ isActive }) => `icon-pill cart-link${isActive ? " active" : ""}`;
  const mobileBottomLinkClassName = ({ isActive }) =>
    `mobile-bottom-link${isActive ? " active" : ""}`;

  const closeMobilePanels = () => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((previous) => !previous);
    setIsMobileSearchOpen(false);
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen((previous) => !previous);
    setIsMobileMenuOpen(false);
  };

  const handleBottomSearch = () => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(true);
    if (location.pathname !== "/products") {
      navigate("/products");
    }
  };

  const handleWishlistNavigate = () => {
    closeMobilePanels();
    navigate("/products?wishlist=1");
  };

  const isProductsRoute = location.pathname === "/products";
  const wishlistActive = isProductsRoute && location.search.includes("wishlist=1");

  return (
    <header className="navbar">
      <div className="navbar-shell">
        <div className="mobile-top-bar">
          <button
            type="button"
            className="mobile-icon-btn"
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={handleMobileMenuToggle}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link to="/" className="brand mobile-brand" onClick={closeMobilePanels}>
            My Shop
          </Link>

          <div className="mobile-top-actions">
            <button
              type="button"
              className={`mobile-icon-btn${isMobileSearchOpen ? " active" : ""}`}
              aria-label="Open search"
              aria-expanded={isMobileSearchOpen}
              onClick={handleMobileSearchToggle}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
              </svg>
            </button>

            <NavLink to="/cart" className="mobile-icon-btn mobile-cart-btn" onClick={closeMobilePanels}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM18 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 4h2l2.2 10.3A2 2 0 0 0 9.15 16H19a2 2 0 0 0 1.95-1.56L22 8H7.2" />
              </svg>
              {cartCount > 0 ? <span className="mobile-cart-badge">{cartCount}</span> : null}
            </NavLink>
          </div>
        </div>

        <div className={`mobile-search-panel${isMobileSearchOpen ? " open" : ""}`}>
          <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
        </div>

        <div className={`mobile-menu-panel${isMobileMenuOpen ? " open" : ""}`}>
          <div className="mobile-menu-links">
            <NavLink to="/" className={textLinkClassName} onClick={closeMobilePanels}>
              Home
            </NavLink>
            <NavLink to="/products" className={textLinkClassName} onClick={closeMobilePanels}>
              Products
            </NavLink>
            <button
              type="button"
              className={`icon-pill mobile-menu-btn${wishlistActive ? " active" : ""}`}
              onClick={handleWishlistNavigate}
            >
              Wishlist
            </button>
            <NavLink to="/cart" className={cartLinkClassName} onClick={closeMobilePanels}>
              Cart ({cartCount})
            </NavLink>
            <NavLink to={accountPath} className={textLinkClassName} onClick={closeMobilePanels}>
              Account
            </NavLink>
            {user ? (
              <button className="btn-secondary nav-logout" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <NavLink to="/login" className={textLinkClassName} onClick={closeMobilePanels}>
                Login
              </NavLink>
            )}
          </div>

          <div className="mobile-menu-categories">
            <p>Categories</p>
            <div className="mobile-category-list">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="mobile-category-btn"
                  onClick={() =>
                    handleCategoryChange({
                      target: { value: option.value },
                    })
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="desktop-nav-row">
          <Link to="/" className="brand">
            My Shop
          </Link>

          <select className="nav-select" defaultValue="" onChange={handleCategoryChange}>
            <option value="">Categories</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <form className="nav-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="submit" className="nav-search-btn">
              Search
            </button>
          </form>

          <button
            type="button"
            className={`icon-pill${wishlistActive ? " active" : ""}`}
            onClick={handleWishlistNavigate}
            title="View wishlist items"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21c-.25 0-.5-.09-.7-.27C6.15 16.1 3 13.36 3 9.99A4.97 4.97 0 0 1 8 5a4.9 4.9 0 0 1 4 2.03A4.9 4.9 0 0 1 16 5a4.97 4.97 0 0 1 5 4.99c0 3.37-3.15 6.11-8.3 10.74-.2.18-.45.27-.7.27Z" />
            </svg>
            Wishlist
          </button>

          <NavLink to="/cart" className={cartLinkClassName}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM18 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 4h2l2.2 10.3A2 2 0 0 0 9.15 16H19a2 2 0 0 0 1.95-1.56L22 8H7.2" />
            </svg>
            Cart ({cartCount})
          </NavLink>

          <NavLink to="/products" className={textLinkClassName}>
            Products
          </NavLink>

          {user ? (
            <>
              <NavLink to="/account" className={textLinkClassName}>
                Account
              </NavLink>
              <NavLink to="/orders" className={textLinkClassName}>
                My Orders
              </NavLink>
              <button className="btn-secondary nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={textLinkClassName}>
                Login
              </NavLink>
              <NavLink to="/signup" className={textLinkClassName}>
                Sign Up
              </NavLink>
            </>
          )}

          <div className="nav-meta">
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
            <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <NavLink to="/" className={mobileBottomLinkClassName} onClick={closeMobilePanels}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1v-9.5Z" />
          </svg>
          <span>Home</span>
        </NavLink>

        <button
          type="button"
          className={`mobile-bottom-link mobile-bottom-btn${isMobileSearchOpen ? " active" : ""}`}
          onClick={handleBottomSearch}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
          </svg>
          <span>Search</span>
        </button>

        <NavLink
          to="/products?wishlist=1"
          className={mobileBottomLinkClassName}
          onClick={closeMobilePanels}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21c-.25 0-.5-.09-.7-.27C6.15 16.1 3 13.36 3 9.99A4.97 4.97 0 0 1 8 5a4.9 4.9 0 0 1 4 2.03A4.9 4.9 0 0 1 16 5a4.97 4.97 0 0 1 5 4.99c0 3.37-3.15 6.11-8.3 10.74-.2.18-.45.27-.7.27Z" />
          </svg>
          <span>Wishlist</span>
        </NavLink>

        <NavLink to="/cart" className={mobileBottomLinkClassName} onClick={closeMobilePanels}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM18 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 4h2l2.2 10.3A2 2 0 0 0 9.15 16H19a2 2 0 0 0 1.95-1.56L22 8H7.2" />
          </svg>
          <span>Cart</span>
        </NavLink>

        <NavLink to={accountPath} className={mobileBottomLinkClassName} onClick={closeMobilePanels}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 13a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM4 21a8 8 0 0 1 16 0" />
          </svg>
          <span>Account</span>
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
